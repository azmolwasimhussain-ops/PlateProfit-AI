/**
 * storage.ts — Local-first persistence using localStorage (IndexedDB-backed by browser).
 * All data stays 100% on-device. No external dependencies required.
 */

import type {
  Ingredient,
  Recipe,
  PriceHistoryEntry,
  ExtractedInvoice,
  SalesRecord,
  OllamaConfig,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Storage key registry
// ─────────────────────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  IS_DEMO: 'pp_isDemoMode',
  INGREDIENTS: 'pp_ingredients',
  RECIPES: 'pp_recipes',
  PRICE_HISTORY: 'pp_priceHistory',
  INVOICES: 'pp_invoices',
  SALES: 'pp_sales',
  OLLAMA_CONFIG: 'pp_ollamaConfig',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─────────────────────────────────────────────────────────────────────────────
// Default Ollama configuration
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  endpoint: 'http://localhost:11434',
  selectedModel: '',
  timeoutMs: 20000,
  status: 'disconnected',
  availableModels: [],
  lastChecked: undefined,
  errorMessage: undefined,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Backup / Restore types
// ─────────────────────────────────────────────────────────────────────────────
export interface FullBackupData {
  version: number;
  exportedAt: string;
  ingredients: Ingredient[];
  recipes: Recipe[];
  priceHistory: PriceHistoryEntry[];
  invoices: ExtractedInvoice[];
  sales: SalesRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Core get / set — synchronous localStorage wrappers with type safety
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads a value from localStorage. Returns `defaultValue` if the key is absent
 * or JSON parsing fails. Safe to call during SSR (returns `defaultValue`).
 */
export function getStoredData<T>(key: StorageKey, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Persists a value to localStorage as JSON.
 * Silent no-op during SSR or if storage quota is exceeded.
 */
export function setStoredData<T>(key: StorageKey, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or private browsing — gracefully silent
  }
}

/**
 * Removes a key from localStorage.
 */
export function removeStoredData(key: StorageKey): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Backup / Restore helpers (used by SettingsView)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialises all app data into a JSON file and triggers a browser download.
 */
export function exportBackupJSON(
  ingredients: Ingredient[],
  recipes: Recipe[],
  priceHistory: PriceHistoryEntry[],
  invoices: ExtractedInvoice[],
  sales: SalesRecord[]
): void {
  const backup: FullBackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ingredients,
    recipes,
    priceHistory,
    invoices,
    sales,
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plateprofit_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses a JSON backup string produced by `exportBackupJSON`.
 * Throws a descriptive Error if the data is invalid.
 */
export function parseBackupJSON(jsonText: string): FullBackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('File is not valid JSON. Please select a PlateProfit backup file.');
  }

  const data = parsed as Record<string, unknown>;

  if (!Array.isArray(data.ingredients) || !Array.isArray(data.recipes)) {
    throw new Error(
      'Backup file is missing required fields (ingredients, recipes). It may be from an incompatible version.'
    );
  }

  return {
    version: (data.version as number) ?? 1,
    exportedAt: (data.exportedAt as string) ?? new Date().toISOString(),
    ingredients: data.ingredients as Ingredient[],
    recipes: data.recipes as Recipe[],
    priceHistory: Array.isArray(data.priceHistory) ? (data.priceHistory as PriceHistoryEntry[]) : [],
    invoices: Array.isArray(data.invoices) ? (data.invoices as ExtractedInvoice[]) : [],
    sales: Array.isArray(data.sales) ? (data.sales as SalesRecord[]) : [],
  };
}
