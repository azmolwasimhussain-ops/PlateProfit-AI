import { Ingredient, Recipe, PriceHistoryEntry, ExtractedInvoice } from '@/types';

export const DEMO_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing_demo_butter',
    name: 'European Unsalted Butter 82%',
    category: 'Dairy',
    supplier: 'Alps Dairy Co.',
    defaultUnit: 'g',
    packSize: 5,
    packUnit: 'kg',
    packCost: 48.0, // jumped from 38.0
    costPerDefaultUnit: 0.0096, // $0.0096/g ($9.60/kg)
    lastUpdated: '2026-10-14',
    notes: 'Grade A unsalted high fat butter for pastry lamination.',
  },
  {
    id: 'ing_demo_flour',
    name: 'French T55 Pastry Flour',
    category: 'Dry Goods',
    supplier: 'Golden Grain Mills',
    defaultUnit: 'g',
    packSize: 25,
    packUnit: 'kg',
    packCost: 26.5,
    costPerDefaultUnit: 0.00106,
    lastUpdated: '2026-09-28',
    notes: 'Standard ash flour for croissants and baguettes.',
  },
  {
    id: 'ing_demo_espresso',
    name: 'Single Origin Ethiopia Yirgacheffe',
    category: 'Beverage & Coffee',
    supplier: 'Equator Coffee Roasters',
    defaultUnit: 'g',
    packSize: 1,
    packUnit: 'kg',
    packCost: 28.0, // jumped from 22.50
    costPerDefaultUnit: 0.028, // $0.028/g ($28/kg)
    lastUpdated: '2026-10-12',
    notes: 'Washed heirloom beans, light-medium roast.',
  },
  {
    id: 'ing_demo_milk',
    name: 'Organic Whole Milk 3.8%',
    category: 'Dairy',
    supplier: 'Valley Fresh Farms',
    defaultUnit: 'ml',
    packSize: 10,
    packUnit: 'l',
    packCost: 19.5, // jumped from 16.0
    costPerDefaultUnit: 0.00195, // $0.00195/ml ($1.95/l)
    lastUpdated: '2026-10-10',
    notes: 'Barista series micro-foaming whole milk.',
  },
  {
    id: 'ing_demo_matcha',
    name: 'Uji Ceremonial Grade Matcha',
    category: 'Beverage & Coffee',
    supplier: 'Zenith Teas Japan',
    defaultUnit: 'g',
    packSize: 500,
    packUnit: 'g',
    packCost: 65.0,
    costPerDefaultUnit: 0.13,
    lastUpdated: '2026-09-15',
    notes: 'First harvest stone-ground green tea powder.',
  },
  {
    id: 'ing_demo_cream_cheese',
    name: 'Philadelphia Block Cream Cheese',
    category: 'Dairy',
    supplier: 'Alps Dairy Co.',
    defaultUnit: 'g',
    packSize: 2,
    packUnit: 'kg',
    packCost: 22.0, // jumped from 18.0
    costPerDefaultUnit: 0.011,
    lastUpdated: '2026-10-08',
    notes: 'Original block for Basque cheesecake.',
  },
  {
    id: 'ing_demo_sugar',
    name: 'Organic Cane Sugar',
    category: 'Dry Goods',
    supplier: 'Golden Grain Mills',
    defaultUnit: 'g',
    packSize: 20,
    packUnit: 'kg',
    packCost: 24.0,
    costPerDefaultUnit: 0.0012,
    lastUpdated: '2026-09-01',
    notes: 'Fine granulated white cane sugar.',
  },
  {
    id: 'ing_demo_eggs',
    name: 'Free-Range Large Eggs',
    category: 'Poultry & Eggs',
    supplier: 'Valley Fresh Farms',
    defaultUnit: 'unit',
    packSize: 30,
    packUnit: 'unit',
    packCost: 10.5,
    costPerDefaultUnit: 0.35,
    lastUpdated: '2026-10-02',
    notes: 'Carton of 30 Grade AA brown eggs.',
  },
  {
    id: 'ing_demo_heavy_cream',
    name: 'Heavy Whipping Cream 36%',
    category: 'Dairy',
    supplier: 'Alps Dairy Co.',
    defaultUnit: 'ml',
    packSize: 2,
    packUnit: 'l',
    packCost: 14.0,
    costPerDefaultUnit: 0.007,
    lastUpdated: '2026-10-05',
    notes: 'High butterfat whipping cream.',
  },
  {
    id: 'ing_demo_vanilla',
    name: 'Madagascar Bourbon Vanilla Bean Paste',
    category: 'Flavoring',
    supplier: 'Zenith Teas Japan',
    defaultUnit: 'g',
    packSize: 500,
    packUnit: 'g',
    packCost: 55.0,
    costPerDefaultUnit: 0.11,
    lastUpdated: '2026-08-20',
    notes: 'Pure seed paste with natural extract.',
  },
];

