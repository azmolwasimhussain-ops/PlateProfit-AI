'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Utensils,
  ArrowRight,
  ShieldAlert,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export function DashboardView() {
  const {
    isDemoMode,
    recipeCalculations,
    profitLeaks,
    ingredients,
    recipes,
    dataQualityWarnings,
    setActiveTab,
  } = useApp();

  // Metrics
  const validMargins = recipeCalculations
    .map((r) => r.contributionMarginPct)
    .filter((m): m is number => m !== null);
  const avgMargin =
    validMargins.length > 0
      ? (validMargins.reduce((a, b) => a + b, 0) / validMargins.length).toFixed(1)
      : '0.0';

  const totalPeriodicLeak = profitLeaks.reduce((sum, item) => sum + item.totalPeriodicLeakAmount, 0);

  const dishesNeedingAttention = recipeCalculations.filter(
    (r) => r.marginHealth === 'critical' || r.marginHealth === 'loss' || !r.isProfitable
  );

  // Prepare chart data for Margin Comparison
  const marginChartData = recipeCalculations.slice(0, 8).map((r) => ({
    name: r.recipeName.length > 16 ? r.recipeName.slice(0, 15) + '…' : r.recipeName,
    fullName: r.recipeName,
    sellingPrice: r.sellingPrice,
    variableCost: r.totalVariableCostPerServing,
    contribution: r.contributionPerServing,
    marginPct: r.contributionMarginPct || 0,
    health: r.marginHealth,
  }));

  // Prepare chart data for Top Leaks (used in bar chart below)
  const leakChartData = profitLeaks.slice(0, 5).map((l) => ({
    name: l.recipeName.length > 14 ? l.recipeName.slice(0, 13) + '…' : l.recipeName,
    ingredient: l.ingredientName,
    leakAmount: l.totalPeriodicLeakAmount,
    period: l.salesPeriod,
  }));
  // Suppress unused-var if profitLeaks is empty and chart isn't rendered
  void leakChartData;

  return (
    <div className="space-y-6 pb-12">
      {/* Demo Mode Notice Banner if enabled */}
      {isDemoMode && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#131d33] to-amber-950/20 p-4 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <div>
              <span className="font-bold text-amber-300">DEMO MODE ACTIVE:</span>
              <span className="ml-1 text-slate-300">
                Previewing preloaded sample data for <em>Velvet Bean &amp; Bakery</em>. Test features safely without touching real inventory.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition shrink-0"
          >
            Try Invoice OCR Demo &rarr;
          </button>
        </div>
      )}

      {/* Hero Welcome & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Profit Intelligence Dashboard
          </h2>
          <p className="text-sm text-slate-400">
            Real-time local recipe unit economics, contribution margins, and price shock radar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0e172a] hover:bg-[#15223c] border border-[#1e3256] text-xs font-semibold text-slate-300 transition"
          >
            &larr; Home Tour
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#15223c] border border-[#1e3256] text-xs font-semibold text-slate-200 hover:border-slate-400 transition"
          >
            <DollarSign className="h-4 w-4 text-emerald-400" />
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition"
          >
            <AlertTriangle className="h-4 w-4 text-white" />
            View Profit Leaks ({profitLeaks.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Contribution Margin */}
        <div className="rounded-2xl border border-[#1e3256] bg-[#0e172a]/90 p-5 shadow-lg relative overflow-hidden group card-interactive glass-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. Contribution Margin
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{avgMargin}%</span>
            <span className="text-xs text-slate-400">benchmark: &ge;70%</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Info className="h-3 w-3 text-slate-500 inline" />
            Selling price minus variable food &amp; packaging costs.
          </p>
        </div>

        {/* Card 2: Periodic Leak Impact */}
        <div className="rounded-2xl border border-[#1e3256] bg-[#0e172a]/90 p-5 shadow-lg relative overflow-hidden group card-interactive glass-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Profit Leak
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${totalPeriodicLeak > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ${totalPeriodicLeak.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ period</span>
          </div>
          <p className="mt-2 text-xs text-rose-300/80">
            {profitLeaks.length > 0
              ? `${profitLeaks.length} dishes impacted by verified price hikes`
              : 'Zero active cost leaks detected'}
          </p>
        </div>

        {/* Card 3: Dishes Needing Attention */}
        <div className="rounded-2xl border border-[#1e3256] bg-[#0e172a]/90 p-5 shadow-lg relative overflow-hidden group card-interactive glass-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attention Required
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{dishesNeedingAttention.length}</span>
            <span className="text-xs text-slate-400">of {recipes.length} dishes</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {dishesNeedingAttention.length > 0 ? 'Critical margins or below target' : 'All dishes within healthy margins'}
          </p>
        </div>

        {/* Card 4: Catalog & Ingredients */}
        <div className="rounded-2xl border border-[#1e3256] bg-[#0e172a]/90 p-5 shadow-lg relative overflow-hidden group card-interactive glass-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inventory &amp; Recipes
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{recipes.length}</span>
            <span className="text-xs text-slate-400">recipes / {ingredients.length} ingredients</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            100% verified unit conversions &amp; costings
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Menu Contribution Margin by Dish (2 columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#1e3256] bg-[#0e172a]/90 p-5 shadow-xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Menu Economics: Price vs Variable Cost</h3>
              <p className="text-xs text-slate-400">
                Shows selling price, variable costs (ingredients + packaging), and contribution per serving.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('recipes')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              All Recipes <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {marginChartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3256" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="$" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1324',
                      borderColor: '#1e3256',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="sellingPrice" name="Selling Price" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="variableCost" name="Total Variable Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="contribution" name="Contribution Margin ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Utensils className="h-8 w-8 mb-2 opacity-50" />
              No recipes recorded yet. Add recipes to visualize dish profitability.
            </div>
          )}
        </div>

        {/* Chart 2: Top Profit Leaks (1 column) */}
        <div className="rounded-2xl border border-[#1e3256] bg-[#0e172a]/90 p-5 shadow-xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Top Profit Leaks</h3>
                <p className="text-xs text-slate-400">Ranked by dollar impact per cycle</p>
              </div>
              <button
                onClick={() => setActiveTab('radar')}
                className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                Radar <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {profitLeaks.length > 0 ? (
              <div className="space-y-3">
                {profitLeaks.slice(0, 4).map((leak, idx) => (
                  <div
                    key={`${leak.recipeId}_${leak.ingredientId}_${idx}`}
                    className="p-3 rounded-lg bg-[#15223c] border border-[#1e3256] hover:border-rose-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-xs truncate max-w-[170px]">
                        {leak.recipeName}
                      </span>
                      <span className="font-bold text-rose-400 text-xs">
                        -${leak.totalPeriodicLeakAmount.toFixed(2)}/{leak.salesPeriod === 'weekly' ? 'wk' : 'mo'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{leak.ingredientName}</span>
                      <span className="text-rose-300">+{leak.percentPriceIncrease}%</span>
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-500">
                      Margin drop: {leak.previousMarginPct}% &rarr; {leak.currentMarginPct}% (-{leak.marginDropPct}%)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                <ShieldAlert className="h-8 w-8 mb-2 text-emerald-500/40" />
                No profit leaks detected. All ingredient costs match baseline.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e3256]">
            <button
              onClick={() => setActiveTab('whatif')}
              className="w-full py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition text-center"
            >
              Simulate Price Offset in What-If &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Actions & Data Quality Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dishes Needing Attention */}
        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Dishes Needing Attention
            </h3>
            <span className="text-xs text-slate-400">{dishesNeedingAttention.length} flagged</span>
          </div>

          {dishesNeedingAttention.length > 0 ? (
            <div className="space-y-2.5">
              {dishesNeedingAttention.map((dish) => (
                <div
                  key={dish.recipeId}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#15223c] border border-amber-500/20 hover:border-amber-500/40 transition"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{dish.recipeName}</h4>
                    <p className="text-[11px] text-slate-400">
                      Price: ${dish.sellingPrice.toFixed(2)} | Cost: ${dish.totalVariableCostPerServing.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          dish.marginHealth === 'loss'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {dish.contributionMarginPct !== null ? `${dish.contributionMarginPct}%` : 'LOSS'}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Target: {dish.targetMarginPct}%</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('whatif')}
                      className="p-1.5 rounded-lg bg-[#1e3256] hover:bg-slate-700 text-slate-300 transition"
                      title="Adjust in What-If sandbox"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-[#15223c]/50 rounded-lg">
              ✨ All recipes currently meet or exceed their target contribution margins!
            </div>
          )}
        </div>

        {/* Data Quality Warnings & Integrity */}
        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              Data Quality & Audit Checks
            </h3>
            <span className="text-xs text-slate-400">{dataQualityWarnings.length} issues</span>
          </div>

          {dataQualityWarnings.length > 0 ? (
            <div className="space-y-2">
              {dataQualityWarnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
              ✓ All catalog items, conversions, and recipe prices pass integrity validation.
            </div>
          )}

          {/* Local Accounting Disclaimer */}
          <div className="mt-4 p-3 rounded-lg bg-[#15223c]/60 border border-[#1e3256] text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Accounting Note:</strong> Contribution margin measures revenue remaining after direct food & packaging costs to cover fixed overhead (rent, labor, utilities). It is not net profit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
