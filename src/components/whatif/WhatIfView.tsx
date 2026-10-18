'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calculator,
  Sliders,
  RotateCcw,
  Save,
  CheckCircle,
} from 'lucide-react';
import { simulateWhatIf } from '@/lib/costing';

export function WhatIfView() {
  const { recipes, ingredientMap, updateRecipe } = useApp();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    recipes.length > 0 ? recipes[0].id : ''
  );

  const selectedRecipe = useMemo(() => {
    return recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
  }, [recipes, selectedRecipeId]);

  // Simulation overrides state
  const [proposedPrice, setProposedPrice] = useState<number>(() => selectedRecipe?.sellingPrice || 0);
  const [proposedPackaging, setProposedPackaging] = useState<number>(() => selectedRecipe?.packagingCost || 0);
  const [ingredientQtyOverrides, setIngredientQtyOverrides] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    selectedRecipe?.ingredients.forEach((ing) => {
      defaults[ing.ingredientId] = ing.quantity;
    });
    return defaults;
  });
  const [savedSuccessNotice, setSavedSuccessNotice] = useState<boolean>(false);

  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    const target = recipes.find((r) => r.id === id);
    if (target) {
      setProposedPrice(target.sellingPrice);
      setProposedPackaging(target.packagingCost);
      const defaults: Record<string, number> = {};
      target.ingredients.forEach((ing) => {
        defaults[ing.ingredientId] = ing.quantity;
      });
      setIngredientQtyOverrides(defaults);
      setSavedSuccessNotice(false);
    }
  };

  const simulation = useMemo(() => {
    if (!selectedRecipe) return null;
    return simulateWhatIf(selectedRecipe, ingredientMap, {
      proposedSellingPrice: proposedPrice,
      proposedPackagingCost: proposedPackaging,
      ingredientQuantityOverrides: ingredientQtyOverrides,
    });
  }, [selectedRecipe, ingredientMap, proposedPrice, proposedPackaging, ingredientQtyOverrides]);

  const handleReset = () => {
    if (!selectedRecipe) return;
    setProposedPrice(selectedRecipe.sellingPrice);
    setProposedPackaging(selectedRecipe.packagingCost);
    const defaults: Record<string, number> = {};
    selectedRecipe.ingredients.forEach((ing) => {
      defaults[ing.ingredientId] = ing.quantity;
    });
    setIngredientQtyOverrides(defaults);
    setSavedSuccessNotice(false);
  };

  const handleCommitChanges = () => {
    if (!selectedRecipe) return;
    const updatedIngredients = selectedRecipe.ingredients.map((ing) => ({
      ...ing,
      quantity: ingredientQtyOverrides[ing.ingredientId] ?? ing.quantity,
    }));

    updateRecipe(selectedRecipe.id, {
      sellingPrice: proposedPrice,
      packagingCost: proposedPackaging,
      ingredients: updatedIngredients,
    });

    setSavedSuccessNotice(true);
    setTimeout(() => setSavedSuccessNotice(false), 4000);
  };

  if (!selectedRecipe) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Calculator className="h-10 w-10 text-slate-500 mx-auto mb-2" />
        <h3 className="text-white text-base font-bold">No Recipes Available</h3>
        <p className="text-xs mt-1">Please add at least one recipe in Recipe Costing to use the What-If Sandbox.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              What-If Pricing Sandbox
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Simulate price adjustments and portion tweaks in real time without altering your live menu data.
          </p>
        </div>

        {/* Recipe Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Select Dish:</label>
          <select
            value={selectedRecipeId}
            onChange={(e) => handleSelectRecipe(e.target.value)}
            className="rounded-lg bg-[#15223c] border border-[#1e3256] px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (${r.sellingPrice.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {savedSuccessNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Success:</strong> Proposed changes committed and saved to recipe &quot;{selectedRecipe.name}&quot;.
          </span>
        </div>
      )}

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1e3256] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                Parameters: {selectedRecipe.name}
              </h3>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              >
                <RotateCcw className="h-3 w-3" /> Reset to Baseline
              </button>
            </div>

            {/* Price Slider & Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Proposed Menu Selling Price ($)
                </label>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  ${proposedPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max={Math.max(25, selectedRecipe.sellingPrice * 2.5)}
                  step="0.25"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded bg-[#15223c] border border-[#1e3256] px-2.5 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Baseline: ${selectedRecipe.sellingPrice.toFixed(2)}</span>
                <span>
                  Delta:{' '}
                  <span
                    className={
                      proposedPrice >= selectedRecipe.sellingPrice ? 'text-emerald-400' : 'text-rose-400'
                    }
                  >
                    {proposedPrice >= selectedRecipe.sellingPrice ? '+' : ''}
                    ${(proposedPrice - selectedRecipe.sellingPrice).toFixed(2)}
                  </span>
                </span>
              </div>
            </div>

            {/* Packaging Cost */}
            <div className="space-y-2 pt-2 border-t border-[#1e3256]/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Packaging & Paper Goods Cost ($ / serving)
                </label>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  ${proposedPackaging.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.05"
                  value={proposedPackaging}
                  onChange={(e) => setProposedPackaging(parseFloat(e.target.value) || 0)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={proposedPackaging}
                  onChange={(e) => setProposedPackaging(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded bg-[#15223c] border border-[#1e3256] px-2.5 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Ingredient Quantities / Portions */}
            <div className="space-y-3 pt-2 border-t border-[#1e3256]/60">
              <label className="text-xs font-bold text-slate-300 block">
                Recipe Portions per Batch ({selectedRecipe.servings} Servings)
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedRecipe.ingredients.map((item) => {
                  const ing = ingredientMap.get(item.ingredientId);
                  const currentQty = ingredientQtyOverrides[item.ingredientId] ?? item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-[#15223c] border border-[#1e3256] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">
                          {ing?.name || 'Unknown Ingredient'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Original: {item.quantity} {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={currentQty}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setIngredientQtyOverrides((prev) => ({
                              ...prev,
                              [item.ingredientId]: val,
                            }));
                          }}
                          className="w-20 rounded bg-[#0e172a] border border-[#1e3256] px-2 py-1 text-xs text-white text-right font-mono focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-slate-400 font-mono w-8">{item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Comparison (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Financial Impact Comparison</span>
              <span className="text-xs font-normal text-slate-400">
                {selectedRecipe.salesVolume} sales / {selectedRecipe.salesVolumePeriod}
              </span>
            </h3>

            {simulation && (
              <div className="space-y-4">
                {/* Side-by-side metric tiles */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#15223c] border border-[#1e3256]">
                    <span className="text-[11px] text-slate-400 block">Baseline Contribution</span>
                    <span className="text-xl font-bold text-slate-200 mt-1 block">
                      ${simulation.current.contributionPerServing.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Margin: {simulation.current.contributionMarginPct}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                    <span className="text-[11px] text-emerald-300 block">Simulated Contribution</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block">
                      ${simulation.simulated.contributionPerServing.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      Margin: {simulation.simulated.contributionMarginPct}%
                    </span>
                  </div>
                </div>

                {/* Net Profit Multiplier */}
                <div className="p-4 rounded-lg bg-[#15223c] border border-[#1e3256] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">
                      Periodic Net Profit Shift
                    </span>
                    <span
                      className={`text-lg font-extrabold ${
                        simulation.deltaPeriodicProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simulation.deltaPeriodicProfit >= 0 ? '+' : ''}$
                      {simulation.deltaPeriodicProfit.toFixed(2)} / {selectedRecipe.salesVolumePeriod}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[#1e3256]/60">
                    <span>Contribution Delta / Plate:</span>
                    <span
                      className={`font-bold ${
                        simulation.deltaContributionPerServing >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simulation.deltaContributionPerServing >= 0 ? '+' : ''}$
                      {simulation.deltaContributionPerServing.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Margin % Change:</span>
                    <span
                      className={`font-bold ${
                        simulation.deltaMarginPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simulation.deltaMarginPct >= 0 ? '+' : ''}
                      {simulation.deltaMarginPct}%
                    </span>
                  </div>
                </div>

                {/* Breakdown comparison */}
                <div className="text-xs space-y-1.5 text-slate-400 pt-1">
                  <div className="flex justify-between">
                    <span>Ingredient Cost / Plate:</span>
                    <span className="text-slate-200">
                      ${simulation.current.ingredientCostPerServing.toFixed(2)} &rarr; ${simulation.simulated.ingredientCostPerServing.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging Cost / Plate:</span>
                    <span className="text-slate-200">
                      ${simulation.current.packagingCostPerServing.toFixed(2)} &rarr; ${simulation.simulated.packagingCostPerServing.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Button: Commit */}
                <div className="pt-3 border-t border-[#1e3256]">
                  <button
                    onClick={handleCommitChanges}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition"
                  >
                    <Save className="h-4 w-4" />
                    Apply Changes to Recipe
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Commits updated selling price and portion specifications to your live menu database.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
