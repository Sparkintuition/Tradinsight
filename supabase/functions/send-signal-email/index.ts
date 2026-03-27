import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Helpers ──────────────────────────────────────────────────────────────────

function pillStyle(value: string): { color: string; bg: string; border: string } {
  const v = (value ?? '').toLowerCase()
  if (v === 'positive') return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
  if (v === 'negative') return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
  return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
}

function buildSignalEmail(direction: string, price: number, date: string): string {
  const isLong = direction.toLowerCase() === 'long'
  const badgeColor  = isLong ? '#22c55e' : '#ef4444'
  const badgeBg     = isLong ? 'rgba(34,197,94,0.12)'  : 'rgba(239,68,68,0.12)'
  const badgeBorder = isLong ? 'rgba(34,197,94,0.3)'   : 'rgba(239,68,68,0.3)'
  const arrow = isLong ? '▲' : '▼'
  const label = isLong ? 'Long' : 'Short'
  const formattedPrice = Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tradinsight Signal</title>
</head>
<body style="margin:0;padding:0;background:#0B0F19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F19;padding:48px 20px;">
    <tr><td align="center">
    <table width="100%" style="max-width:520px;text-align:left;">

      <!-- Header -->
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Tradinsight</span>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#121826;border:1px solid #1F2937;border-radius:16px;padding:28px 28px 24px;">

        <p style="margin:0 0 16px;font-size:10px;font-weight:700;color:#52525B;letter-spacing:1.8px;text-transform:uppercase;">New BTC Signal</p>

        <div style="margin-bottom:22px;">
          <span style="display:inline-block;padding:7px 18px;border-radius:20px;font-size:13px;font-weight:700;letter-spacing:0.3px;background:${badgeBg};color:${badgeColor};border:1px solid ${badgeBorder};">
            ${arrow} ${label}
          </span>
        </div>

        <p style="margin:0 0 4px;font-size:10px;color:#52525B;text-transform:uppercase;letter-spacing:1px;">Triggered Price</p>
        <p style="margin:0 0 6px;font-size:38px;font-weight:700;color:#ffffff;letter-spacing:-1px;font-variant-numeric:tabular-nums;">$${formattedPrice}</p>
        <p style="margin:0 0 24px;font-size:13px;color:#71717A;">${date}</p>

        <div style="text-align:center;margin:28px 0 8px;">
          <a href="https://tradinsight-iota.vercel.app"
             style="background:#6366f1;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;letter-spacing:-0.1px;">
            View Signal →
          </a>
        </div>
        <p style="text-align:center;margin:8px 0 0;font-size:11px;color:#52525b;">
          Or visit: <a href="https://tradinsight-iota.vercel.app" style="color:#6366f1;">tradinsight-iota.vercel.app</a>
        </p>

        <div style="border-top:1px solid #1F2937;margin:24px 0 20px;"></div>

        <p style="margin:0;font-size:13px;color:#A1A1AA;line-height:1.6;">Open the app to see full analysis and TPI context.</p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:22px 0 0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#3F3F46;line-height:1.6;">
          support@tradinsight.net &nbsp;·&nbsp; SPARKIN LTD &nbsp;·&nbsp; Not financial advice
        </p>
      </td></tr>

    </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildTpiEmail(va_state: string, tpi_state: string): string {
  const va  = pillStyle(va_state)
  const tpi = pillStyle(tpi_state)
  const vaLabel  = va_state  || 'Neutral'
  const tpiLabel = tpi_state || 'Neutral'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tradinsight Market Update</title>
</head>
<body style="margin:0;padding:0;background:#0B0F19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F19;padding:48px 20px;">
    <tr><td align="center">
    <table width="100%" style="max-width:520px;text-align:left;">

      <!-- Header -->
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Tradinsight</span>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#121826;border:1px solid #1F2937;border-radius:16px;padding:28px 28px 24px;">

        <p style="margin:0 0 16px;font-size:10px;font-weight:700;color:#52525B;letter-spacing:1.8px;text-transform:uppercase;">Market Conditions Updated</p>

        <p style="margin:0 0 24px;font-size:15px;color:#E4E4E7;line-height:1.6;">
          The Value Indicator and/or Medium Term TPI has been updated.
        </p>

        <!-- TPI readings -->
        <div style="background:#0F172A;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:14px;">
                <span style="font-size:10px;color:#52525B;display:block;margin-bottom:7px;text-transform:uppercase;letter-spacing:1px;">Value Indicator</span>
                <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:${va.bg};color:${va.color};border:1px solid ${va.border};">${vaLabel}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style="font-size:10px;color:#52525B;display:block;margin-bottom:7px;text-transform:uppercase;letter-spacing:1px;">Medium Term TPI</span>
                <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:${tpi.bg};color:${tpi.color};border:1px solid ${tpi.border};">${tpiLabel}</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin:28px 0 8px;">
          <a href="https://tradinsight-iota.vercel.app"
             style="background:#6366f1;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;letter-spacing:-0.1px;">
            View Market Conditions →
          </a>
        </div>
        <p style="text-align:center;margin:8px 0 0;font-size:11px;color:#52525b;">
          Or visit: <a href="https://tradinsight-iota.vercel.app" style="color:#6366f1;">tradinsight-iota.vercel.app</a>
        </p>

        <div style="border-top:1px solid #1F2937;margin-bottom:20px;"></div>

        <p style="margin:0;font-size:13px;color:#A1A1AA;line-height:1.6;">
          This may be relevant to the current open signal. Open the app to see the full picture.
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:22px 0 0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#3F3F46;line-height:1.6;">
          support@tradinsight.net &nbsp;·&nbsp; SPARKIN LTD &nbsp;·&nbsp; Not financial advice
        </p>
      </td></tr>

    </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: { type: string; signal?: { direction: string; price: number; date: string }; va_state?: string; tpi_state?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { type, signal, va_state, tpi_state } = body

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Fetch all premium users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('is_premium', true)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!users || users.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No premium users' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')!
  let sent = 0
  const errors: string[] = []

  for (const user of users) {
    const email: string = user.email
    if (!email) continue

    let subject: string
    let html: string

    if (type === 'signal' && signal) {
      const { direction, price, date } = signal
      const dirLabel = direction.charAt(0).toUpperCase() + direction.slice(1).toLowerCase()
      subject = `Tradinsight · BTC ${dirLabel} Signal`
      html = buildSignalEmail(direction, price, date)
    } else if (type === 'tpi') {
      subject = 'Tradinsight · Market Conditions Updated'
      html = buildTpiEmail(va_state ?? '', tpi_state ?? '')
    } else {
      errors.push(`Unknown type: ${type}`)
      continue
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Tradinsight <support@tradinsight.net>',
          to: [email],
          subject,
          html,
        }),
      })

      if (res.ok) {
        sent++
      } else {
        const errBody = await res.text()
        errors.push(`${email}: ${res.status} ${errBody}`)
      }
    } catch (e) {
      errors.push(`${email}: ${(e as Error).message}`)
    }
  }

  return new Response(JSON.stringify({ sent, total: users.length, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
