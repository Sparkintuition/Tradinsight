import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Map Postgres errors to the right HTTP status.
// SQLSTATE class 23 = integrity constraint violations (CHECK, UNIQUE, NOT NULL, FK)
// SQLSTATE class 22 = data exceptions (bad types, truncation, invalid input)
// These are always caused by bad client input → 4xx, not 5xx.
// Anything else (connection errors, deadlocks, internal failures) stays 500.
//
// PostgrestError.message already contains the constraint name for class-23 errors,
// e.g. 'new row ... violates check constraint "crypto_signals_signal_type_check"'.
function pgErrorResponse(error: { code?: string; message: string; details?: string | null }) {
  const code = error.code ?? ''
  const status =
    code === '23505' ? 409 :                                  // unique_violation → Conflict
    (code.startsWith('23') || code.startsWith('22')) ? 400 :  // integrity / data exception
    500                                                        // unknown → Internal Server Error
  return new Response(JSON.stringify({
    error: error.message,
    code: code || undefined,
    details: error.details ?? undefined,
  }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const WEBHOOK_SECRET            = Deno.env.get('TRADINGVIEW_WEBHOOK_SECRET')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // Validate shared secret when configured
  if (WEBHOOK_SECRET && body.secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Accept both TradingView native field names and custom ones
  const rawDirection = String(body.direction ?? body.action ?? '')
  const price        = Number(body.price ?? body.close ?? 0)
  const date         = String(body.date  ?? new Date().toISOString().split('T')[0])
  const analysis     = body.analysis ? String(body.analysis) : null

  if (!rawDirection || !price) {
    return new Response(JSON.stringify({ error: 'Missing direction or price' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Hold signals are TPI-layer-only and must be inserted manually via SQL.
  // The webhook only accepts Long/Short; reject Hold explicitly so it's visible in logs
  // (without this, the normaliser below would silently coerce "hold" to "Short").
  if (rawDirection.toLowerCase() === 'hold') {
    return new Response(JSON.stringify({
      error: 'Hold signals are not accepted via webhook. Insert manually via supabase/INSERT_HOLD_SIGNAL.sql.',
      received: rawDirection,
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Normalise direction to 'Long' / 'Short' to match what the Dashboard expects
  const direction: 'Long' | 'Short' =
    rawDirection.toLowerCase().startsWith('long') || rawDirection.toLowerCase() === 'buy'
      ? 'Long'
      : 'Short'

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Close any currently active BTC signals before inserting the new one
  const { data: prevActive } = await supabase
    .from('crypto_signals')
    .select('id')
    .eq('coin', 'BTC')
    .eq('status', 'active')

  if (prevActive && prevActive.length > 0) {
    const ids = prevActive.map((s: { id: string }) => s.id)
    await supabase
      .from('crypto_signals')
      .update({ status: 'closed' })
      .in('id', ids)
  }

  const { data, error } = await supabase
    .from('crypto_signals')
    .insert({
      coin:         'BTC',
      signal_type:  direction,
      signal_price: price,
      status:       'active',
      analysis,
    })
    .select('id')
    .single()

  if (error) {
    return pgErrorResponse(error)
  }

  // Fire email notification — non-blocking; failure doesn't affect the webhook response
  fetch(`${SUPABASE_URL}/functions/v1/send-signal-email`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type:   'signal',
      signal: { direction, price, date },
    }),
  }).catch(() => { /* non-critical */ })

  return new Response(JSON.stringify({ ok: true, id: data.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
