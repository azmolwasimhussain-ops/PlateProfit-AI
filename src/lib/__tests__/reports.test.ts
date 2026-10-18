import { describe, it, expect } from 'vitest';
import { parseSalesCSV } from '../reports';

describe('Sales CSV Import Parser', () => {
  it('correctly maps varying header casing and columns', () => {
    const csvData = `Dish Name,Quantity Sold,Unit Price,Date
Artisan Butter Croissant,320,4.75,2026-10-14
Ceremonial Matcha Cloud Latte,180,6.50,2026-10-14
San Sebastian Basque Burnt Cheesecake,120,7.50,2026-10-14`;

    const res = parseSalesCSV(csvData);
    expect(res.success).toBe(true);
    expect(res.records.length).toBe(3);
    expect(res.records[0].dishName).toBe('Artisan Butter Croissant');
    expect(res.records[0].quantitySold).toBe(320);
    expect(res.records[0].recordedPrice).toBe(4.75);
  });

  it('rejects malformed CSV lacking required columns', () => {
    const invalidCsv = `Color,Size,Category
Red,Large,Apparel`;

    const res = parseSalesCSV(invalidCsv);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Could not identify');
  });
});
