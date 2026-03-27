Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const WEBHOOK_SECRET            = Deno.env.get('TPI_WEBHOOK_SECRET')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (WEBHOOK_SECRET && body.secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const va_state  = body.va_state  ? String(body.va_state)  : ''
  const tpi_state = body.tpi_state ? String(body.tpi_state) : ''

  if (!va_state && !tpi_state) {
    return new Response(JSON.stringify({ error: 'Provide at least one of: va_state, tpi_state' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-signal-email`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'tpi', va_state, tpi_state }),
    })

    const result = await res.json()

    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
