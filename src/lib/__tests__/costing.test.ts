import { describe, it, expect } from 'vitest';
import { convertUnit, normalizeUnit } from '../units';
import { calculateIngredientCost, calculateRecipeCost, detectProfitLeaks, simulateWhatIf } from '../costing';
import { Ingredient, Recipe, PriceHistoryEntry } from '@/types';

describe('Unit Conversion Library', () => {
  it('converts same-category mass units correctly (kg to g, lb to oz)', () => {
    const resKgToG = convertUnit(2.5, 'kg', 'g');
    expect(resKgToG.success).toBe(true);
    expect(resKgToG.convertedQuantity).toBe(2500);

    const resGToKg = convertUnit(500, 'g', 'kg');
    expect(resGToKg.success).toBe(true);
    expect(resGToKg.convertedQuantity).toBe(0.5);

    const resLbToOz = convertUnit(1, 'lb', 'oz');
    expect(resLbToOz.success).toBe(true);
    expect(Number(resLbToOz.convertedQuantity.toFixed(2))).toBe(16.0);
  });

  it('converts volume units correctly (l to ml, fl_oz to ml)', () => {
    const resLToMl = convertUnit(1.5, 'l', 'ml');
    expect(resLToMl.success).toBe(true);
    expect(resLToMl.convertedQuantity).toBe(1500);

    const resMlToL = convertUnit(250, 'ml', 'l');
    expect(resMlToL.success).toBe(true);
    expect(resMlToL.convertedQuantity).toBe(0.25);
  });

  it('handles negative quantities gracefully with error', () => {
    const res = convertUnit(-5, 'kg', 'g');
    expect(res.success).toBe(false);
    expect(res.error).toContain('negative');
  });

  it('safely handles cross-category conversion with density fallback', () => {
    // 500ml milk approximated as 500g at default 1.0g/ml
    const res = convertUnit(500, 'ml', 'g');
    expect(res.success).toBe(true);
    expect(res.convertedQuantity).toBe(500);
    expect(res.isApproximate).toBe(true);
  });

  it('normalizes common unit string variations', () => {
    expect(normalizeUnit('KILOGRAMS')).toBe('kg');
    expect(normalizeUnit('gms')).toBe('g');
    expect(normalizeUnit('litres')).toBe('l');
    expect(normalizeUnit('pcs')).toBe('piece');
    expect(normalizeUnit('pkt')).toBe('pack');
  });
});

