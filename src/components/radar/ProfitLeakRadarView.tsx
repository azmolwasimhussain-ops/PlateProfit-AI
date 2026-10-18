'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Radar,
  Sparkles,
  RefreshCw,
  Cpu,
  CheckCircle2,
  ChevronDown,
  Sliders,
} from 'lucide-react';

export function ProfitLeakRadarView() {
  const {
    profitLeaks,
    ollamaConfig,
    runAiProfitAnalysis,
    aiAnalysis,
    isAnalyzing,
    setActiveTab,
  } = useApp();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const totalPeriodicLeak = profitLeaks.reduce((sum, item) => sum + item.totalPeriodicLeakAmount, 0);
  const totalAnnualizedLeak = profitLeaks.reduce((sum, item) => sum + item.annualizedLeakAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Radar className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Profit Leak Radar
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Detects verified supplier price changes, calculates recipe-level impact, and ranks leakage by total dollar cost.
          </p>
        </div>

        {/* AI Analysis Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => runAiProfitAnalysis()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing via {ollamaConfig.status === 'connected' ? ollamaConfig.selectedModel : 'Rules Engine'}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-200" />
                Explain Leaks with Local AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Aggregate Shock Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 shadow-md">
          <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
            Total Periodic Margin Leak
          </div>
          <div className="mt-2 text-3xl font-extrabold text-rose-400">
            ${totalPeriodicLeak.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Direct unbudgeted supplier cost increase across current sales volume.
          </div>
        </div>

        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Annualized Impact If Unchecked
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            ${totalAnnualizedLeak.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Cumulative annual gross profit eroded without price or portion compensation.
          </div>
        </div>

        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Analysis Engine
          </div>
          <div className="mt-2 text-sm font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            {ollamaConfig.status === 'connected' ? (
              <span className="text-emerald-400">Ollama: {ollamaConfig.selectedModel}</span>
            ) : (
              <span className="text-slate-300">Deterministic Economics Engine</span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {ollamaConfig.status === 'connected'
              ? 'Local open-weight LLM active. Zero data leaves your machine.'
              : 'Ollama is offline; falling back to verified deterministic rules.'}
          </div>
        </div>
      </div>

      {/* AI Explanation / Rule-based Card */}
      {aiAnalysis && (
        <div className="rounded-xl border border-emerald-500/40 bg-[#0e172a] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border-b border-l border-emerald-500/30 rounded-bl-lg flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            {aiAnalysis.isAiGenerated ? `AI Insight: ${aiAnalysis.modelUsed}` : `Rule-Based Advisory: ${aiAnalysis.modelUsed}`}
          </div>

          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Executive Profit Intelligence Summary
            </h3>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              {aiAnalysis.summary}
            </p>

            <div className="mt-4 p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200">
              <strong className="text-emerald-300">Executive Takeaway:</strong> {aiAnalysis.executiveTakeaway}
            </div>

            {/* Drivers */}
            {aiAnalysis.keyDrivers.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Primary Cost Drivers:
                </h4>
                <ul className="space-y-1.5">
                  {aiAnalysis.keyDrivers.map((driver, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Concrete Actions */}
            {aiAnalysis.recommendations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#1e3256]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Recommended Action Plan:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiAnalysis.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-lg bg-[#15223c] border border-[#1e3256] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{rec.title}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              rec.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{rec.rationale}</p>
                        <p className="text-xs text-emerald-300 font-medium mt-2 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          &rarr; {rec.suggestedAction}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#1e3256]/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Potential Savings:</span>
                        <span className="font-bold text-emerald-400">
                          +${rec.estimatedPeriodicSavings.toFixed(2)}/cycle
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranked Leaks Table */}
      <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Ranked Impact Details</h3>
            <p className="text-xs text-slate-400">
              Sorted by periodic financial leakage magnitude. Click an item to view formula and assumptions.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-[#15223c] px-3 py-1 rounded-full border border-[#1e3256]">
            {profitLeaks.length} Shocks Detected
          </span>
        </div>

        {profitLeaks.length > 0 ? (
          <div className="space-y-3">
            {profitLeaks.map((leak, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={`${leak.recipeId}_${leak.ingredientId}`}
                  className={`rounded-lg border transition-all ${
                    isExpanded
                      ? 'border-rose-500/50 bg-[#15223c]'
                      : 'border-[#1e3256] bg-[#0e172a] hover:border-slate-600'
                  }`}
                >
                  {/* Summary Row */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{leak.recipeName}</h4>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#1e3256]">
                            {leak.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ingredient:{' '}
                          <span className="text-slate-200 font-medium">{leak.ingredientName}</span> ({leak.supplier})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-rose-400">
                          -${leak.totalPeriodicLeakAmount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">per {leak.salesPeriod}</div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-slate-200">
                          {leak.previousMarginPct}% &rarr; {leak.currentMarginPct}%
                        </div>
                        <div className="text-[10px] text-rose-300">
                          -{leak.marginDropPct}% margin drop
                        </div>
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Calculation Proof */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#1e3256] text-xs space-y-3 bg-[#0b1324]/80 rounded-b-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded bg-[#15223c] border border-[#1e3256]">
                          <span className="text-[11px] text-slate-400 block">Unit Cost Shock</span>
                          <span className="text-xs font-bold text-white mt-1 block">
                            ${leak.oldUnitCost.toFixed(2)} &rarr; ${leak.newUnitCost.toFixed(2)} / {leak.unit}
                          </span>
                          <span className="text-[10px] text-rose-400">
                            +{leak.percentPriceIncrease}% (+${leak.unitCostDelta.toFixed(2)}/{leak.unit})
                          </span>
                        </div>

                        <div className="p-3 rounded bg-[#15223c] border border-[#1e3256]">
                          <span className="text-[11px] text-slate-400 block">Recipe Portion Impact</span>
                          <span className="text-xs font-bold text-white mt-1 block">
                            {leak.quantityPerServing} {leak.unit} per serving
                          </span>
                          <span className="text-[10px] text-rose-300">
                            +${leak.costDeltaPerServing.toFixed(4)} additional cost / plate
                          </span>
                        </div>

                        <div className="p-3 rounded bg-[#15223c] border border-[#1e3256]">
                          <span className="text-[11px] text-slate-400 block">Volume Multiplier</span>
                          <span className="text-xs font-bold text-white mt-1 block">
                            {leak.salesVolume} servings / {leak.salesPeriod}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Annualized leak: ${leak.annualizedLeakAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Deterministic Formula Proof */}
                      <div className="p-3 rounded bg-[#0e172a] border border-[#1e3256] font-mono text-[11px] text-slate-300">
                        <div className="text-slate-400 text-[10px] font-sans font-bold uppercase mb-1">
                          Deterministic Formula & Calculations:
                        </div>
                        <div>
                          Serving Delta = ({leak.quantityPerServing} {leak.unit}) &times; (+${leak.unitCostDelta.toFixed(2)}/{leak.unit}) = +${leak.costDeltaPerServing.toFixed(4)}
                        </div>
                        <div>
                          Periodic Leak = +${leak.costDeltaPerServing.toFixed(4)} &times; {leak.salesVolume} sales = -${leak.totalPeriodicLeakAmount.toFixed(2)} / {leak.salesPeriod}
                        </div>
                        <div>
                          Contribution = ${leak.previousContributionPerServing.toFixed(2)} &rarr; ${leak.currentContributionPerServing.toFixed(2)} per serving
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setActiveTab('whatif')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          Simulate Price Adjustment in Sandbox &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white text-sm">No Profit Leaks Detected</p>
            <p className="mt-1">
              All ingredients are currently priced at or below their recorded baseline costs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
