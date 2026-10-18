import { describe, it, expect } from 'vitest';
import { parseInvoiceText } from '../ocr';
import { Ingredient } from '@/types';

describe('Invoice OCR & Parsing', () => {
  const sampleIngredients: Ingredient[] = [
    {
      id: 'ing_1',
      name: 'European Unsalted Butter 82%',
      category: 'Dairy',
      supplier: 'Alps Dairy Co.',
      defaultUnit: 'g',
      packSize: 5,
      packUnit: 'kg',
      packCost: 40.0,
      costPerDefaultUnit: 0.008,
      lastUpdated: '2026-10-01',
    },
    {
      id: 'ing_2',
      name: 'Whole Milk',
      category: 'Dairy',
      supplier: 'Valley Farms',
      defaultUnit: 'ml',
      packSize: 10,
      packUnit: 'l',
      packCost: 18.0,
      costPerDefaultUnit: 0.0018,
      lastUpdated: '2026-10-01',
    },
  ];

  it('correctly parses structured invoice text with arithmetic validation', () => {
    const rawInvoice = `
ALPS DAIRY CO. - TAX INVOICE
Invoice #: INV-9902
Date: 14 Oct 2026
European Unsalted Butter 82%   5  kg  9.60  48.00
Whole Milk                     10 l   1.95  19.50
Total: $67.50
    `;

    const parsed = parseInvoiceText(rawInvoice, sampleIngredients, 'test.pdf');
    expect(parsed.invoiceNumber).toBe('INV-9902');
    expect(parsed.lineItems.length).toBe(2);

    const butterItem = parsed.lineItems[0];
    expect(butterItem.description).toContain('Butter');
    expect(butterItem.quantity).toBe(5);
    expect(butterItem.unit).toBe('kg');
    expect(butterItem.unitPrice).toBe(9.6);
    expect(butterItem.lineTotal).toBe(48.0);
    expect(butterItem.arithmeticMismatch).toBe(false);
    expect(butterItem.matchedIngredientId).toBe('ing_1');
    expect(butterItem.verified).toBe(false); // human review required!
  });

  it('detects and flags arithmetic mismatches for human review', () => {
    // 5 * 10 = 50, but invoice print error says 65.00
    const rawWithTypo = `
Invoice #: INV-TYPO
European Butter 82%   5  kg  10.00  65.00
    `;

    const parsed = parseInvoiceText(rawWithTypo, sampleIngredients);
    expect(parsed.lineItems.length).toBe(1);
    const item = parsed.lineItems[0];
    expect(item.arithmeticMismatch).toBe(true);
    expect(item.calculatedTotal).toBe(50.0);
    expect(item.lineTotal).toBe(65.0);
  });
});