describe('Recipe & Ingredient Costing Math', () => {
  const butter: Ingredient = {
    id: 'ing_butter',
    name: 'European Unsalted Butter',
    category: 'Dairy',
    supplier: 'Dairy Direct',
    defaultUnit: 'g',
    packSize: 5, // 5kg pack
    packUnit: 'kg',
    packCost: 40.0, // $40.00 for 5kg => $8/kg => $0.008/g
    costPerDefaultUnit: 0.008,
    lastUpdated: '2026-10-10',
  };

  const flour: Ingredient = {
    id: 'ing_flour',
    name: 'T55 French Flour',
    category: 'Dry Goods',
    supplier: 'Millers Best',
    defaultUnit: 'g',
    packSize: 25, // 25kg
    packUnit: 'kg',
    packCost: 25.0, // $25 for 25kg => $1/kg => $0.001/g
    costPerDefaultUnit: 0.001,
    lastUpdated: '2026-10-01',
  };

  const ingredientMap = new Map<string, Ingredient>([
    [butter.id, butter],
    [flour.id, flour],
  ]);

  it('calculates single ingredient cost accurately with unit conversion', () => {
    // 250g of butter from 5kg pack at $40: 0.25kg * $8/kg = $2.00
    const costResult = calculateIngredientCost(butter, 250, 'g');
    expect(costResult.cost).toBe(2.0);
  });

  it('calculates recipe batch and per-serving costs', () => {
    // Croissant batch yielding 10 croissants:
    // Butter: 500g ($4.00)
    // Flour: 1000g ($1.00)
    // Total ingredient batch: $5.00
    // Per serving ingredient: $0.50
    // Packaging: $0.15
    // Other variable: $0.05
    // Total variable cost per serving: $0.70
    // Selling price: $4.50
    // Contribution: $4.50 - $0.70 = $3.80
    // Margin %: (3.80 / 4.50) * 100 = 84.4%
    const croissantRecipe: Recipe = {
      id: 'rec_croissant',
      name: 'Artisan Butter Croissant',
      category: 'Pastry',
      servings: 10,
      sellingPrice: 4.5,
      packagingCost: 0.15,
      otherVariableCost: 0.05,
      targetMarginPct: 75,
      salesVolume: 200,
      salesVolumePeriod: 'weekly',
      ingredients: [
        { id: '1', ingredientId: butter.id, quantity: 500, unit: 'g' },
        { id: '2', ingredientId: flour.id, quantity: 1000, unit: 'g' },
      ],
    };

    const calc = calculateRecipeCost(croissantRecipe, ingredientMap);
    expect(calc.totalBatchIngredientCost).toBe(5.0);
    expect(calc.ingredientCostPerServing).toBe(0.5);
    expect(calc.totalVariableCostPerServing).toBe(0.7);
    expect(calc.contributionPerServing).toBe(3.8);
    expect(calc.contributionMarginPct).toBe(84.4);
    expect(calc.marginHealth).toBe('healthy');
    expect(calc.isProfitable).toBe(true);
  });

  it('safely handles zero and negative selling prices without breaking', () => {
    const freeSampleRecipe: Recipe = {
      id: 'rec_sample',
      name: 'Free Tasting Sample',
      category: 'Pastry',
      servings: 1,
      sellingPrice: 0, // Free
      packagingCost: 0.05,
      otherVariableCost: 0,
      targetMarginPct: 70,
      salesVolume: 50,
      salesVolumePeriod: 'weekly',
      ingredients: [{ id: '1', ingredientId: flour.id, quantity: 100, unit: 'g' }],
    };

    const calc = calculateRecipeCost(freeSampleRecipe, ingredientMap);
    expect(calc.sellingPrice).toBe(0);
    expect(calc.contributionMarginPct).toBeNull();
    expect(calc.isProfitable).toBe(false);
    expect(calc.marginHealth).toBe('loss');
    expect(calc.warnings.some((w) => w.includes('undefined'))).toBe(true);
  });

  it('detects profit leaks when supplier prices rise', () => {
    // Suppose butter jumped from $40/5kg to $55/5kg ($8/kg -> $11/kg, +37.5%)
    const butterPriceHike: PriceHistoryEntry = {
      id: 'ph_1',
      ingredientId: butter.id,
      ingredientName: butter.name,
      supplier: 'Dairy Direct',
      date: '2026-10-15',
      oldPackCost: 40.0,
      newPackCost: 55.0,
      packSize: 5,
      packUnit: 'kg',
      oldUnitCost: 8.0,
      newUnitCost: 11.0,
      deltaCost: 3.0,
      percentDelta: 37.5,
      source: 'invoice_ocr',
    };

    // Current butter pack cost in inventory is updated to $55
    const updatedButter = { ...butter, packCost: 55.0 };
    const updatedMap = new Map<string, Ingredient>([
      [updatedButter.id, updatedButter],
      [flour.id, flour],
    ]);

    const croissantRecipe: Recipe = {
      id: 'rec_croissant',
      name: 'Artisan Butter Croissant',
      category: 'Pastry',
      servings: 10,
      sellingPrice: 4.5,
      packagingCost: 0.15,
      otherVariableCost: 0.05,
      targetMarginPct: 75,
      salesVolume: 200,
      salesVolumePeriod: 'weekly',
      ingredients: [
        { id: '1', ingredientId: butter.id, quantity: 500, unit: 'g' },
        { id: '2', ingredientId: flour.id, quantity: 1000, unit: 'g' },
      ],
    };

    const leaks = detectProfitLeaks([croissantRecipe], [butterPriceHike], updatedMap);
    expect(leaks.length).toBe(1);
    const leak = leaks[0];
    expect(leak.recipeName).toBe('Artisan Butter Croissant');
    expect(leak.ingredientName).toBe('European Unsalted Butter');
    // Delta per serving: 500g in 10 servings = 50g butter per serving
    // 50g at $3/kg = $0.15 increase per croissant
    expect(leak.costDeltaPerServing).toBe(0.15);
    // Weekly leak: $0.15 * 200 = $30.00
    expect(leak.totalPeriodicLeakAmount).toBe(30.0);
    // Annualized: 30 * 52 = $1560
    expect(leak.annualizedLeakAmount).toBe(1560.0);
  });

  it('runs what-if scenario simulations without mutating base data', () => {
    const croissantRecipe: Recipe = {
      id: 'rec_croissant',
      name: 'Artisan Butter Croissant',
      category: 'Pastry',
      servings: 1,
      sellingPrice: 4.0,
      packagingCost: 0.2,
      otherVariableCost: 0,
      targetMarginPct: 70,
      salesVolume: 100,
      salesVolumePeriod: 'weekly',
      ingredients: [{ id: '1', ingredientId: butter.id, quantity: 100, unit: 'g' }], // 100g butter at $8/kg = $0.80
    };

    // Simulate price increase from $4.00 to $4.75
    const simulation = simulateWhatIf(croissantRecipe, ingredientMap, {
      proposedSellingPrice: 4.75,
    });

    expect(simulation.current.sellingPrice).toBe(4.0);
    expect(simulation.simulated.sellingPrice).toBe(4.75);
    expect(simulation.deltaContributionPerServing).toBe(0.75);
    expect(simulation.deltaPeriodicProfit).toBe(75.0); // 100 sales * $0.75
  });
});
