import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

  if (WEBHOOK_SECRET && body.secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const rawDirection = String(body.direction ?? body.action ?? '')
  const price        = Number(body.price ?? body.close ?? 0)
  const analysis     = body.analysis ? String(body.analysis) : null

  if (!rawDirection || !price) {
    return new Response(JSON.stringify({ error: 'Missing direction or price' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const direction: 'Long' | 'Short' =
    rawDirection.toLowerCase().startsWith('long') || rawDirection.toLowerCase() === 'buy'
      ? 'Long'
      : 'Short'

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase
    .from('eth_signals')
    .insert({
      signal_type:  direction,
      signal_price: price,
      status:       'active',
      analysis,
    })
    .select('id')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true, id: data.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
