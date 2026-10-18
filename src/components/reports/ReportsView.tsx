'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  exportMenuCostingCSV,
  exportSupplierPriceChangesCSV,
  generateExecutiveReportPDF,
  parseSalesCSV,
} from '@/lib/reports';

export function ReportsView() {
  const {
    isDemoMode,
    recipeCalculations,
    priceHistory,
    profitLeaks,
    salesRecords,
    importSalesData,
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const businessName = isDemoMode ? 'Velvet Bean & Bakery' : 'PlateProfit Kitchen';

  const handleSalesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus('Parsing sales CSV...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = parseSalesCSV(text);
      if (res.success && res.records.length > 0) {
        importSalesData(res.records);
        setImportStatus(`Successfully imported ${res.records.length} sales rows! Updated sales volume for corresponding menu dishes.`);
      } else {
        setImportError(res.error || 'Failed to parse CSV format.');
        setImportStatus(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleSalesCSV = () => {
    const sample = `Dish Name,Quantity Sold,Unit Price,Date
Artisan Butter Croissant,320,4.75,2026-10-14
Artisan Flat White / Latte,450,5.25,2026-10-14
Ceremonial Matcha Cloud Latte,180,6.50,2026-10-14
San Sebastian Basque Burnt Cheesecake,120,7.50,2026-10-14`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_sales_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Financial Reports & Sales Import
          </h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Export full recipe costings, supplier price histories, and PDF executive reports. Import POS sales CSVs to refresh sales volume weights.
        </p>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Menu Costing CSV */}
        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Menu Costing Report (CSV)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Download clean spreadsheet detailing selling prices, variable food and packaging costs, contributions, and margins.
            </p>
          </div>
          <button
            onClick={() => exportMenuCostingCSV(recipeCalculations)}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#15223c] hover:bg-emerald-600 hover:text-white text-emerald-300 border border-[#1e3256] text-xs font-bold transition"
          >
            <Download className="h-4 w-4" /> Download Menu CSV
          </button>
        </div>

        {/* Card 2: Supplier Price Change History CSV */}
        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-lg bg-rose-500/10 text-rose-400 mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Supplier Price Change Log (CSV)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Audit trail of every confirmed price hike, unit price jumps, invoice references, and supplier details.
            </p>
          </div>
          <button
            onClick={() => exportSupplierPriceChangesCSV(priceHistory)}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#15223c] hover:bg-rose-600 hover:text-white text-rose-300 border border-[#1e3256] text-xs font-bold transition"
          >
            <Download className="h-4 w-4" /> Download Price Changes CSV
          </button>
        </div>

        {/* Card 3: Executive PDF Report */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-[#0e172a] to-[#111c35] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-lg bg-emerald-500/20 text-emerald-300 mb-3">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Executive Profit Report (PDF)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generate formatted client-side PDF summarizing top profit leaks, menu margin health, and accounting notices.
            </p>
          </div>
          <button
            onClick={() => generateExecutiveReportPDF(businessName, recipeCalculations, profitLeaks)}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition"
          >
            <Download className="h-4 w-4" /> Generate Executive PDF
          </button>
        </div>
      </div>

      {/* POS Sales CSV Import Section */}
      <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e3256] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-400" />
              Import Sales Data (CSV)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync dish sales volumes directly from your Square, Toast, Clover, or custom spreadsheet to power Profit Leak Radar weights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSampleSalesCSV}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#15223c] border border-[#1e3256]"
            >
              Download Sample CSV Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Sales CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleSalesUpload}
              className="hidden"
            />
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Sales Records Log Table */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Recent Sales Imports ({salesRecords.length} records)
          </h4>

          {salesRecords.length > 0 ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border border-[#1e3256]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e3256] bg-[#111c35] text-slate-400">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Dish Name</th>
                    <th className="py-2.5 px-3">Quantity Sold</th>
                    <th className="py-2.5 px-3">Recorded Menu Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3256]/50">
                  {salesRecords.map((s) => (
                    <tr key={s.id} className="hover:bg-[#15223c]/40">
                      <td className="py-2 px-3 font-mono text-slate-300">{s.periodDate}</td>
                      <td className="py-2 px-3 text-white font-medium">{s.dishName}</td>
                      <td className="py-2 px-3 text-emerald-400 font-mono font-bold">
                        {s.quantitySold} units
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono">
                        ${s.recordedPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-[#15223c]/30 rounded-lg">
              No sales records imported yet. Upload a CSV using the button above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
