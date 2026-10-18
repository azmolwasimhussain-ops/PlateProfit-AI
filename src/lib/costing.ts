import {
  Ingredient,
  Recipe,
  RecipeCalculationResult,
  ProfitLeakItem,
  PriceHistoryEntry,
  MarginHealth,
  Unit,
} from '@/types';
import { convertUnit } from './units';

/**
 * Calculates the unit cost of an ingredient for 1 unit of targetUnit.
 * Example: A 25kg bag of flour costs $30.00.
 * Cost per 1g = 30 / (25 * 1000) = $0.0012/g.
 */
export function calculateIngredientCost(
  ingredient: Ingredient,
  usedQuantity: number,
  usedUnit: Unit
): { cost: number; error?: string; isApproximate?: boolean } {
  if (ingredient.packCost <= 0 || ingredient.packSize <= 0) {
    return { cost: 0, error: 'Pack cost and size must be positive numbers.' };
  }

  // Convert used quantity into the ingredient's packUnit
  const conversion = convertUnit(usedQuantity, usedUnit, ingredient.packUnit);

  if (!conversion.success) {
    return {
      cost: 0,
      error: conversion.error || `Cannot convert from ${usedUnit} to ${ingredient.packUnit}`,
    };
  }

  const costPerPackUnit = ingredient.packCost / ingredient.packSize;
  const totalCost = conversion.convertedQuantity * costPerPackUnit;

  return {
    cost: Number(totalCost.toFixed(4)),
    isApproximate: conversion.isApproximate,
  };
}

/**
 * Calculates recipe cost, serving costs, contribution, and margin percentage.
 * Enforces financial guardrails:
 * - Contribution per serving = Selling Price - Total Variable Costs (Ingredients + Packaging + Other Variable)
 * - Contribution Margin % = (Contribution / Selling Price) * 100 ONLY when Selling Price > 0
 * - Does NOT confuse contribution margin with net profit (fixed costs like rent/salaries are not deducted).
 */
export function calculateRecipeCost(
  recipe: Recipe,
  ingredientMap: Map<string, Ingredient>
): RecipeCalculationResult {
  const warnings: string[] = [];
  const servings = recipe.servings > 0 ? recipe.servings : 1;

  if (recipe.servings <= 0) {
    warnings.push('Servings must be at least 1; defaulted to 1 serving.');
  }

  let totalBatchIngredientCost = 0;

  const ingredientBreakdown = recipe.ingredients.map((item) => {
    const ing = ingredientMap.get(item.ingredientId);
    if (!ing) {
      warnings.push(`Ingredient not found in inventory: ID ${item.ingredientId}`);
      return {
        ingredientId: item.ingredientId,
        ingredientName: 'Unknown Ingredient',
        quantityUsed: item.quantity,
        unit: item.unit,
        costInRecipe: 0,
        costPerServing: 0,
        percentageOfCost: 0,
      };
    }

    const { cost, error, isApproximate } = calculateIngredientCost(ing, item.quantity, item.unit);
    if (error) {
      warnings.push(`Unit issue with '${ing.name}': ${error}`);
    }
    if (isApproximate) {
      warnings.push(`Approximated volume/mass density for '${ing.name}' at 1.0 g/ml.`);
    }

    totalBatchIngredientCost += cost;

    return {
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantityUsed: item.quantity,
      unit: item.unit,
      costInRecipe: cost,
      costPerServing: Number((cost / servings).toFixed(4)),
      percentageOfCost: 0, // will compute after total is known
    };
  });

  // Calculate percentage of cost for each ingredient
  ingredientBreakdown.forEach((item) => {
    item.percentageOfCost =
      totalBatchIngredientCost > 0
        ? Number(((item.costInRecipe / totalBatchIngredientCost) * 100).toFixed(1))
        : 0;
  });

  const ingredientCostPerServing = Number((totalBatchIngredientCost / servings).toFixed(4));
  const packagingCostPerServing = Math.max(0, recipe.packagingCost || 0);
  const otherVariableCostPerServing = Math.max(0, recipe.otherVariableCost || 0);

  const totalVariableCostPerServing = Number(
    (ingredientCostPerServing + packagingCostPerServing + otherVariableCostPerServing).toFixed(4)
  );

  const sellingPrice = Number((recipe.sellingPrice || 0).toFixed(2));
  const contributionPerServing = Number((sellingPrice - totalVariableCostPerServing).toFixed(4));

  let contributionMarginPct: number | null = null;
  if (sellingPrice > 0) {
    contributionMarginPct = Number(((contributionPerServing / sellingPrice) * 100).toFixed(1));
  } else {
    warnings.push('Selling price is zero or negative; contribution margin % is undefined.');
  }

  const targetMarginPct = recipe.targetMarginPct || 70; // 70% typical industry benchmark

  let marginHealth: MarginHealth = 'healthy';
  const isProfitable = contributionPerServing > 0;

  if (!isProfitable) {
    marginHealth = 'loss';
  } else if (contributionMarginPct !== null) {
    if (contributionMarginPct < targetMarginPct - 15) {
      marginHealth = 'critical';
    } else if (contributionMarginPct < targetMarginPct) {
      marginHealth = 'caution';
    } else {
      marginHealth = 'healthy';
    }
  }

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    servings,
    sellingPrice,
    totalBatchIngredientCost: Number(totalBatchIngredientCost.toFixed(4)),
    ingredientCostPerServing,
    packagingCostPerServing,
    otherVariableCostPerServing,
    totalVariableCostPerServing,
    contributionPerServing,
    contributionMarginPct,
    targetMarginPct,
    marginHealth,
    isProfitable,
    warnings,
    ingredientBreakdown,
  };
}

