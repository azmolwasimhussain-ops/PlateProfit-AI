'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  UtensilsCrossed,
  Radar,
  Calculator,
  FileScan,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Coffee,
  Croissant,
  ChefHat,
  Truck,
  CheckCircle2,
  Lock,
  BarChart3,
  Flame,
  ChevronRight,
} from 'lucide-react';

export function HomeView() {
  const { setActiveTab, profitLeaks } = useApp();

  // Interactive Live Hero Dish Teaser State
  const [selectedDemoDish, setSelectedDemoDish] = useState<'croissant' | 'flatwhite' | 'painau'>('croissant');
  const [simulateShock, setSimulateShock] = useState<boolean>(false);

  // Interactive Annualized Leak Calculator State
  const [dailyServings, setDailyServings] = useState<number>(200);
  const [unnoticedHike, setUnnoticedHike] = useState<number>(0.18);

  const calculatedWeeklyLeak = dailyServings * 7 * unnoticedHike;
  const calculatedMonthlyLeak = dailyServings * 30 * unnoticedHike;
  const calculatedAnnualLeak = dailyServings * 365 * unnoticedHike;

  // Demo dish configs for interactive simulation
  const dishes = {
    croissant: {
      name: 'Artisan Butter Croissant',
      icon: Croissant,
      category: 'Pastry',
      sellingPrice: 4.25,
      baseIngredientCost: 0.62,
      packagingCost: 0.15,
      shockCost: 0.77, // +$0.15 butter shock
      shockIngredient: 'European Unsalted Butter (+25%)',
    },
    flatwhite: {
      name: 'Oat Milk Flat White',
      icon: Coffee,
      category: 'Beverage',
      sellingPrice: 4.95,
      baseIngredientCost: 0.78,
      packagingCost: 0.22,
      shockCost: 0.98, // +$0.20 oat milk shock
      shockIngredient: 'Barista Oat Milk (+22%)',
    },
    painau: {
      name: 'Pain au Chocolat',
      icon: ChefHat,
      category: 'Pastry',
      sellingPrice: 4.75,
      baseIngredientCost: 0.85,
      packagingCost: 0.15,
      shockCost: 1.05, // +$0.20 cocoa shock
      shockIngredient: 'Belgian Chocolate Batons (+24%)',
    },
  };

  const currentDish = dishes[selectedDemoDish];
  const activeCost = simulateShock ? currentDish.shockCost : currentDish.baseIngredientCost;
  const totalVariableCost = activeCost + currentDish.packagingCost;
  const contribution = currentDish.sellingPrice - totalVariableCost;
  const marginPct = (contribution / currentDish.sellingPrice) * 100;
  const baseContribution = currentDish.sellingPrice - (currentDish.baseIngredientCost + currentDish.packagingCost);
  const baseMarginPct = (baseContribution / currentDish.sellingPrice) * 100;

  return (
    <div className="space-y-20 pb-16">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HERO SECTION
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-12">
        {/* Glow ambient backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-80 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#15223c]/90 border border-[#1e3256] text-xs font-medium text-emerald-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Local-First Food Profit Intelligence</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">100% On-Device & Offline</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Stop Guessing Food Costs.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Protect Every Cent on Every Plate.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The local-first profit operating system built for artisan bakeries, cloud kitchens, and coffee shops.
            Detect silent supplier price hikes, calculate recipe margins down to the gram, extract invoices with local OCR, and consult private on-device AI.
          </p>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <BarChart3 className="h-4 w-4" />
              Launch Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0e172a] hover:bg-[#15223c] text-slate-200 border border-[#1e3256] font-semibold text-sm transition-all"
            >
              <Radar className="h-4 w-4 text-rose-400" />
              View Profit Leak Radar
              {profitLeaks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {profitLeaks.length} Active
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0e172a] hover:bg-[#15223c] text-slate-300 border border-[#1e3256] font-semibold text-sm transition-all"
            >
              <FileScan className="h-4 w-4 text-cyan-400" />
              Scan Invoice (OCR)
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero Remote Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>100% Private In-Browser Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Offline Ollama LLM Compatible</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            INTERACTIVE HERO CARD: LIVE MARGIN SIMULATOR
            ───────────────────────────────────────────────────────────────────────────── */}
        <div className="mt-12 max-w-3xl mx-auto rounded-2xl bg-[#0e172a]/95 border border-[#1e3256] p-6 shadow-2xl glow-card backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#1e3256]/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Interactive Live Margin Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a menu item below to test how wholesale price hikes impact unit contribution.
              </p>
            </div>

            {/* Dish selector pills */}
            <div className="flex items-center gap-1.5 bg-[#080e1a] p-1 rounded-xl border border-[#1e3256]">
              {(['croissant', 'flatwhite', 'painau'] as const).map((dishKey) => {
                const dish = dishes[dishKey];
                const Icon = dish.icon;
                const isSelected = selectedDemoDish === dishKey;
                return (
                  <button
                    key={dishKey}
                    onClick={() => setSelectedDemoDish(dishKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#15223c]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{dish.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Dish Details */}
            <div className="space-y-3 md:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Recipe</span>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                {React.createElement(currentDish.icon, { className: 'h-4 w-4 text-emerald-400' })}
                {currentDish.name}
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selling Menu Price:</span>
                  <span className="font-semibold text-white">${currentDish.sellingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Cost (Portion):</span>
                  <span className={`font-semibold ${simulateShock ? 'text-rose-400' : 'text-slate-200'}`}>
                    ${activeCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packaging & Variable:</span>
                  <span className="font-semibold text-slate-200">${currentDish.packagingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#1e3256]">
                  <span className="text-slate-400 font-medium">Total Variable Cost:</span>
                  <span className="font-bold text-slate-100">${totalVariableCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shock Toggle Box */}
            <div className="md:col-span-1 p-4 rounded-xl bg-[#080e1a]/80 border border-[#1e3256] flex flex-col justify-between h-full">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  Wholesale Shock Test
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Simulate verified supplier hike: <strong className="text-slate-200">{currentDish.shockIngredient}</strong>
                </p>
              </div>

              <button
                onClick={() => setSimulateShock(!simulateShock)}
                className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  simulateShock
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                    : 'bg-[#15223c] hover:bg-[#1e3256] text-slate-200 border border-[#2a4574]'
                }`}
              >
                <AlertTriangle className={`h-3.5 w-3.5 ${simulateShock ? 'text-white' : 'text-amber-400'}`} />
                {simulateShock ? 'Shock Applied (Click to Reset)' : 'Simulate Price Hike'}
              </button>
            </div>

            {/* Margin Output Badge */}
            <div className="md:col-span-1 text-center p-4 rounded-xl bg-gradient-to-br from-[#15223c] to-[#0b1324] border border-[#1e3256]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Contribution Margin
              </span>
              <div className="my-2">
                <span
                  className={`text-4xl font-extrabold tracking-tight ${
                    simulateShock ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {marginPct.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-white">${contribution.toFixed(2)}</strong> contribution / serving
              </p>

              {simulateShock && (
                <div className="mt-2 pt-2 border-t border-[#1e3256] text-[11px] text-rose-300 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 rotate-180" />
                  <span>Margin dropped by {(baseMarginPct - marginPct).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Simulator Footer */}
          <div className="pt-4 border-t border-[#1e3256]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Formula: <code className="text-slate-300 bg-[#080e1a] px-1.5 py-0.5 rounded">Margin % = ((Price - Cost) / Price) * 100</code>
            </span>
            <button
              onClick={() => setActiveTab('whatif')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
            >
              Open Full What-If Sandbox <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. THE FOOD COSTING PROBLEM ("WHY SMALL FOOD BUSINESSES BLEED PROFIT")
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">The Problem</span>
          <h2 className="text-3xl font-extrabold text-white">Why Independent Kitchens Bleed 15–28% of Profits</h2>
          <p className="text-sm text-slate-400">
            Restaurants and bakeries run on thin 8–15% net margins. A handful of unnoticed wholesale price increases can quietly wipe out your entire monthly take-home profit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-3 hover:border-slate-500/50 transition">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-white">Silent Wholesale Price Creep</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Suppliers rarely give advance warning. Butter, cooking oil, cream, and flour quietly rise 12–25%. Unless you update every single recipe spreadsheet, you are subsidizing customer orders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-3 hover:border-slate-500/50 transition">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-white">Compounding Unit Conversion Errors</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You buy flour in 25kg bulk bags, butter in 5kg blocks, and dairy in 4-liter jugs—but your recipes call for 180 grams or 35 milliliters. Manual math leads to rounding errors that compound over thousands of orders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-3 hover:border-slate-500/50 transition">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-white">Cloud Privacy & Subscription Bloat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Legacy enterprise food-costing software charges $150–$300/month and requires uploading confidential secret formulas to third-party cloud servers. PlateProfit keeps 100% of your data inside your local browser.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. INTERACTIVE ANNUALIZED LEAK CALCULATOR
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-[#101b33] to-[#080e1a] border border-[#1e3256] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none" />

        <div className="relative space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Interactive ROI Estimator</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How Much Is Your Kitchen Secretly Leaking?
            </h2>
            <p className="text-xs text-slate-400">
              Drag the sliders below to estimate how small unnoticed ingredient cost hikes compound over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6 bg-[#080e1a]/80 p-6 rounded-2xl border border-[#1e3256]">
              {/* Daily Servings Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Daily Portions / Coffees Sold:</span>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-[#15223c] border border-[#1e3256]">
                    {dailyServings} dishes / day
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="1000"
                  step="25"
                  value={dailyServings}
                  onChange={(e) => setDailyServings(Number(e.target.value))}
                  className="w-full h-2 bg-[#15223c] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>25 (Small Stall)</span>
                  <span>500 (Busy Cafe)</span>
                  <span>1,000+ (Production Bakery)</span>
                </div>
              </div>

              {/* Unnoticed Hike Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Unnoticed Cost Creep Per Portion:</span>
                  <span className="font-bold text-rose-400 px-2 py-0.5 rounded bg-[#15223c] border border-[#1e3256]">
                    +${unnoticedHike.toFixed(2)} / item
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.01"
                  value={unnoticedHike}
                  onChange={(e) => setUnnoticedHike(Number(e.target.value))}
                  className="w-full h-2 bg-[#15223c] rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>$0.05 (Minor)</span>
                  <span>$0.25 (Dairy / Butter Hike)</span>
                  <span>$0.60 (Major Shock)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Display */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#15223c] to-[#0d1627] border border-[#233b66] text-center space-y-4 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Compounded Profit Leak
              </span>

              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-rose-400 tracking-tight">
                  ${calculatedAnnualLeak.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  <span className="text-lg font-bold text-slate-400"> / yr</span>
                </div>
                <p className="text-xs text-slate-400">
                  That is <strong className="text-slate-200">${calculatedMonthlyLeak.toFixed(0)}/month</strong> or{' '}
                  <strong className="text-slate-200">${calculatedWeeklyLeak.toFixed(0)}/week</strong> vanishing from your pocket.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('radar')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <Radar className="h-4 w-4" />
                  Plug Leaks in PlateProfit Radar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. 6 CORE PILLARS FEATURE GRID
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Full Capabilities</span>
          <h2 className="text-3xl font-extrabold text-white">Engineered For Real Commercial Kitchens</h2>
          <p className="text-sm text-slate-400">
            From bulk ingredient purchase orders to menu pricing psychology, every feature solves a real operational headache.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => setActiveTab('radar')}
            className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] hover:border-emerald-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Radar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              Profit Leak Radar
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When butter or eggs increase, the radar detects every active recipe using those ingredients, calculates the delta cost per portion, and multiplies by sales volume to prioritize bottom-line leaks.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setActiveTab('recipes')}
            className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] hover:border-emerald-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              Batch & Portion Costing
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic conversion across mass (`kg`, `g`, `lb`, `oz`) and volume (`l`, `ml`, `fl oz`). Itemizes food ingredients, packaging containers, sauce cups, and napkins per portion.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setActiveTab('invoices')}
            className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] hover:border-emerald-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileScan className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              Local Invoice OCR Ingestion
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag-and-drop delivery dockets and supplier invoices. In-browser OCR extracts line items with uncertainty flags. Requires human confirmation before updating costs.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => setActiveTab('whatif')}
            className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] hover:border-emerald-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              What-If Sandbox Simulator
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sandbox proposed price increases ($4.25 → $4.75) or ingredient swaps before touching your real menu. Instantly projects periodic net margin impact.
            </p>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => setActiveTab('settings')}
            className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] hover:border-emerald-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              Private Ollama AI Intelligence
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect to your local Ollama daemon (Llama 3.2, Mistral). Interprets messy invoice lines and explains financial variances with zero data leaving your laptop.
            </p>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => setActiveTab('reports')}
            className="p-6 rounded-2xl bg-[#0e172a] border border-[#1e3256] hover:border-emerald-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              CSV & Printable PDF Exports
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download structured CSV spreadsheets of your entire inventory and menu costings, or generate printable kitchen prep sheets with ingredient portioning.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. BUILT FOR YOUR KITCHEN TYPE
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Tailored Intelligence</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Built For Every Food Creator</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Croissant className="h-4 w-4" />
              <span>Artisan Bakeries</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Butter blocks, chocolate batons, and pastry flours have fluctuating commodity prices. PlateProfit keeps batch laminations profitable.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Coffee className="h-4 w-4" />
              <span>Specialty Coffee</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track dairy vs. oat milk surcharges, specialty espresso roast yields, and takeaway cup/lid packaging overhead down to the milliliter.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ChefHat className="h-4 w-4" />
              <span>Cloud & Dark Kitchens</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High commission aggregator margins demand strict contribution control. Account for sauce cups, branded bags, and prep labor variables.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e172a] border border-[#1e3256] space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Truck className="h-4 w-4" />
              <span>Food Trucks & Stalls</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast batch yields and dynamic festival pricing. Know your exact break-even volumes before setting up at the weekend market.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. COMPARISON TABLE: LOCAL-FIRST VS CLOUD
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Zero Compromises</span>
          <h2 className="text-2xl font-extrabold text-white">How PlateProfit AI Compares</h2>
        </div>

        <div className="rounded-2xl border border-[#1e3256] bg-[#0e172a] overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e3256] bg-[#15223c]/80 text-slate-300">
                <th className="p-3.5 font-bold">Feature</th>
                <th className="p-3.5 font-bold text-emerald-400">PlateProfit AI</th>
                <th className="p-3.5 font-medium text-slate-400">Generic Cloud Food Costing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3256]/60">
              <tr>
                <td className="p-3.5 text-slate-300 font-medium">Data Privacy & Storage</td>
                <td className="p-3.5 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  100% Local (Never leaves device)
                </td>
                <td className="p-3.5 text-slate-400">Stored on 3rd-party cloud servers</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-300 font-medium">Monthly Cost</td>
                <td className="p-3.5 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  100% Free & Open-Source
                </td>
                <td className="p-3.5 text-slate-400">$89 – $250 / month per kitchen</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-300 font-medium">Offline Operation</td>
                <td className="p-3.5 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Fully functional offline
                </td>
                <td className="p-3.5 text-slate-400">Requires uninterrupted internet connection</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-300 font-medium">AI Intelligence</td>
                <td className="p-3.5 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Local Ollama LLMs (No API fees)
                </td>
                <td className="p-3.5 text-slate-400">Closed Cloud APIs (Data used for training)</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-300 font-medium">Profit Leak Shock Radar</td>
                <td className="p-3.5 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Automated multiplier across all recipes
                </td>
                <td className="p-3.5 text-slate-400">Manual recalculation required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. BOTTOM HIGH-IMPACT CTA BANNER
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0e1e36] to-teal-950/60 border border-emerald-500/30 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="relative space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Protect Your Kitchen&apos;s Margins?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            PlateProfit AI comes pre-loaded with demonstration artisan bakery data. Start testing immediately without entering credit cards or creating accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
          >
            <BarChart3 className="h-4 w-4" />
            Enter Interactive Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#080e1a] hover:bg-[#15223c] text-slate-200 border border-[#1e3256] font-semibold text-sm transition"
          >
            <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
            Explore Preloaded Recipes
          </button>
        </div>
      </section>
    </div>
  );
}
