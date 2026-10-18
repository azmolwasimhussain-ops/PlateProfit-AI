import { Unit, UnitCategory } from '@/types';

// Base conversion rates to grams
const MASS_TO_GRAM: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  lb: 453.59237,
  oz: 28.349523,
};

// Base conversion rates to milliliters
const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  fl_oz: 29.5735,
};

// Discrete count equivalents
export const COUNT_UNITS: Set<string> = new Set(['unit', 'piece', 'can', 'bottle', 'bunch', 'pack']);

export function getUnitCategory(unit: Unit): UnitCategory {
  if (unit in MASS_TO_GRAM) return 'mass';
  if (unit in VOLUME_TO_ML) return 'volume';
  return 'count';
}

export interface UnitConversionResult {
  success: boolean;
  convertedQuantity: number;
  error?: string;
  isApproximate?: boolean;
}

/**
 * Converts a quantity from one unit to another.
 * If units are across different dimensions (e.g. volume to mass), returns an error
 * unless an optional density (g/ml, default water is 1.0) is explicitly supplied.
 */
export function convertUnit(
  quantity: number,
  fromUnit: Unit,
  toUnit: Unit,
  densityGPerMl?: number
): UnitConversionResult {
  if (quantity < 0) {
    return {
      success: false,
      convertedQuantity: 0,
      error: 'Quantity cannot be negative',
    };
  }

  if (fromUnit === toUnit) {
    return { success: true, convertedQuantity: quantity };
  }

  const fromCat = getUnitCategory(fromUnit);
  const toCat = getUnitCategory(toUnit);

  // 1. Same category conversion
  if (fromCat === 'mass' && toCat === 'mass') {
    const inGrams = quantity * MASS_TO_GRAM[fromUnit];
    const target = inGrams / MASS_TO_GRAM[toUnit];
    return { success: true, convertedQuantity: target };
  }

  if (fromCat === 'volume' && toCat === 'volume') {
    const inMl = quantity * VOLUME_TO_ML[fromUnit];
    const target = inMl / VOLUME_TO_ML[toUnit];
    return { success: true, convertedQuantity: target };
  }

  if (fromCat === 'count' && toCat === 'count') {
    // 1 unit = 1 piece = 1 can etc unless pack conversion is specified
    return { success: true, convertedQuantity: quantity };
  }

  // 2. Cross-category conversion with explicit density (e.g., milk, syrup, oil)
  if (fromCat === 'volume' && toCat === 'mass') {
    const density = densityGPerMl ?? 1.0; // fallback to water-like 1g/ml
    const inMl = quantity * VOLUME_TO_ML[fromUnit];
    const inGrams = inMl * density;
    const target = inGrams / MASS_TO_GRAM[toUnit];
    return {
      success: true,
      convertedQuantity: target,
      isApproximate: densityGPerMl === undefined,
    };
  }

  if (fromCat === 'mass' && toCat === 'volume') {
    const density = densityGPerMl ?? 1.0;
    const inGrams = quantity * MASS_TO_GRAM[fromUnit];
    const inMl = inGrams / density;
    const target = inMl / VOLUME_TO_ML[toUnit];
    return {
      success: true,
      convertedQuantity: target,
      isApproximate: densityGPerMl === undefined,
    };
  }

  return {
    success: false,
    convertedQuantity: 0,
    error: `Cannot convert unit '${fromUnit}' (${fromCat}) to '${toUnit}' (${toCat}) without custom piece mapping.`,
  };
}

/**
 * Normalizes input text into standard unit strings.
 */
export function normalizeUnit(input: string): Unit {
  const clean = input.trim().toLowerCase().replace(/[^a-z_]/g, '');
  switch (clean) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
    case 'kgs':
      return 'kg';
    case 'g':
    case 'gram':
    case 'grams':
    case 'gm':
    case 'gms':
      return 'g';
    case 'mg':
    case 'milligram':
    case 'milligrams':
      return 'mg';
    case 'l':
    case 'liter':
    case 'liters':
    case 'litre':
    case 'litres':
    case 'ltr':
      return 'l';
    case 'ml':
    case 'milliliter':
    case 'milliliters':
    case 'millilitre':
    case 'millilitres':
      return 'ml';
    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      return 'lb';
    case 'oz':
    case 'ounce':
    case 'ounces':
      return 'oz';
    case 'floz':
    case 'fl_oz':
    case 'fluidounce':
    case 'fluidounces':
      return 'fl_oz';
    case 'can':
    case 'cans':
      return 'can';
    case 'bottle':
    case 'bottles':
    case 'btl':
      return 'bottle';
    case 'bunch':
    case 'bunches':
      return 'bunch';
    case 'pack':
    case 'packs':
    case 'pkt':
    case 'packet':
      return 'pack';
    case 'pc':
    case 'pcs':
    case 'piece':
    case 'pieces':
      return 'piece';
    case 'unit':
    case 'units':
    case 'ea':
    case 'each':
    default:
      return 'unit';
  }
}
