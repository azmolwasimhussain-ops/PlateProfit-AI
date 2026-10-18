export type Unit =
  | 'kg'
  | 'g'
  | 'mg'
  | 'l'
  | 'ml'
  | 'unit'
  | 'piece'
  | 'oz'
  | 'lb'
  | 'fl_oz'
  | 'can'
  | 'bottle'
  | 'bunch'
  | 'pack';

export type UnitCategory = 'mass' | 'volume' | 'count';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  supplier: string;
  defaultUnit: Unit;
  packSize: number; // e.g. 5 (kg)
  packUnit: Unit; // e.g. 'kg'
  packCost: number; // e.g. $25.00
  costPerDefaultUnit: number; // calculated cost for 1 defaultUnit
  lastUpdated: string; // ISO date string
  notes?: string;
  isArchived?: boolean;
}

export interface PriceHistoryEntry {
  id: string;
  ingredientId: string;
  ingredientName: string;
  supplier: string;
  date: string;
  oldPackCost: number;
  newPackCost: number;
  packSize: number;
  packUnit: Unit;
  oldUnitCost: number;
  newUnitCost: number;
  deltaCost: number; // newUnitCost - oldUnitCost
  percentDelta: number; // ((new - old) / old) * 100
  source: 'manual' | 'invoice_ocr' | 'csv_import';
  invoiceRef?: string;
}

export interface RecipeItem {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  servings: number; // e.g., 1 serving or batch yielding 12
  sellingPrice: number; // per serving menu price
  packagingCost: number; // per serving packaging e.g. box, lid, napkin
  otherVariableCost: number; // per serving variable cost e.g. sauce cup, ice
  ingredients: RecipeItem[];
  targetMarginPct: number; // e.g., 70%
  salesVolume: number; // weekly or monthly units sold
  salesVolumePeriod: 'weekly' | 'monthly';
  notes?: string;
  isArchived?: boolean;
}

export type MarginHealth = 'healthy' | 'caution' | 'critical' | 'loss';

export interface RecipeCalculationResult {
  recipeId: string;
  recipeName: string;
  servings: number;
  sellingPrice: number;
  totalBatchIngredientCost: number;
  ingredientCostPerServing: number;
  packagingCostPerServing: number;
  otherVariableCostPerServing: number;
  totalVariableCostPerServing: number;
  contributionPerServing: number; // sellingPrice - totalVariableCostPerServing
  contributionMarginPct: number | null; // (contribution / sellingPrice) * 100, null if sellingPrice <= 0
  targetMarginPct: number;
  marginHealth: MarginHealth;
  isProfitable: boolean;
  breakEvenServingsPerPeriod?: number;
  warnings: string[];
  ingredientBreakdown: {
    ingredientId: string;
    ingredientName: string;
    quantityUsed: number;
    unit: Unit;
    costInRecipe: number;
    costPerServing: number;
    percentageOfCost: number;
  }[];
}

export interface ProfitLeakItem {
  recipeId: string;
  recipeName: string;
  category: string;
  ingredientId: string;
  ingredientName: string;
  supplier: string;
  oldUnitCost: number;
  newUnitCost: number;
  unitCostDelta: number;
  percentPriceIncrease: number;
  quantityPerServing: number;
  unit: Unit;
  costDeltaPerServing: number;
  salesVolume: number;
  salesPeriod: 'weekly' | 'monthly';
  totalPeriodicLeakAmount: number; // costDeltaPerServing * salesVolume
  annualizedLeakAmount: number;
  previousContributionPerServing: number;
  currentContributionPerServing: number;
  previousMarginPct: number | null;
  currentMarginPct: number | null;
  marginDropPct: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface InvoiceLineItem {
  id: string;
  rawText: string;
  description: string;
  matchedIngredientId?: string;
  matchedIngredientName?: string;
  isNewIngredient?: boolean;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  lineTotal: number;
  calculatedTotal: number;
  arithmeticMismatch: boolean;
  confidence: number; // 0 to 1
  verified: boolean;
}

export interface ExtractedInvoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  date: string;
  rawText: string;
  fileName?: string;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  status: 'pending_review' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface SalesRecord {
  id: string;
  dishName: string;
  recipeId?: string;
  periodDate: string;
  quantitySold: number;
  recordedPrice: number;
  source: 'csv_import' | 'manual';
}

export interface OllamaConfig {
  endpoint: string; // e.g. http://localhost:11434
  selectedModel: string;
  timeoutMs: number;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  lastChecked?: string;
  availableModels: string[];
  errorMessage?: string;
}

export interface AIActionRecommendation {
  id: string;
  title: string;
  category: 'price_adjustment' | 'portion_control' | 'supplier_renegotiation' | 'menu_engineering';
  impactRecipe: string;
  rationale: string;
  suggestedAction: string;
  estimatedPeriodicSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ProfitLeakAIExplanation {
  summary: string;
  keyDrivers: string[];
  executiveTakeaway: string;
  recommendations: AIActionRecommendation[];
  generatedAt: string;
  modelUsed: string;
  isAiGenerated: boolean; // false if rule-based fallback
}

export interface WhatIfScenarioInput {
  recipeId: string;
  proposedSellingPrice?: number;
  proposedPackagingCost?: number;
  proposedOtherVariableCost?: number;
  ingredientAdjustments: {
    ingredientId: string;
    proposedQuantity?: number;
    proposedPackCost?: number;
  }[];
}

export interface WhatIfScenarioResult {
  current: RecipeCalculationResult;
  proposed: RecipeCalculationResult;
  deltaContributionPerServing: number;
  deltaMarginPct: number;
  deltaPeriodicProfit: number;
  summary: string;
}

export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'inventory'
  | 'recipes'
  | 'invoices'
  | 'radar'
  | 'whatif'
  | 'reports'
  | 'settings';

