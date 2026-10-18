'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ingredient,
  Recipe,
  PriceHistoryEntry,
  ExtractedInvoice,
  SalesRecord,
  OllamaConfig,
  RecipeCalculationResult,
  ProfitLeakItem,
  ProfitLeakAIExplanation,
  InvoiceLineItem,
  NavigationTab,
} from '@/types';
import {
  STORAGE_KEYS,
  DEFAULT_OLLAMA_CONFIG,
  getStoredData,
  setStoredData,
  removeStoredData,
  FullBackupData,
} from '@/lib/storage';
import {
  DEMO_INGREDIENTS,
  DEMO_RECIPES,
  DEMO_PRICE_HISTORY,
  DEMO_SAMPLE_INVOICE,
} from '@/lib/demoData';
import { calculateRecipeCost, detectProfitLeaks } from '@/lib/costing';
import { generateHeuristicExplanation } from '@/lib/ruleBasedAdvisor';

interface AppContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  ingredients: Ingredient[];
  recipes: Recipe[];
  priceHistory: PriceHistoryEntry[];
  invoices: ExtractedInvoice[];
  salesRecords: SalesRecord[];
  ollamaConfig: OllamaConfig;

  ingredientMap: Map<string, Ingredient>;
  recipeCalculations: RecipeCalculationResult[];
  profitLeaks: ProfitLeakItem[];
  dataQualityWarnings: string[];

  aiAnalysis: ProfitLeakAIExplanation | null;
  isAnalyzing: boolean;

  // Actions
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'costPerDefaultUnit' | 'lastUpdated'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  addInvoice: (invoice: ExtractedInvoice) => void;
  confirmInvoicePrices: (invoiceId: string, itemsToUpdate: InvoiceLineItem[]) => void;
  deleteInvoice: (invoiceId: string) => void;

  updateOllamaConfig: (updates: Partial<OllamaConfig>) => void;
  testOllamaConnection: () => Promise<boolean>;
  runAiProfitAnalysis: () => Promise<void>;

  importSalesData: (records: Array<{ dishName: string; quantitySold: number; recordedPrice: number; periodDate: string }>) => void;
  loadFullBackup: (backup: FullBackupData) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() =>
    getStoredData<boolean>(STORAGE_KEYS.IS_DEMO, true)
  );
  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'home',
        'dashboard',
        'radar',
        'whatif',
        'recipes',
        'inventory',
        'invoices',
        'reports',
        'settings',
      ];
      if (validTabs.includes(hash)) return hash;
    }
    return 'home';
  });

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  }, []);

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const demo = getStoredData<boolean>(STORAGE_KEYS.IS_DEMO, true);
    return demo ? DEMO_INGREDIENTS : getStoredData<Ingredient[]>(STORAGE_KEYS.INGREDIENTS, []);
  });
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const demo = getStoredData<boolean>(STORAGE_KEYS.IS_DEMO, true);
    return demo ? DEMO_RECIPES : getStoredData<Recipe[]>(STORAGE_KEYS.RECIPES, []);
  });
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>(() => {
    const demo = getStoredData<boolean>(STORAGE_KEYS.IS_DEMO, true);
    return demo ? DEMO_PRICE_HISTORY : getStoredData<PriceHistoryEntry[]>(STORAGE_KEYS.PRICE_HISTORY, []);
  });
  const [invoices, setInvoices] = useState<ExtractedInvoice[]>(() => {
    const demo = getStoredData<boolean>(STORAGE_KEYS.IS_DEMO, true);
    return demo ? [DEMO_SAMPLE_INVOICE] : getStoredData<ExtractedInvoice[]>(STORAGE_KEYS.INVOICES, []);
  });
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() => {
    return getStoredData<SalesRecord[]>(STORAGE_KEYS.SALES, []);
  });
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>(() => {
    return getStoredData<OllamaConfig>(STORAGE_KEYS.OLLAMA_CONFIG, DEFAULT_OLLAMA_CONFIG);
  });

  const [aiAnalysis, setAiAnalysis] = useState<ProfitLeakAIExplanation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'home',
        'dashboard',
        'radar',
        'whatif',
        'recipes',
        'inventory',
        'invoices',
        'reports',
        'settings',
      ];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Save to storage on real mode changes
  useEffect(() => {
    if (!mounted) return;
    setStoredData(STORAGE_KEYS.IS_DEMO, isDemoMode);
    if (!isDemoMode) {
      setStoredData(STORAGE_KEYS.INGREDIENTS, ingredients);
      setStoredData(STORAGE_KEYS.RECIPES, recipes);
      setStoredData(STORAGE_KEYS.PRICE_HISTORY, priceHistory);
      setStoredData(STORAGE_KEYS.INVOICES, invoices);
      setStoredData(STORAGE_KEYS.SALES, salesRecords);
    }
  }, [mounted, isDemoMode, ingredients, recipes, priceHistory, invoices, salesRecords]);



  const toggleDemoMode = useCallback(() => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    if (nextMode) {
      setIngredients(DEMO_INGREDIENTS);
      setRecipes(DEMO_RECIPES);
      setPriceHistory(DEMO_PRICE_HISTORY);
      setInvoices([DEMO_SAMPLE_INVOICE]);
      setAiAnalysis(null);
    } else {
      setIngredients(getStoredData<Ingredient[]>(STORAGE_KEYS.INGREDIENTS, []));
      setRecipes(getStoredData<Recipe[]>(STORAGE_KEYS.RECIPES, []));
      setPriceHistory(getStoredData<PriceHistoryEntry[]>(STORAGE_KEYS.PRICE_HISTORY, []));
      setInvoices(getStoredData<ExtractedInvoice[]>(STORAGE_KEYS.INVOICES, []));
      setSalesRecords(getStoredData<SalesRecord[]>(STORAGE_KEYS.SALES, []));
      setAiAnalysis(null);
    }
  }, [isDemoMode]);

  // Derived calculations
  const ingredientMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach((ing) => map.set(ing.id, ing));
    return map;
  }, [ingredients]);

  const recipeCalculations = useMemo(() => {
    return recipes.map((recipe) => calculateRecipeCost(recipe, ingredientMap));
  }, [recipes, ingredientMap]);

  const profitLeaks = useMemo(() => {
    return detectProfitLeaks(recipes, priceHistory, ingredientMap);
  }, [recipes, priceHistory, ingredientMap]);

  // Audit data-quality warnings
  const dataQualityWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (ingredients.length === 0) {
      warnings.push('Ingredient inventory is empty. Add ingredients or switch to Demo Mode to test features.');
    }
    if (recipes.length === 0) {
      warnings.push('No menu recipes found. Create your dishes to calculate food costs and margins.');
    }
    recipes.forEach((r) => {
      if (r.sellingPrice <= 0) {
        warnings.push(`Recipe "${r.name}" has selling price $0.00; contribution margin % cannot be calculated.`);
      }
      if (r.ingredients.length === 0) {
        warnings.push(`Recipe "${r.name}" has no ingredients attached.`);
      }
      if (!r.salesVolume || r.salesVolume <= 0) {
        warnings.push(`Recipe "${r.name}" has no sales volume set; profit leak radar cannot quantify total financial impact.`);
      }
    });
    return warnings;
  }, [ingredients, recipes]);

  // Actions
  const addIngredient = useCallback(
    (item: Omit<Ingredient, 'id' | 'costPerDefaultUnit' | 'lastUpdated'>) => {
      const id = `ing_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const costPerDefaultUnit = item.packSize > 0 ? Number((item.packCost / item.packSize).toFixed(4)) : 0;
      const newIng: Ingredient = {
        ...item,
        id,
        costPerDefaultUnit,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setIngredients((prev) => [newIng, ...prev]);
    },
    []
  );

  const updateIngredient = useCallback((id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        const updated = { ...ing, ...updates };
        if (updates.packCost !== undefined || updates.packSize !== undefined) {
          const cost = updates.packCost ?? ing.packCost;
          const size = updates.packSize ?? ing.packSize;
          updated.costPerDefaultUnit = size > 0 ? Number((cost / size).toFixed(4)) : 0;
          updated.lastUpdated = new Date().toISOString().split('T')[0];
        }
        return updated;
      })
    );
  }, []);

  const deleteIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }, []);

  const addRecipe = useCallback((recipe: Omit<Recipe, 'id'>) => {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newRecipe: Recipe = { ...recipe, id };
    setRecipes((prev) => [newRecipe, ...prev]);
  }, []);

  const updateRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addInvoice = useCallback((invoice: ExtractedInvoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  }, []);

  const deleteInvoice = useCallback((invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
  }, []);

  // Confirm Invoice Prices & Log Price History
  const confirmInvoicePrices = useCallback(
    (invoiceId: string, verifiedItems: InvoiceLineItem[]) => {
      const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
      const supplierName = targetInvoice?.supplier || 'Supplier';
      const invoiceRef = targetInvoice?.invoiceNumber || invoiceId;
      const today = new Date().toISOString().split('T')[0];

      const newHistoryEntries: PriceHistoryEntry[] = [];

      setIngredients((prev) => {
        return prev.map((ing) => {
          const matchedItem = verifiedItems.find(
            (v) => (v.matchedIngredientId === ing.id || v.description.toLowerCase() === ing.name.toLowerCase()) && v.verified
          );

          if (!matchedItem) return ing;

          const oldPackCost = ing.packCost;
          const newPackCost = matchedItem.lineTotal;
          const newPackSize = matchedItem.quantity;
          const oldUnitCost = ing.costPerDefaultUnit;
          const newUnitCost = newPackSize > 0 ? Number((newPackCost / newPackSize).toFixed(4)) : oldUnitCost;

          const deltaCost = Number((newUnitCost - oldUnitCost).toFixed(4));
          const percentDelta = oldUnitCost > 0 ? Number(((deltaCost / oldUnitCost) * 100).toFixed(1)) : 0;

          if (Math.abs(deltaCost) > 0.0001) {
            newHistoryEntries.push({
              id: `ph_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              ingredientId: ing.id,
              ingredientName: ing.name,
              supplier: supplierName,
              date: today,
              oldPackCost,
              newPackCost,
              packSize: newPackSize,
              packUnit: matchedItem.unit,
              oldUnitCost,
              newUnitCost,
              deltaCost,
              percentDelta,
              source: 'invoice_ocr',
              invoiceRef,
            });
          }

          return {
            ...ing,
            packCost: newPackCost,
            packSize: newPackSize,
            packUnit: matchedItem.unit,
            costPerDefaultUnit: newUnitCost,
            lastUpdated: today,
            supplier: supplierName,
          };
        });
      });

      // Update invoice status to confirmed
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'confirmed', lineItems: verifiedItems } : inv))
      );

      if (newHistoryEntries.length > 0) {
        setPriceHistory((prev) => [...newHistoryEntries, ...prev]);
      }
    },
    [invoices]
  );

  const updateOllamaConfig = useCallback((updates: Partial<OllamaConfig>) => {
    setOllamaConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const testOllamaConnection = useCallback(async (): Promise<boolean> => {
    setOllamaConfig((prev) => ({ ...prev, status: 'checking', errorMessage: undefined }));
    try {
      const res = await fetch('/api/ollama/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: ollamaConfig.endpoint }),
      });
      const data = await res.json();
      if (data.ok) {
        setOllamaConfig((prev) => ({
          ...prev,
          status: 'connected',
          availableModels: data.models || [],
          lastChecked: new Date().toLocaleTimeString(),
          errorMessage: undefined,
        }));
        return true;
      } else {
        setOllamaConfig((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: data.error || 'Connection failed',
          lastChecked: new Date().toLocaleTimeString(),
        }));
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error reaching API';
      setOllamaConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: msg,
        lastChecked: new Date().toLocaleTimeString(),
      }));
      return false;
    }
  }, [ollamaConfig.endpoint]);

  const runAiProfitAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ollama/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: ollamaConfig.endpoint,
          model: ollamaConfig.selectedModel,
          leaks: profitLeaks,
          businessName: isDemoMode ? 'Velvet Bean & Bakery' : 'My Food Business',
        }),
      });

      const data = await res.json();
      if (data.ok && data.explanation) {
        setAiAnalysis(data.explanation);
      } else {
        // Fallback to local rule engine
        const fallback = generateHeuristicExplanation(profitLeaks, isDemoMode ? 'Velvet Bean & Bakery' : 'My Kitchen');
        setAiAnalysis(fallback);
      }
    } catch {
      const fallback = generateHeuristicExplanation(profitLeaks, isDemoMode ? 'Velvet Bean & Bakery' : 'My Kitchen');
      setAiAnalysis(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  }, [ollamaConfig, profitLeaks, isDemoMode]);

  const importSalesData = useCallback(
    (records: Array<{ dishName: string; quantitySold: number; recordedPrice: number; periodDate: string }>) => {
      // Map sales quantities directly to recipe salesVolume if matching dish name
      setRecipes((prev) =>
        prev.map((r) => {
          const match = records.find((rec) => rec.dishName.toLowerCase().trim() === r.name.toLowerCase().trim());
          if (match) {
            return {
              ...r,
              salesVolume: match.quantitySold,
            };
          }
          return r;
        })
      );

      const newSales: SalesRecord[] = records.map((r, i) => ({
        id: `sales_${Date.now()}_${i}`,
        dishName: r.dishName,
        periodDate: r.periodDate,
        quantitySold: r.quantitySold,
        recordedPrice: r.recordedPrice,
        source: 'csv_import',
      }));

      setSalesRecords((prev) => [...newSales, ...prev]);
    },
    []
  );

  const loadFullBackup = useCallback((backup: FullBackupData) => {
    setIngredients(backup.ingredients);
    setRecipes(backup.recipes);
    setPriceHistory(backup.priceHistory || []);
    setInvoices(backup.invoices || []);
    setSalesRecords(backup.sales || []);
    setIsDemoMode(false);
  }, []);

  const resetAllData = useCallback(() => {
    setIngredients([]);
    setRecipes([]);
    setPriceHistory([]);
    setInvoices([]);
    setSalesRecords([]);
    setAiAnalysis(null);
    setIsDemoMode(false);
    removeStoredData(STORAGE_KEYS.INGREDIENTS);
    removeStoredData(STORAGE_KEYS.RECIPES);
    removeStoredData(STORAGE_KEYS.PRICE_HISTORY);
    removeStoredData(STORAGE_KEYS.INVOICES);
    removeStoredData(STORAGE_KEYS.SALES);
    removeStoredData(STORAGE_KEYS.IS_DEMO);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        activeTab,
        setActiveTab,
        ingredients,
        recipes,
        priceHistory,
        invoices,
        salesRecords,
        ollamaConfig,
        ingredientMap,
        recipeCalculations,
        profitLeaks,
        dataQualityWarnings,
        aiAnalysis,
        isAnalyzing,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addInvoice,
        confirmInvoicePrices,
        deleteInvoice,
        updateOllamaConfig,
        testOllamaConnection,
        runAiProfitAnalysis,
        importSalesData,
        loadFullBackup,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