export const DEMO_PRICE_HISTORY: PriceHistoryEntry[] = [
  {
    id: 'ph_demo_1',
    ingredientId: 'ing_demo_butter',
    ingredientName: 'European Unsalted Butter 82%',
    supplier: 'Alps Dairy Co.',
    date: '2026-10-14',
    oldPackCost: 38.0,
    newPackCost: 48.0,
    packSize: 5,
    packUnit: 'kg',
    oldUnitCost: 7.6,
    newUnitCost: 9.6,
    deltaCost: 2.0, // +$2.00/kg
    percentDelta: 26.3, // +26.3%
    source: 'invoice_ocr',
    invoiceRef: 'INV-ALP-9041',
  },
  {
    id: 'ph_demo_2',
    ingredientId: 'ing_demo_espresso',
    ingredientName: 'Single Origin Ethiopia Yirgacheffe',
    supplier: 'Equator Coffee Roasters',
    date: '2026-10-12',
    oldPackCost: 22.5,
    newPackCost: 28.0,
    packSize: 1,
    packUnit: 'kg',
    oldUnitCost: 22.5,
    newUnitCost: 28.0,
    deltaCost: 5.5, // +$5.50/kg
    percentDelta: 24.4, // +24.4%
    source: 'invoice_ocr',
    invoiceRef: 'EQ-88124',
  },
  {
    id: 'ph_demo_3',
    ingredientId: 'ing_demo_milk',
    ingredientName: 'Organic Whole Milk 3.8%',
    supplier: 'Valley Fresh Farms',
    date: '2026-10-10',
    oldPackCost: 16.0,
    newPackCost: 19.5,
    packSize: 10,
    packUnit: 'l',
    oldUnitCost: 1.6,
    newUnitCost: 1.95,
    deltaCost: 0.35, // +$0.35/l
    percentDelta: 21.9,
    source: 'manual',
  },
  {
    id: 'ph_demo_4',
    ingredientId: 'ing_demo_cream_cheese',
    ingredientName: 'Philadelphia Block Cream Cheese',
    supplier: 'Alps Dairy Co.',
    date: '2026-10-08',
    oldPackCost: 18.0,
    newPackCost: 22.0,
    packSize: 2,
    packUnit: 'kg',
    oldUnitCost: 9.0,
    newUnitCost: 11.0,
    deltaCost: 2.0, // +$2.00/kg
    percentDelta: 22.2,
    source: 'invoice_ocr',
    invoiceRef: 'INV-ALP-8720',
  },
];

export const DEMO_RECIPES: Recipe[] = [
  {
    id: 'rec_demo_croissant',
    name: 'Artisan Butter Croissant',
    category: 'Viennoiserie & Pastry',
    servings: 12, // batch of 12
    sellingPrice: 4.75, // $4.75 menu price
    packagingCost: 0.2, // kraft paper pouch + wax liner
    otherVariableCost: 0.05, // napkin
    targetMarginPct: 72,
    salesVolume: 320, // 320 sold per week
    salesVolumePeriod: 'weekly',
    notes: 'Signature 3-day lamination process with European 82% butter.',
    ingredients: [
      { id: 'item_1', ingredientId: 'ing_demo_butter', quantity: 600, unit: 'g' }, // 50g butter per croissant!
      { id: 'item_2', ingredientId: 'ing_demo_flour', quantity: 700, unit: 'g' },
      { id: 'item_3', ingredientId: 'ing_demo_milk', quantity: 200, unit: 'ml' },
      { id: 'item_4', ingredientId: 'ing_demo_sugar', quantity: 80, unit: 'g' },
      { id: 'item_5', ingredientId: 'ing_demo_eggs', quantity: 1, unit: 'unit' }, // egg wash
    ],
  },
  {
    id: 'rec_demo_latte',
    name: 'Artisan Flat White / Latte',
    category: 'Specialty Coffee',
    servings: 1,
    sellingPrice: 5.25,
    packagingCost: 0.35, // compostable cup, sip lid, heat sleeve
    otherVariableCost: 0.05, // stir stick, napkin
    targetMarginPct: 75,
    salesVolume: 450, // 450 sold per week
    salesVolumePeriod: 'weekly',
    notes: 'Double ristretto shot (18g dry dose) with 220ml silky textured whole milk.',
    ingredients: [
      { id: 'item_10', ingredientId: 'ing_demo_espresso', quantity: 18, unit: 'g' },
      { id: 'item_11', ingredientId: 'ing_demo_milk', quantity: 240, unit: 'ml' },
    ],
  },
  {
    id: 'rec_demo_matcha_latte',
    name: 'Ceremonial Matcha Cloud Latte',
    category: 'Specialty Coffee',
    servings: 1,
    sellingPrice: 6.5,
    packagingCost: 0.4, // iced cup, dome lid, straw
    otherVariableCost: 0.1, // ice & sweetener
    targetMarginPct: 70,
    salesVolume: 180,
    salesVolumePeriod: 'weekly',
    notes: 'Hand-whisked Uji matcha layered over fresh cold milk.',
    ingredients: [
      { id: 'item_20', ingredientId: 'ing_demo_matcha', quantity: 4, unit: 'g' },
      { id: 'item_21', ingredientId: 'ing_demo_milk', quantity: 220, unit: 'ml' },
      { id: 'item_22', ingredientId: 'ing_demo_sugar', quantity: 15, unit: 'g' },
    ],
  },
  {
    id: 'rec_demo_basque',
    name: 'San Sebastian Basque Burnt Cheesecake',
    category: 'Viennoiserie & Pastry',
    servings: 8, // 8 slices per 9-inch cake
    sellingPrice: 7.5, // $7.50 per slice
    packagingCost: 0.45, // clamshell wedge box + branded sticker
    otherVariableCost: 0.1, // fork + napkin
    targetMarginPct: 68,
    salesVolume: 120, // 120 slices per week
    salesVolumePeriod: 'weekly',
    notes: 'Ultra creamy center with caramelized dark top crust.',
    ingredients: [
      { id: 'item_30', ingredientId: 'ing_demo_cream_cheese', quantity: 900, unit: 'g' },
      { id: 'item_31', ingredientId: 'ing_demo_sugar', quantity: 280, unit: 'g' },
      { id: 'item_32', ingredientId: 'ing_demo_eggs', quantity: 5, unit: 'unit' },
      { id: 'item_33', ingredientId: 'ing_demo_heavy_cream', quantity: 450, unit: 'ml' },
      { id: 'item_34', ingredientId: 'ing_demo_flour', quantity: 25, unit: 'g' },
      { id: 'item_35', ingredientId: 'ing_demo_vanilla', quantity: 10, unit: 'g' },
    ],
  },
];

