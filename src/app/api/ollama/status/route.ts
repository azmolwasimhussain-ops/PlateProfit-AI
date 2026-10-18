import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = (body.endpoint || 'http://localhost:11434').trim().replace(/\/$/, '');

    // Security check: only allow localhost or private IP addresses, do not allow arbitrary open web scraping
    const url = new URL(endpoint);
    const hostname = url.hostname;
    const isAllowed =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local');

    if (!isAllowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Only local network endpoints (localhost, 127.0.0.1, or LAN IPs) are permitted for Ollama.',
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `Ollama returned HTTP status ${res.status} ${res.statusText}`,
      });
    }

    const data = await res.json();
    const latencyMs = Date.now() - startTime;
    const models: string[] = (data.models || []).map((m: { name?: string; model?: string }) => m.name || m.model || '');

    return NextResponse.json({
      ok: true,
      latencyMs,
      models,
      rawCount: models.length,
    });
  } catch (err: unknown) {
    const errorObj = err as { name?: string; message?: string };
    const msg =
      errorObj?.name === 'AbortError'
        ? 'Connection timed out (4s). Is Ollama running on this port?'
        : errorObj?.message || 'Could not connect to Ollama';

    return NextResponse.json({
      ok: false,
      error: msg,
    });
  }
}
