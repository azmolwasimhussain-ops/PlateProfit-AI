import { RecipeCalculationResult, PriceHistoryEntry, ProfitLeakItem } from '@/types';
import jsPDF from 'jspdf';

/**
 * Generates and downloads a CSV of all menu recipe costings and contribution margins.
 */
export function exportMenuCostingCSV(calculations: RecipeCalculationResult[]): void {
  const headers = [
    'Recipe Name',
    'Servings',
    'Selling Price ($)',
    'Ingredient Cost / Serving ($)',
    'Packaging Cost / Serving ($)',
    'Other Variable Cost / Serving ($)',
    'Total Variable Cost / Serving ($)',
    'Contribution / Serving ($)',
    'Contribution Margin (%)',
    'Target Margin (%)',
    'Status',
    'Warnings',
  ];

  const rows = calculations.map((c) => [
    `"${c.recipeName.replace(/"/g, '""')}"`,
    c.servings,
    c.sellingPrice.toFixed(2),
    c.ingredientCostPerServing.toFixed(2),
    c.packagingCostPerServing.toFixed(2),
    c.otherVariableCostPerServing.toFixed(2),
    c.totalVariableCostPerServing.toFixed(2),
    c.contributionPerServing.toFixed(2),
    c.contributionMarginPct !== null ? `${c.contributionMarginPct.toFixed(1)}%` : 'N/A',
    `${c.targetMarginPct}%`,
    c.marginHealth.toUpperCase(),
    `"${c.warnings.join('; ').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'text/csv;charset=utf-8;', `plateprofit_menu_costing_${getTodayString()}.csv`);
}

/**
 * Generates and downloads a CSV of supplier price changes and calculated leak impacts.
 */
export function exportSupplierPriceChangesCSV(
  history: PriceHistoryEntry[]
): void {
  const headers = [
    'Date',
    'Ingredient Name',
    'Supplier',
    'Old Pack Cost ($)',
    'New Pack Cost ($)',
    'Pack Size & Unit',
    'Old Unit Cost ($)',
    'New Unit Cost ($)',
    'Unit Cost Delta ($)',
    'Price Change (%)',
    'Verification Source',
    'Invoice Ref',
  ];

  const rows = history.map((h) => [
    h.date,
    `"${h.ingredientName.replace(/"/g, '""')}"`,
    `"${h.supplier.replace(/"/g, '""')}"`,
    h.oldPackCost.toFixed(2),
    h.newPackCost.toFixed(2),
    `"${h.packSize} ${h.packUnit}"`,
    h.oldUnitCost.toFixed(4),
    h.newUnitCost.toFixed(4),
    h.deltaCost.toFixed(4),
    `${h.percentDelta > 0 ? '+' : ''}${h.percentDelta.toFixed(1)}%`,
    h.source,
    h.invoiceRef || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'text/csv;charset=utf-8;', `plateprofit_supplier_price_changes_${getTodayString()}.csv`);
}

/**
 * Generates a clean printable PDF executive report.
 */
export function generateExecutiveReportPDF(
  businessName: string,
  calculations: RecipeCalculationResult[],
  leaks: ProfitLeakItem[]
): void {
  const doc = new jsPDF();
  let y = 20;

  // Header Title
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('PlateProfit AI - Profit Intelligence Report', 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Business: ${businessName} | Date: ${new Date().toLocaleDateString()} | Local-First Verified Analysis`, 14, y);

  y += 12;
  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  // Executive Summary Card
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Profit Leak Radar Summary', 14, y);

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  const totalLeakPeriodic = leaks.reduce((s, l) => s + l.totalPeriodicLeakAmount, 0);
  doc.text(`Active Price Shocks Detected: ${leaks.length}`, 14, y);
  y += 6;
  doc.text(`Total Periodic Gross Margin Leak: $${totalLeakPeriodic.toFixed(2)}`, 14, y);

  if (leaks.length > 0) {
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Top Affected Menu Items:', 14, y);
    y += 6;

    leaks.slice(0, 5).forEach((leak, idx) => {
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const text = `${idx + 1}. ${leak.recipeName} - ${leak.ingredientName} +${leak.percentPriceIncrease}% (Leak: -$${leak.totalPeriodicLeakAmount.toFixed(2)} / ${leak.salesPeriod})`;
      doc.text(text, 18, y);
      y += 5;
    });
  }

  // Menu Margins Section
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Menu Recipes & Contribution Margins', 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Dish Name', 14, y);
  doc.text('Price', 80, y);
  doc.text('Var. Cost', 110, y);
  doc.text('Contribution', 140, y);
  doc.text('Margin %', 170, y);

  y += 4;
  doc.line(14, y, 196, y);
  y += 6;

  calculations.forEach((c) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(c.recipeName.slice(0, 32), 14, y);
    doc.text(`$${c.sellingPrice.toFixed(2)}`, 80, y);
    doc.text(`$${c.totalVariableCostPerServing.toFixed(2)}`, 110, y);
    doc.text(`$${c.contributionPerServing.toFixed(2)}`, 140, y);
    doc.text(c.contributionMarginPct !== null ? `${c.contributionMarginPct.toFixed(1)}%` : 'N/A', 170, y);
    y += 6;
  });

  // Footer Disclaimer
  y += 14;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'IMPORTANT DISCLAIMER: Contribution margin represents selling price minus variable food and packaging costs.',
    14,
    y
  );
  y += 4;
  doc.text(
    'It does not include fixed overhead (rent, utilities, labor) and should not be confused with net profit. Local model output provides suggestions only.',
    14,
    y
  );

  doc.save(`plateprofit_report_${getTodayString()}.pdf`);
}

/**
 * Parses user-uploaded sales CSV with automatic column mapping.
 */
export function parseSalesCSV(csvText: string): {
  success: boolean;
  records: Array<{ dishName: string; quantitySold: number; recordedPrice: number; periodDate: string }>;
  error?: string;
} {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { success: false, records: [], error: 'CSV file is empty or missing data rows.' };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.replace(/["']/g, '').trim());

  // Find column indices
  const nameIdx = headers.findIndex((h) => h.includes('dish') || h.includes('item') || h.includes('name') || h.includes('product'));
  const qtyIdx = headers.findIndex((h) => h.includes('qty') || h.includes('quantity') || h.includes('sold') || h.includes('volume') || h.includes('count'));
  const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('rate') || h.includes('revenue') || h.includes('amount'));
  const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('day') || h.includes('period'));

  if (nameIdx === -1 || qtyIdx === -1) {
    return {
      success: false,
      records: [],
      error: 'Could not identify dish name and quantity columns. Please ensure headers contain "Dish" and "Quantity".',
    };
  }

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.replace(/["']/g, '').trim());
    if (cols.length <= Math.max(nameIdx, qtyIdx)) continue;

    const dishName = cols[nameIdx];
    const quantitySold = parseFloat(cols[qtyIdx]);
    const recordedPrice = priceIdx !== -1 ? parseFloat(cols[priceIdx]) || 0 : 0;
    const periodDate = dateIdx !== -1 ? cols[dateIdx] : getTodayString();

    if (dishName && !isNaN(quantitySold) && quantitySold > 0) {
      records.push({
        dishName,
        quantitySold,
        recordedPrice,
        periodDate,
      });
    }
  }

  return { success: true, records };
}

function downloadBlob(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