export const DEMO_SAMPLE_INVOICE: ExtractedInvoice = {
  id: 'inv_demo_alp_9041',
  invoiceNumber: 'INV-ALP-9041',
  supplier: 'Alps Dairy Co.',
  date: '2026-10-14',
  fileName: 'alps_dairy_october_invoice.pdf',
  totalAmount: 118.0,
  rawText: `ALPS DAIRY CO. - TAX INVOICE
Invoice #: INV-ALP-9041
Date: 14 Oct 2026
Sold To: Velvet Bean & Bakery

ITEM DESCRIPTION               QTY   UNIT   RATE      TOTAL
------------------------------------------------------------
European Unsalted Butter 82%   2     kg     24.00     48.00  (2 x 5kg case)
Philadelphia Cream Cheese      1     kg     22.00     22.00  (1 x 2kg pack)
Heavy Whipping Cream 36%       2     l      14.00     28.00  (2 x 2l jug)
Pasture Cultured Buttermilk    4     l       5.00     20.00
------------------------------------------------------------
TOTAL AMOUNT DUE: $118.00
Payment Terms: Net 15`,
  lineItems: [
    {
      id: 'li_1',
      rawText: 'European Unsalted Butter 82%   2     kg     24.00     48.00',
      description: 'European Unsalted Butter 82%',
      matchedIngredientId: 'ing_demo_butter',
      matchedIngredientName: 'European Unsalted Butter 82%',
      isNewIngredient: false,
      quantity: 5,
      unit: 'kg',
      unitPrice: 9.6,
      lineTotal: 48.0,
      calculatedTotal: 48.0,
      arithmeticMismatch: false,
      confidence: 0.96,
      verified: true,
    },
    {
      id: 'li_2',
      rawText: 'Philadelphia Cream Cheese      1     kg     22.00     22.00',
      description: 'Philadelphia Block Cream Cheese',
      matchedIngredientId: 'ing_demo_cream_cheese',
      matchedIngredientName: 'Philadelphia Block Cream Cheese',
      isNewIngredient: false,
      quantity: 2,
      unit: 'kg',
      unitPrice: 11.0,
      lineTotal: 22.0,
      calculatedTotal: 22.0,
      arithmeticMismatch: false,
      confidence: 0.94,
      verified: true,
    },
    {
      id: 'li_3',
      rawText: 'Heavy Whipping Cream 36%       2     l      14.00     28.00',
      description: 'Heavy Whipping Cream 36%',
      matchedIngredientId: 'ing_demo_heavy_cream',
      matchedIngredientName: 'Heavy Whipping Cream 36%',
      isNewIngredient: false,
      quantity: 4,
      unit: 'l',
      unitPrice: 7.0,
      lineTotal: 28.0,
      calculatedTotal: 28.0,
      arithmeticMismatch: false,
      confidence: 0.92,
      verified: true,
    },
  ],
  status: 'confirmed',
  createdAt: '2026-10-14T10:15:00Z',
};
