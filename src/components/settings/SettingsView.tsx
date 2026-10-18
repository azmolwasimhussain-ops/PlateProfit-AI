'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  HardDrive,
  Server,
  Terminal,
  FlaskConical,
} from 'lucide-react';
import { exportBackupJSON, parseBackupJSON } from '@/lib/storage';

export function SettingsView() {
  const {
    isDemoMode,
    toggleDemoMode,
    ollamaConfig,
    updateOllamaConfig,
    testOllamaConnection,
    ingredients,
    recipes,
    priceHistory,
    invoices,
    salesRecords,
    loadFullBackup,
    resetAllData,
  } = useApp();

  const [endpointInput, setEndpointInput] = useState(ollamaConfig.endpoint);
  const [selectedModelInput, setSelectedModelInput] = useState(ollamaConfig.selectedModel);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleTestOllama = async () => {
    setIsTesting(true);
    setTestResult(null);
    updateOllamaConfig({ endpoint: endpointInput.trim() });

    const ok = await testOllamaConnection();
    setIsTesting(false);
    if (ok) {
      setTestResult({
        success: true,
        message: 'Successfully connected to local Ollama server! Models retrieved.',
      });
    } else {
      setTestResult({
        success: false,
        message:
          'Could not connect to Ollama. Ensure Ollama is running (`ollama serve`) and accessible at this local address.',
      });
    }
  };

  const handleExportBackup = () => {
    exportBackupJSON(ingredients, recipes, priceHistory, invoices, salesRecords);
    setBackupNotice('Full JSON backup downloaded.');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backup = parseBackupJSON(text);
        loadFullBackup(backup);
        setBackupNotice(`Restored backup with ${backup.ingredients.length} ingredients and ${backup.recipes.length} recipes.`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid backup file';
        alert(`Error importing backup: ${message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Settings className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Settings & Local AI Configuration
          </h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Configure local open-weight model endpoints, audit local storage, export backups, and review privacy architecture.
        </p>
      </div>

      {backupNotice && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Ollama Local Model Setup */}
        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1e3256] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              Ollama Local Model Server
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                ollamaConfig.status === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {ollamaConfig.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Local Ollama Endpoint (Default: http://localhost:11434)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 rounded bg-[#15223c] border border-[#1e3256] px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleTestOllama}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition disabled:opacity-60"
                >
                  {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Server className="h-3.5 w-3.5" />}
                  Test Connection
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Restricted to localhost/LAN addresses for security. The Ollama port is never exposed to public internet.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Active Open-Weight Model
              </label>
              {ollamaConfig.availableModels && ollamaConfig.availableModels.length > 0 ? (
                <select
                  value={selectedModelInput}
                  onChange={(e) => {
                    setSelectedModelInput(e.target.value);
                    updateOllamaConfig({ selectedModel: e.target.value });
                  }}
                  className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {ollamaConfig.availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedModelInput}
                  onChange={(e) => {
                    setSelectedModelInput(e.target.value);
                    updateOllamaConfig({ selectedModel: e.target.value });
                  }}
                  placeholder="llama3.2:latest, gemma2:2b, mistral"
                  className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              )}
            </div>

            {/* Quick Terminal Guide */}
            <div className="p-3.5 rounded-lg bg-[#080e1a] border border-[#1e3256] space-y-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Quick Local Model Setup Instructions:
              </span>
              <p className="text-[11px] text-slate-400">
                1. Download Ollama from <code className="text-cyan-300">ollama.com</code> if not already installed.
              </p>
              <div className="p-2 rounded bg-[#040810] font-mono text-[11px] text-slate-300 border border-[#1e3256]">
                # Pull and run recommended lightweight model<br />
                ollama run llama3.2<br />
                # or lightweight Gemma<br />
                ollama run gemma2:2b
              </div>
              <p className="text-[10px] text-slate-500">
                Models run entirely locally on your CPU/GPU. No monthly cloud API fees.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Data Management & Privacy */}
        <div className="space-y-6">
          {/* Data Backup Card */}
          <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1e3256] pb-3">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              Local Data Storage & Backups
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                All ingredients, recipes, price logs, and invoices are stored exclusively in your browser&apos;s local sandbox storage.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#15223c] hover:bg-emerald-600 hover:text-white text-emerald-300 border border-[#1e3256] font-semibold transition"
                >
                  <Download className="h-3.5 w-3.5" /> Export Full JSON Backup
                </button>

                <button
                  onClick={() => backupInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#15223c] hover:bg-cyan-600 hover:text-white text-cyan-300 border border-[#1e3256] font-semibold transition"
                >
                  <Upload className="h-3.5 w-3.5" /> Restore Backup JSON
                </button>
                <input
                  ref={backupInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </div>

              {/* Reset Data Danger Zone */}
              <div className="pt-3 border-t border-[#1e3256]">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to completely erase all local data? This cannot be undone.')) {
                      resetAllData();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Reset Local Database to Empty
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Governance Notice */}
          <div className="rounded-xl border border-emerald-500/30 bg-[#0e172a] p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Privacy & Financial Governance Statement
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Local-First Guarantee:</strong> Your recipes, proprietary ratios, supplier invoices, and margins never leave this machine.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Strict Financial Separation:</strong> Mathematical calculations (contribution margin %, serving costs, dollar leakages) are computed with deterministic functions. Local AI models are used only for executive explanations and suggestions, never to fabricate financial facts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Not Professional Accounting Advice:</strong> Contribution margins reflect variable food and packaging costs. Fixed overhead (rent, labor, permits, taxes) must be budgeted separately.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="rounded-xl border border-amber-500/30 bg-[#0e172a] p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e3256] pb-3 mb-4">
          <FlaskConical className="h-4 w-4 text-amber-400" />
          Demo Mode
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Demo Mode loads fictional sample data (Velvet Bean &amp; Bakery) so you can explore all features
          without entering real business data. Switching off restores your saved real data. Sample figures are
          clearly labelled and should not be used for actual business decisions.
        </p>
        <button
          onClick={toggleDemoMode}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition border ${
            isDemoMode
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              : 'bg-[#15223c] border-[#1e3256] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'
          }`}
        >
          {isDemoMode ? '⚗ Demo Mode Active — Click to Switch to Real Data' : '⚗ Enable Demo Mode (sample data)'}
        </button>
      </div>
    </div>
  );
}
