import { ProfitLeakItem, ProfitLeakAIExplanation, AIActionRecommendation } from '@/types';

/**
 * Deterministic rule-based business intelligence generator.
 * Operates completely offline with 0 dependencies when Ollama is unavailable.
 */
export function generateHeuristicExplanation(
  leaks: ProfitLeakItem[],
  businessName = 'Your Kitchen'
): ProfitLeakAIExplanation {
  if (leaks.length === 0) {
    return {
      summary: 'All ingredient prices and menu contribution margins are currently stable. No immediate cost leakage detected.',
      keyDrivers: ['Supplier prices have remained constant within recorded thresholds.'],
      executiveTakeaway: 'Current recipe contributions match expected baseline targets.',
      recommendations: [
        {
          id: 'rec_rule_audit',
          title: 'Routine Supplier Audit',
          category: 'supplier_renegotiation',
          impactRecipe: 'All Menu Items',
          rationale: 'Prices fluctuate seasonally; maintaining weekly invoice scans preserves margin visibility.',
          suggestedAction: 'Upload your next delivery invoice to verify contracted pricing remains intact.',
          estimatedPeriodicSavings: 0,
          priority: 'low',
        },
      ],
      generatedAt: new Date().toISOString(),
      modelUsed: 'PlateProfit Deterministic Rules Engine',
      isAiGenerated: false,
    };
  }

  const totalPeriodicLeak = leaks.reduce((sum, item) => sum + item.totalPeriodicLeakAmount, 0);
  const highestImpact = leaks[0];
  const uniqueIngredients = Array.from(new Set(leaks.map((l) => l.ingredientName)));

  const keyDrivers = leaks.slice(0, 3).map((l) => {
    return `${l.ingredientName} from ${l.supplier} increased by +${l.percentPriceIncrease}% (+$${l.unitCostDelta.toFixed(2)}/${l.unit}), eroding ${l.recipeName} margin by ${l.marginDropPct}%.`;
  });

  const recommendations: AIActionRecommendation[] = [];

  // Recommendation 1: Price adjustment for highest impact item
  if (highestImpact) {
    const suggestedPriceHike = Number((highestImpact.costDeltaPerServing * 1.35).toFixed(2));
    recommendations.push({
      id: 'rec_rule_price_1',
      title: `Compensate ${highestImpact.recipeName} Menu Price`,
      category: 'price_adjustment',
      impactRecipe: highestImpact.recipeName,
      rationale: `${highestImpact.ingredientName} price surge causes a periodic leakage of $${highestImpact.totalPeriodicLeakAmount.toFixed(2)} (${highestImpact.salesVolume} servings/${highestImpact.salesPeriod}).`,
      suggestedAction: `Adjust selling price from $${(highestImpact.currentContributionPerServing + highestImpact.costDeltaPerServing).toFixed(2)} by +$${suggestedPriceHike} to safeguard gross margin without altering recipe portioning.`,
      estimatedPeriodicSavings: Number((highestImpact.costDeltaPerServing * highestImpact.salesVolume).toFixed(2)),
      priority: 'high',
    });
  }

  // Recommendation 2: Supplier renegotiation or bulk purchase
  if (uniqueIngredients.length > 0) {
    const topIngredient = highestImpact.ingredientName;
    recommendations.push({
      id: 'rec_rule_supplier_2',
      title: `Contract Renegotiation for ${topIngredient}`,
      category: 'supplier_renegotiation',
      impactRecipe: `Dishes using ${topIngredient}`,
      rationale: `Single supplier price jump accounts for the majority of unbudgeted ingredient inflation.`,
      suggestedAction: `Request tiered volume discount or quote alternate suppliers for ${topIngredient} to return unit cost toward prior baseline.`,
      estimatedPeriodicSavings: Number((totalPeriodicLeak * 0.4).toFixed(2)),
      priority: 'medium',
    });
  }

  // Recommendation 3: Portion & Packaging Review
  if (leaks.length > 1) {
    const second = leaks[1];
    recommendations.push({
      id: 'rec_rule_portion_3',
      title: `Yield & Portion Verification for ${second.recipeName}`,
      category: 'portion_control',
      impactRecipe: second.recipeName,
      rationale: `Secondary cost driver with $${second.totalPeriodicLeakAmount.toFixed(2)} periodic leakage.`,
      suggestedAction: `Audit kitchen prep yields and standardize scoop/scale measurements for ${second.ingredientName} to prevent accidental over-portioning.`,
      estimatedPeriodicSavings: Number((second.totalPeriodicLeakAmount * 0.5).toFixed(2)),
      priority: 'medium',
    });
  }

  return {
    summary: `Identified ${leaks.length} recipe cost leakages resulting in $${totalPeriodicLeak.toFixed(2)} in total periodic margin erosion across ${businessName}.`,
    keyDrivers,
    executiveTakeaway: `The most urgent leak is in ${highestImpact.recipeName} due to ${highestImpact.ingredientName} price hikes. Taking targeted pricing and portioning steps can recover up to $${totalPeriodicLeak.toFixed(2)} each cycle.`,
    recommendations,
    generatedAt: new Date().toISOString(),
    modelUsed: 'PlateProfit Deterministic Rules Engine',
    isAiGenerated: false,
  };
}