/**
 * Profit Leak Radar:
 * Detects verified ingredient price changes, finds all recipes using that ingredient,
 * computes the exact cost delta per serving and aggregates the total leak impact
 * based on sales volumes.
 * Ranks impacts by absolute dollar leakage so the operator sees the highest-priority leaks first.
 */
export function detectProfitLeaks(
  recipes: Recipe[],
  priceHistory: PriceHistoryEntry[],
  ingredientMap: Map<string, Ingredient>
): ProfitLeakItem[] {
  const leaks: ProfitLeakItem[] = [];

  // Find latest price change per ingredient
  const latestPriceChanges = new Map<string, PriceHistoryEntry>();
  for (const entry of priceHistory) {
    const existing = latestPriceChanges.get(entry.ingredientId);
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latestPriceChanges.set(entry.ingredientId, entry);
    }
  }

  for (const recipe of recipes) {
    if (recipe.isArchived) continue;
    const servings = recipe.servings > 0 ? recipe.servings : 1;

    for (const item of recipe.ingredients) {
      const priceChange = latestPriceChanges.get(item.ingredientId);
      if (!priceChange) continue;

      // Only alert if there is a real price increase (delta > 0)
      if (priceChange.deltaCost <= 0) continue;

      const ingredient = ingredientMap.get(item.ingredientId);
      if (!ingredient) continue;

      // Compute old cost and new cost for the quantity used in this recipe
      const dummyOldIng: Ingredient = {
        ...ingredient,
        packCost: priceChange.oldPackCost,
      };
      const dummyNewIng: Ingredient = {
        ...ingredient,
        packCost: priceChange.newPackCost,
      };

      const oldCost = calculateIngredientCost(dummyOldIng, item.quantity, item.unit).cost;
      const newCost = calculateIngredientCost(dummyNewIng, item.quantity, item.unit).cost;

      const costDeltaBatch = newCost - oldCost;
      const costDeltaPerServing = Number((costDeltaBatch / servings).toFixed(4));

      if (costDeltaPerServing <= 0.0001) continue;

      // Calculate previous vs current contribution
      const currentCalc = calculateRecipeCost(recipe, ingredientMap);
      const currentContribution = currentCalc.contributionPerServing;
      const previousContribution = currentContribution + costDeltaPerServing;

      const currentMargin = currentCalc.contributionMarginPct;
      let previousMargin: number | null = null;
      if (recipe.sellingPrice > 0) {
        previousMargin = Number(((previousContribution / recipe.sellingPrice) * 100).toFixed(1));
      }

      const marginDropPct =
        previousMargin !== null && currentMargin !== null
          ? Number((previousMargin - currentMargin).toFixed(1))
          : 0;

      const salesVolume = recipe.salesVolume || 0;
      const salesPeriod = recipe.salesVolumePeriod || 'weekly';

      const totalPeriodicLeakAmount = Number((costDeltaPerServing * salesVolume).toFixed(2));
      const annualizedLeakAmount =
        salesPeriod === 'weekly'
          ? Number((totalPeriodicLeakAmount * 52).toFixed(2))
          : Number((totalPeriodicLeakAmount * 12).toFixed(2));

      let urgency: 'high' | 'medium' | 'low' = 'low';
      if (totalPeriodicLeakAmount > 50 || marginDropPct > 5) {
        urgency = 'high';
      } else if (totalPeriodicLeakAmount > 15 || marginDropPct > 2) {
        urgency = 'medium';
      }

      leaks.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        category: recipe.category,
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        supplier: priceChange.supplier || ingredient.supplier,
        oldUnitCost: priceChange.oldUnitCost,
        newUnitCost: priceChange.newUnitCost,
        unitCostDelta: priceChange.deltaCost,
        percentPriceIncrease: Number(priceChange.percentDelta.toFixed(1)),
        quantityPerServing: Number((item.quantity / servings).toFixed(3)),
        unit: item.unit,
        costDeltaPerServing,
        salesVolume,
        salesPeriod,
        totalPeriodicLeakAmount,
        annualizedLeakAmount,
        previousContributionPerServing: Number(previousContribution.toFixed(2)),
        currentContributionPerServing: Number(currentContribution.toFixed(2)),
        previousMarginPct: previousMargin,
        currentMarginPct: currentMargin,
        marginDropPct,
        urgency,
      });
    }
  }

  // Rank by periodic leak amount descending (highest financial impact first)
  return leaks.sort((a, b) => b.totalPeriodicLeakAmount - a.totalPeriodicLeakAmount);
}

