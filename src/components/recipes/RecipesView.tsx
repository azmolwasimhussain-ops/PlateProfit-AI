'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Recipe, Unit } from '@/types';

export function RecipesView() {
  const { recipes, ingredients, recipeCalculations, addRecipe, updateRecipe, deleteRecipe } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Modal / Form state for Add or Edit Recipe
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Main Dish');
  const [formServings, setFormServings] = useState(1);
  const [formSellingPrice, setFormSellingPrice] = useState(5.0);
  const [formPackagingCost, setFormPackagingCost] = useState(0.25);
  const [formOtherVariableCost, setFormOtherVariableCost] = useState(0.05);
  const [formTargetMargin, setFormTargetMargin] = useState(70);
  const [formSalesVolume, setFormSalesVolume] = useState(100);
  const [formNotes, setFormNotes] = useState('');
  const [formIngredients, setFormIngredients] = useState<Array<{ ingredientId: string; quantity: number; unit: Unit }>>([
    { ingredientId: ingredients[0]?.id || '', quantity: 100, unit: 'g' },
  ]);

  const categories = Array.from(new Set(recipes.map((r) => r.category).filter(Boolean)));

  const filteredCalculations = recipeCalculations.filter((c) => {
    const recipe = recipes.find((r) => r.id === c.recipeId);
    const matchesSearch = c.recipeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || (recipe && recipe.category === selectedCategory);
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditId(null);
    setFormName('');
    setFormCategory('Pastry & Bakery');
    setFormServings(1);
    setFormSellingPrice(5.5);
    setFormPackagingCost(0.25);
    setFormOtherVariableCost(0.05);
    setFormTargetMargin(70);
    setFormSalesVolume(100);
    setFormNotes('');
    setFormIngredients(
      ingredients.length > 0 ? [{ ingredientId: ingredients[0].id, quantity: 50, unit: 'g' }] : []
    );
    setIsEditing(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setEditId(recipe.id);
    setFormName(recipe.name);
    setFormCategory(recipe.category);
    setFormServings(recipe.servings);
    setFormSellingPrice(recipe.sellingPrice);
    setFormPackagingCost(recipe.packagingCost);
    setFormOtherVariableCost(recipe.otherVariableCost);
    setFormTargetMargin(recipe.targetMarginPct);
    setFormSalesVolume(recipe.salesVolume || 100);
    setFormNotes(recipe.notes || '');
    setFormIngredients(
      recipe.ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
      }))
    );
    setIsEditing(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const recipeData: Omit<Recipe, 'id'> = {
      name: formName.trim(),
      category: formCategory,
      servings: Number(formServings) || 1,
      sellingPrice: Number(formSellingPrice) || 0,
      packagingCost: Number(formPackagingCost) || 0,
      otherVariableCost: Number(formOtherVariableCost) || 0,
      targetMarginPct: Number(formTargetMargin) || 70,
      salesVolume: Number(formSalesVolume) || 0,
      salesVolumePeriod: 'weekly',
      notes: formNotes,
      ingredients: formIngredients.map((item, index) => ({
        id: `item_${index}_${Date.now()}`,
        ingredientId: item.ingredientId,
        quantity: Number(item.quantity) || 0,
        unit: item.unit,
      })),
    };

    if (editId) {
      updateRecipe(editId, recipeData);
    } else {
      addRecipe(recipeData);
    }

    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Recipe Costing & Margins</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic recipe food costing with packaging overhead, serving allocations, and contribution margin metrics.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Add New Recipe
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0e172a] border border-[#1e3256]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-[#15223c] border border-[#1e3256] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 shrink-0">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-lg bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipes List / Cards */}
      <div className="space-y-3">
        {filteredCalculations.length > 0 ? (
          filteredCalculations.map((c) => {
            const recipe = recipes.find((r) => r.id === c.recipeId);
            const isExpanded = expandedRecipeId === c.recipeId;

            return (
              <div
                key={c.recipeId}
                className="rounded-xl border border-[#1e3256] bg-[#0e172a] overflow-hidden shadow-md transition-all hover:border-slate-600"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedRecipeId(isExpanded ? null : c.recipeId)}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#15223c] border border-[#1e3256] text-emerald-400">
                      <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{c.recipeName}</h3>
                        {recipe?.category && (
                          <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-[#15223c] border border-[#1e3256]">
                            {recipe.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Yield: {c.servings} serving{c.servings > 1 ? 's' : ''} | Menu Price:{' '}
                        <strong className="text-white">${c.sellingPrice.toFixed(2)}</strong> | Variable Cost:{' '}
                        <span className="text-slate-300 font-medium">
                          ${c.totalVariableCostPerServing.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Financial Metrics Badges */}
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Contribution / Serving</div>
                      <div className="text-sm font-extrabold text-emerald-400 font-mono">
                        ${c.contributionPerServing.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Contribution Margin</div>
                      <div
                        className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded ${
                          c.marginHealth === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : c.marginHealth === 'caution'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {c.contributionMarginPct !== null ? `${c.contributionMarginPct}%` : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {recipe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(recipe);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15223c] transition"
                          title="Edit Recipe"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete recipe "${c.recipeName}"?`)) {
                            deleteRecipe(c.recipeId);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#15223c] transition"
                        title="Delete Recipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Ingredient Breakdown Table */}
                {isExpanded && (
                  <div className="border-t border-[#1e3256] bg-[#0b1324] p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Ingredient Breakdown & Costs
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#1e3256] text-slate-400">
                            <th className="pb-2 font-semibold">Ingredient</th>
                            <th className="pb-2 font-semibold">Quantity</th>
                            <th className="pb-2 font-semibold">Cost in Batch</th>
                            <th className="pb-2 font-semibold">Cost / Serving</th>
                            <th className="pb-2 font-semibold">% of Food Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e3256]/50">
                          {c.ingredientBreakdown.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#15223c]/40">
                              <td className="py-2 text-white font-medium">{item.ingredientName}</td>
                              <td className="py-2 text-slate-300 font-mono">
                                {item.quantityUsed} {item.unit}
                              </td>
                              <td className="py-2 text-slate-300 font-mono">${item.costInRecipe.toFixed(2)}</td>
                              <td className="py-2 text-slate-200 font-mono font-semibold">
                                ${item.costPerServing.toFixed(2)}
                              </td>
                              <td className="py-2 text-slate-400 font-mono">{item.percentageOfCost}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Overhead Variable Cost Summary Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="p-2.5 rounded bg-[#15223c] border border-[#1e3256]">
                        <span className="text-slate-400 block text-[10px]">Ingredients / Serving</span>
                        <span className="font-bold text-white font-mono">
                          ${c.ingredientCostPerServing.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-[#15223c] border border-[#1e3256]">
                        <span className="text-slate-400 block text-[10px]">Packaging / Serving</span>
                        <span className="font-bold text-white font-mono">
                          ${c.packagingCostPerServing.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-[#15223c] border border-[#1e3256]">
                        <span className="text-slate-400 block text-[10px]">Other Variable / Serving</span>
                        <span className="font-bold text-white font-mono">
                          ${c.otherVariableCostPerServing.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-[#15223c] border border-[#1e3256]">
                        <span className="text-slate-400 block text-[10px]">Target vs Actual</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {c.contributionMarginPct}% (Target: {c.targetMarginPct}%)
                        </span>
                      </div>
                    </div>

                    {c.warnings.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-200 text-xs">
                        <strong>Calculations notice:</strong> {c.warnings.join(' ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 bg-[#0e172a] rounded-xl border border-[#1e3256]">
            No recipes matching current search criteria.
          </div>
        )}
      </div>

      {/* Modal / Form for Recipe Add/Edit */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#1e3256] pb-3">
              <h3 className="text-base font-bold text-white">
                {editId ? 'Edit Recipe' : 'Create New Menu Recipe'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Pistachio Cardamom Bun"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Pastry, Beverage, Mains"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Servings per Batch *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formServings}
                    onChange={(e) => setFormServings(parseInt(e.target.value) || 1)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Packaging Cost / Serving ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPackagingCost}
                    onChange={(e) => setFormPackagingCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Other Variable Cost / Serving ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formOtherVariableCost}
                    onChange={(e) => setFormOtherVariableCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Contribution Margin (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formTargetMargin}
                    onChange={(e) => setFormTargetMargin(parseInt(e.target.value) || 70)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Weekly Sales Volume (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={formSalesVolume}
                    onChange={(e) => setFormSalesVolume(parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Ingredients List */}
              <div className="pt-2 border-t border-[#1e3256]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">Ingredients in Batch</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormIngredients((prev) => [
                        ...prev,
                        { ingredientId: ingredients[0]?.id || '', quantity: 10, unit: 'g' },
                      ])
                    }
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Ingredient Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formIngredients.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={row.ingredientId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormIngredients((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, ingredientId: val } : r))
                          );
                        }}
                        className="flex-1 rounded bg-[#15223c] border border-[#1e3256] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.packSize} {ing.packUnit} @ ${ing.packCost.toFixed(2)})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Quantity"
                        value={row.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormIngredients((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, quantity: val } : r))
                          );
                        }}
                        className="w-24 rounded bg-[#15223c] border border-[#1e3256] px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-emerald-500"
                      />

                      <select
                        value={row.unit}
                        onChange={(e) => {
                          const val = e.target.value as Unit;
                          setFormIngredients((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, unit: val } : r))
                          );
                        }}
                        className="w-20 rounded bg-[#15223c] border border-[#1e3256] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="unit">unit</option>
                        <option value="piece">piece</option>
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                        <option value="fl_oz">fl_oz</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          setFormIngredients((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-[#15223c]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#1e3256]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-[#15223c] text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20"
                >
                  {editId ? 'Save Recipe Changes' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
