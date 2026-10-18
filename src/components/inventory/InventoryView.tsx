'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  History,
} from 'lucide-react';
import { Ingredient, Unit } from '@/types';

export function InventoryView() {
  const { ingredients, priceHistory, addIngredient, updateIngredient, deleteIngredient } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTabSub, setActiveTabSub] = useState<'inventory' | 'history'>('inventory');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Dairy');
  const [formSupplier, setFormSupplier] = useState('');
  const [formPackCost, setFormPackCost] = useState(20.0);
  const [formPackSize, setFormPackSize] = useState(1);
  const [formPackUnit, setFormPackUnit] = useState<Unit>('kg');
  const [formDefaultUnit, setFormDefaultUnit] = useState<Unit>('g');
  const [formNotes, setFormNotes] = useState('');

  const categories = Array.from(new Set(ingredients.map((i) => i.category).filter(Boolean)));

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('Dairy');
    setFormSupplier('');
    setFormPackCost(25.0);
    setFormPackSize(1);
    setFormPackUnit('kg');
    setFormDefaultUnit('g');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingId(ing.id);
    setFormName(ing.name);
    setFormCategory(ing.category);
    setFormSupplier(ing.supplier);
    setFormPackCost(ing.packCost);
    setFormPackSize(ing.packSize);
    setFormPackUnit(ing.packUnit);
    setFormDefaultUnit(ing.defaultUnit);
    setFormNotes(ing.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingId) {
      updateIngredient(editingId, {
        name: formName.trim(),
        category: formCategory,
        supplier: formSupplier.trim() || 'General Supplier',
        packCost: Number(formPackCost) || 0,
        packSize: Number(formPackSize) || 1,
        packUnit: formPackUnit,
        defaultUnit: formDefaultUnit,
        notes: formNotes,
      });
    } else {
      addIngredient({
        name: formName.trim(),
        category: formCategory,
        supplier: formSupplier.trim() || 'General Supplier',
        packCost: Number(formPackCost) || 0,
        packSize: Number(formPackSize) || 1,
        packUnit: formPackUnit,
        defaultUnit: formDefaultUnit,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Package className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Ingredient Inventory & Cost History
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage ingredient catalog, confirmed supplier purchase prices, package sizes, and historical inflation logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-[#15223c] p-1 border border-[#1e3256]">
            <button
              onClick={() => setActiveTabSub('inventory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTabSub === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Current Ingredients ({ingredients.length})
            </button>
            <button
              onClick={() => setActiveTabSub('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                activeTabSub === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Price History ({priceHistory.length})
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition"
          >
            <Plus className="h-4 w-4" /> Add Ingredient
          </button>
        </div>
      </div>

      {activeTabSub === 'inventory' ? (
        <>
          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0e172a] border border-[#1e3256]">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ingredient or supplier..."
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

          {/* Table */}
          <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e3256] bg-[#111c35] text-slate-400">
                    <th className="py-3 px-4 font-semibold">Ingredient</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Pack Purchase Cost</th>
                    <th className="py-3 px-4 font-semibold">Unit Cost</th>
                    <th className="py-3 px-4 font-semibold">Last Updated</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3256]/60">
                  {filteredIngredients.length > 0 ? (
                    filteredIngredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-[#15223c]/50 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{ing.name}</span>
                          {ing.notes && <span className="text-[10px] text-slate-400">{ing.notes}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#15223c] border border-[#1e3256] text-slate-300 text-[10px]">
                            {ing.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{ing.supplier}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-white font-bold">${ing.packCost.toFixed(2)}</span>
                          <span className="text-slate-400 text-[10px] block">
                            per {ing.packSize} {ing.packUnit}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-400 font-bold">
                            ${ing.costPerDefaultUnit.toFixed(4)}
                          </span>
                          <span className="text-slate-400 text-[10px] block">per 1 {ing.defaultUnit}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{ing.lastUpdated}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(ing)}
                              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#15223c] transition"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ingredient "${ing.name}"?`)) {
                                  deleteIngredient(ing.id);
                                }
                              }}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#15223c] transition"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        No ingredients found. Click &ldquo;Add Ingredient&rdquo; or switch to Demo Mode.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Price History Table */
        <div className="rounded-xl border border-[#1e3256] bg-[#0e172a] shadow-xl overflow-hidden p-4">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Historical Supplier Price Changes</h3>
            <p className="text-xs text-slate-400">
              Logged every time delivery invoices are verified or prices are updated in inventory.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e3256] bg-[#111c35] text-slate-400">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Ingredient</th>
                  <th className="py-3 px-4 font-semibold">Supplier</th>
                  <th className="py-3 px-4 font-semibold">Old Pack Cost</th>
                  <th className="py-3 px-4 font-semibold">New Pack Cost</th>
                  <th className="py-3 px-4 font-semibold">Unit Shock</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3256]/60">
                {priceHistory.length > 0 ? (
                  priceHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-[#15223c]/50 transition">
                      <td className="py-3 px-4 font-mono text-slate-300">{h.date}</td>
                      <td className="py-3 px-4 text-white font-bold">{h.ingredientName}</td>
                      <td className="py-3 px-4 text-slate-300">{h.supplier}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">${h.oldPackCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-white font-mono font-bold">${h.newPackCost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold ${
                            h.percentDelta > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {h.percentDelta > 0 ? '+' : ''}
                          {h.percentDelta.toFixed(1)}% (+${h.deltaCost.toFixed(4)}/{h.packUnit})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#15223c] border border-[#1e3256] text-[10px] text-slate-300">
                          {h.source === 'invoice_ocr' ? `Invoice OCR (${h.invoiceRef || 'OCR'})` : h.source}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No price change history recorded yet. Verify invoices to track changes automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#1e3256] bg-[#0e172a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3256] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. European Unsalted Butter 82%"
                  className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Dairy, Coffee, Dry Goods"
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Supplier</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Alps Dairy Co."
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pack Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPackCost}
                    onChange={(e) => setFormPackCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pack Size *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    required
                    value={formPackSize}
                    onChange={(e) => setFormPackSize(parseFloat(e.target.value) || 1)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pack Unit</label>
                  <select
                    value={formPackUnit}
                    onChange={(e) => setFormPackUnit(e.target.value as Unit)}
                    className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="unit">unit</option>
                    <option value="piece">piece</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                  </select>
                </div>
              </div>

              {/* Conversion Preview */}
              <div className="p-3 rounded-lg bg-[#15223c] border border-[#1e3256] text-slate-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Calculated Cost Preview:
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${(formPackSize > 0 ? formPackCost / formPackSize : 0).toFixed(4)}
                </span>{' '}
                per 1 {formPackUnit}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Notes / Specifications</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. 82% fat content, pasture-raised"
                  className="w-full rounded bg-[#15223c] border border-[#1e3256] px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1e3256]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#15223c] text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20"
                >
                  {editingId ? 'Save Changes' : 'Save Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