/**
 * What-If Pricing Simulator:
 * Allows owners to simulate price changes or recipe alterations without modifying stored data.
 */
export function simulateWhatIf(
  baseRecipe: Recipe,
  ingredientMap: Map<string, Ingredient>,
  adjustments: {
    proposedSellingPrice?: number;
    proposedPackagingCost?: number;
    proposedOtherVariableCost?: number;
    ingredientPackCostOverrides?: Record<string, number>; // ingredientId -> new packCost
    ingredientQuantityOverrides?: Record<string, number>; // ingredientId -> new quantity in recipe
  }
): {
  current: RecipeCalculationResult;
  simulated: RecipeCalculationResult;
  deltaContributionPerServing: number;
  deltaMarginPct: number;
  deltaPeriodicProfit: number;
} {
  const current = calculateRecipeCost(baseRecipe, ingredientMap);

  // Create virtual ingredient map with overrides
  const virtualIngredientMap = new Map<string, Ingredient>(ingredientMap);
  if (adjustments.ingredientPackCostOverrides) {
    for (const [id, cost] of Object.entries(adjustments.ingredientPackCostOverrides)) {
      const existing = virtualIngredientMap.get(id);
      if (existing) {
        virtualIngredientMap.set(id, {
          ...existing,
          packCost: cost,
        });
      }
    }
  }

  // Create virtual recipe with modified ingredients or costs
  const virtualRecipe: Recipe = {
    ...baseRecipe,
    sellingPrice:
      adjustments.proposedSellingPrice !== undefined
        ? adjustments.proposedSellingPrice
        : baseRecipe.sellingPrice,
    packagingCost:
      adjustments.proposedPackagingCost !== undefined
        ? adjustments.proposedPackagingCost
        : baseRecipe.packagingCost,
    otherVariableCost:
      adjustments.proposedOtherVariableCost !== undefined
        ? adjustments.proposedOtherVariableCost
        : baseRecipe.otherVariableCost,
    ingredients: baseRecipe.ingredients.map((ing) => {
      const qtyOverride = adjustments.ingredientQuantityOverrides?.[ing.ingredientId];
      return qtyOverride !== undefined ? { ...ing, quantity: qtyOverride } : ing;
    }),
  };

  const simulated = calculateRecipeCost(virtualRecipe, virtualIngredientMap);

  const deltaContributionPerServing = Number(
    (simulated.contributionPerServing - current.contributionPerServing).toFixed(2)
  );

  const deltaMarginPct =
    simulated.contributionMarginPct !== null && current.contributionMarginPct !== null
      ? Number((simulated.contributionMarginPct - current.contributionMarginPct).toFixed(1))
      : 0;

  const deltaPeriodicProfit = Number(
    (deltaContributionPerServing * (baseRecipe.salesVolume || 0)).toFixed(2)
  );

  return {
    current,
    simulated,
    deltaContributionPerServing,
    deltaMarginPct,
    deltaPeriodicProfit,
  };
}
