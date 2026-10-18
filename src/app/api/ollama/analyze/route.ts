import { NextRequest, NextResponse } from 'next/server';
import { generateHeuristicExplanation } from '@/lib/ruleBasedAdvisor';
import { ProfitLeakAIExplanation, ProfitLeakItem } from '@/types';

interface RawRec {
  id?: string;
  title?: string;
  category?: 'price_adjustment' | 'portion_control' | 'supplier_renegotiation' | 'menu_engineering';
  impactRecipe?: string;
  rationale?: string;
  suggestedAction?: string;
  estimatedPeriodicSavings?: number;
  priority?: 'high' | 'medium' | 'low';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      endpoint = 'http://localhost:11434',
      model = 'llama3.2:latest',
      leaks = [],
      businessName = 'PlateProfit Kitchen',
    } = body;

    if (!leaks || leaks.length === 0) {
      const fallback = generateHeuristicExplanation([], businessName);
      return NextResponse.json({ ok: true, explanation: fallback });
    }

    const cleanEndpoint = endpoint.trim().replace(/\/$/, '');

    // Check if endpoint is local
    try {
      const url = new URL(cleanEndpoint);
      const isLocal =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '::1' ||
        url.hostname.startsWith('192.168.') ||
        url.hostname.startsWith('10.');
      if (!isLocal) {
        throw new Error('Endpoint must be local.');
      }
    } catch {
      const fallback = generateHeuristicExplanation(leaks, businessName);
      return NextResponse.json({
        ok: true,
        explanation: {
          ...fallback,
          executiveTakeaway: `${fallback.executiveTakeaway} (Local network safety rule applied).`,
        },
      });
    }

    // Build focused prompt with strict JSON schema instructions
    const prompt = `You are a financial analyst specializing in restaurant food costing, cafe margins, and menu engineering.
Analyze the following confirmed ingredient cost price changes and their calculated impact on menu profitability.

DATA:
- Business: ${businessName}
- Total Leaks: ${leaks.length}
- Ranked Impact Items:
${leaks
  .slice(0, 5)
  .map(
    (l: ProfitLeakItem, i: number) =>
      `${i + 1}. Recipe "${l.recipeName}" (${l.salesVolume} sold/${l.salesPeriod}): ${l.ingredientName} price rose +${l.percentPriceIncrease}% (+$${l.unitCostDelta}/${l.unit}). Cost increase per serving: +$${l.costDeltaPerServing}. Periodic Profit Leak: -$${l.totalPeriodicLeakAmount}. Contribution Margin dropped from ${l.previousMarginPct}% to ${l.currentMarginPct}%.`
  )
  .join('\n')}

INSTRUCTIONS:
You MUST respond with valid JSON strictly matching this schema:
{
  "summary": "1-2 sentence executive summary of overall profit leakage",
  "keyDrivers": ["bullet point 1 explaining the highest cost shock", "bullet point 2"],
  "executiveTakeaway": "Single high-impact sentence on what the owner must address first",
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Action title (e.g. Compensate Menu Price on Croissant)",
      "category": "price_adjustment" | "portion_control" | "supplier_renegotiation" | "menu_engineering",
      "impactRecipe": "Specific dish name",
      "rationale": "Clear reasoning citing numbers",
      "suggestedAction": "Exact concrete step for the kitchen manager or owner",
      "estimatedPeriodicSavings": number (numeric value in dollars),
      "priority": "high" | "medium" | "low"
    }
  ]
}

DO NOT include conversational text outside the JSON.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout for local models

    try {
      const ollamaRes = await fetch(`${cleanEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.2, // low temperature for consistent factual deductions
            num_predict: 800,
          },
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!ollamaRes.ok) {
        throw new Error(`Ollama HTTP error ${ollamaRes.status}`);
      }

      const ollamaData = await ollamaRes.json();
      const rawResponse = ollamaData.response;
      const parsedJson = JSON.parse(rawResponse);

      // Validate schema compliance
      if (!parsedJson.summary || !Array.isArray(parsedJson.recommendations)) {
        throw new Error('Invalid JSON structure from model');
      }

      const explanation: ProfitLeakAIExplanation = {
        summary: parsedJson.summary,
        keyDrivers: Array.isArray(parsedJson.keyDrivers) ? parsedJson.keyDrivers : [],
        executiveTakeaway: parsedJson.executiveTakeaway || parsedJson.summary,
        recommendations: (parsedJson.recommendations as RawRec[]).map((r, idx) => ({
          id: r.id || `rec_ai_${idx}`,
          title: r.title || 'Suggested Action',
          category: r.category || 'price_adjustment',
          impactRecipe: r.impactRecipe || 'Menu Item',
          rationale: r.rationale || '',
          suggestedAction: r.suggestedAction || '',
          estimatedPeriodicSavings: typeof r.estimatedPeriodicSavings === 'number' ? r.estimatedPeriodicSavings : 0,
          priority: r.priority || 'medium',
        })),
        generatedAt: new Date().toISOString(),
        modelUsed: `${model} (Local Ollama)`,
        isAiGenerated: true,
      };

      return NextResponse.json({ ok: true, explanation });
    } catch (ollamaErr: unknown) {
      const errMsg = ollamaErr instanceof Error ? ollamaErr.message : 'Timeout or connection failure';
      console.warn('Ollama local inference unavailable or failed, utilizing deterministic rule engine:', errMsg);
      const fallback = generateHeuristicExplanation(leaks, businessName);
      return NextResponse.json({
        ok: true,
        explanation: fallback,
        notice: `Ollama local model was offline or timed out (${errMsg}). Provided verified deterministic analysis instead.`,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal error processing analysis';
    return NextResponse.json(
      { ok: false, error: errorMsg },
      { status: 500 }
    );
  }
}
