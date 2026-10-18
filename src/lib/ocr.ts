import { ExtractedInvoice, InvoiceLineItem, Ingredient } from '@/types';
import { normalizeUnit } from './units';

export interface OCRProcessResult {
  success: boolean;
  invoice?: ExtractedInvoice;
  rawText: string;
  error?: string;
}

/**
 * Parses raw text extracted from an invoice or receipt into structured line items.
 * Applies arithmetic validation (Quantity * Rate ≈ Total).
 * Performs fuzzy ingredient matching.
 */
export function parseInvoiceText(
  rawText: string,
  existingIngredients: Ingredient[],
  fileName?: string
): ExtractedInvoice {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const items: InvoiceLineItem[] = [];

  // Attempt to extract invoice number and supplier
  let invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  let supplier = 'Supplier';
  let invoiceDate = new Date().toISOString().split('T')[0];

  for (const line of lines) {
    const invMatch = line.match(/(?:invoice|inv|bill)[\s#.:-]*([a-z0-9-_]+)/i);
    if (invMatch && invMatch[1]) {
      invoiceNumber = invMatch[1].toUpperCase();
    }
    const dateMatch = line.match(/(?:date)[\s:-]*(\d{1,2}[-/\s][a-z0-9]+[-/\s]\d{2,4})/i);
    if (dateMatch && dateMatch[1]) {
      invoiceDate = dateMatch[1];
    }
    if (line.match(/(?:co\.|ltd|farms|dairy|roasters|mills|foods|wholesale|distributors)/i)) {
      if (supplier === 'Supplier') {
        supplier = line.split('-')[0].trim();
      }
    }
  }

  // Regex for parsing line items:
  // Examples:
  // "European Butter 82%   5  kg  9.60  48.00"
  // "Organic Whole Milk | 10 | l | 1.95 | 19.50"
  // "10x Free-Range Eggs @ 0.35 = 3.50"
  const lineRegex = /^(.*?)(?:\s+|[|,])+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?(?:\s+|[|,@x*])+(\d+(?:\.\d+)?)(?:\s+|[|,=])+(\d+(?:\.\d+)?)$/;

  let lineCounter = 1;

  for (const line of lines) {
    // Ignore common non-item lines
    if (
      line.match(/^(total|subtotal|tax|vat|gst|date|sold to|invoice|payment|terms|item description|balance)/i)
    ) {
      continue;
    }

    const match = line.match(lineRegex);
    if (match) {
      const rawDesc = match[1].replace(/^[0-9#.-]+\s*/, '').trim();
      const qty = parseFloat(match[2]);
      const rawUnit = match[3] || 'unit';
      const unit = normalizeUnit(rawUnit);
      const unitPrice = parseFloat(match[4]);
      const total = parseFloat(match[5]);

      if (rawDesc.length > 2 && !isNaN(qty) && !isNaN(unitPrice) && !isNaN(total)) {
        const calculatedTotal = Number((qty * unitPrice).toFixed(2));
        const arithmeticMismatch = Math.abs(calculatedTotal - total) > 0.05;

        // Match with existing ingredient
        const matched = findBestIngredientMatch(rawDesc, existingIngredients);

        items.push({
          id: `li_extracted_${lineCounter++}`,
          rawText: line,
          description: rawDesc,
          matchedIngredientId: matched?.id,
          matchedIngredientName: matched?.name,
          isNewIngredient: !matched,
          quantity: qty,
          unit,
          unitPrice,
          lineTotal: total,
          calculatedTotal,
          arithmeticMismatch,
          confidence: arithmeticMismatch ? 0.65 : 0.92,
          verified: false, // must be confirmed by human
        });
      }
    }
  }

  // If table regex found nothing, attempt a more forgiving numeric scan
  if (items.length === 0) {
    for (const line of lines) {
      const numbers = line.match(/\d+(?:\.\d+)?/g);
      if (numbers && numbers.length >= 2) {
        const words = line.replace(/[\d.,$€£%]/g, '').trim();
        if (words.length > 3 && !line.match(/total|balance|due|date|tax/i)) {
          const num1 = parseFloat(numbers[0]);
          const num2 = parseFloat(numbers[numbers.length - 1]);
          const qty = num1 < 1000 ? num1 : 1;
          const total = num2;
          const unitPrice = qty > 0 ? Number((total / qty).toFixed(2)) : total;

          const matched = findBestIngredientMatch(words, existingIngredients);

          items.push({
            id: `li_extracted_${lineCounter++}`,
            rawText: line,
            description: words,
            matchedIngredientId: matched?.id,
            matchedIngredientName: matched?.name,
            isNewIngredient: !matched,
            quantity: qty,
            unit: 'unit',
            unitPrice,
            lineTotal: total,
            calculatedTotal: Number((qty * unitPrice).toFixed(2)),
            arithmeticMismatch: false,
            confidence: 0.6,
            verified: false,
          });
        }
      }
    }
  }

  const computedTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: `inv_${Date.now()}`,
    invoiceNumber,
    supplier,
    date: invoiceDate,
    rawText,
    fileName,
    totalAmount: Number(computedTotal.toFixed(2)),
    lineItems: items,
    status: 'pending_review',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fuzzy matches an invoice description to existing ingredient catalog.
 */
function findBestIngredientMatch(desc: string, ingredients: Ingredient[]): Ingredient | undefined {
  const cleanDesc = desc.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const descWords = cleanDesc.split(/\s+/).filter((w) => w.length > 2);

  let bestMatch: Ingredient | undefined = undefined;
  let maxScore = 0;

  for (const ing of ingredients) {
    const cleanIngName = ing.name.toLowerCase();
    if (cleanIngName === cleanDesc || cleanDesc.includes(cleanIngName) || cleanIngName.includes(cleanDesc)) {
      return ing;
    }

    let matchCount = 0;
    for (const w of descWords) {
      if (cleanIngName.includes(w)) matchCount++;
    }

    const score = matchCount / Math.max(descWords.length, 1);
    if (score > 0.5 && score > maxScore) {
      maxScore = score;
      bestMatch = ing;
    }
  }

  return bestMatch;
}

/**
 * Runs Tesseract.js in the browser environment.
 * If running in Node or worker fails, falls back gracefully.
 */
export async function runLocalOCR(
  fileOrUrl: File | string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  // Dynamic import of tesseract.js for client-side execution
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');

  try {
    if (onProgress) {
      onProgress(20, 'Initializing local OCR engine...');
    }

    const ret = await worker.recognize(fileOrUrl);

    if (onProgress) {
      onProgress(100, 'OCR extraction complete.');
    }

    await worker.terminate();
    return ret.data.text;
  } catch (err: unknown) {
    await worker.terminate();
    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Local OCR processing error: ${msg}`);
  }
}
