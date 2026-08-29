// Vercel serverless function (Node.js runtime, Web-standard Request/Response signature —
// no @vercel/node dependency needed). Fires an email to the shop owner whenever the public
// wholesale order form (src/components/WholesaleOrderForm.tsx) submits successfully. Best
// effort only: the form's real source of truth is the wholesale_requests DB row, already
// written before this is called — a failure here just means no email, not a lost request.
const NOTIFY_TO = 'hyeonnim98@naver.com'

interface WholesaleRequestPayload {
  name: string
  phone: string
  address: string
  coffeeType: string
  expectedKg: string
  orderFrequency: string
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Not configured yet — don't break the form over it, just skip silently server-side.
    return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  }

  let body: WholesaleRequestPayload
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const rows: [string, string][] = [
    ['성함', body.name],
    ['연락처', body.phone],
    ['주소', body.address],
    ['원두 종류', body.coffeeType],
    ['예상 kg', body.expectedKg],
    ['주문 예상 주기', body.orderFrequency],
  ]

  const html = `
    <h2>새 원두 납품 신청이 접수되었습니다</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color:#555;font-weight:600">${escapeHtml(label)}</td><td>${escapeHtml(value || '-')}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="color:#888;font-size:12px;margin-top:16px">관리자 페이지 &gt; 납품 신청에서도 확인할 수 있습니다.</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'KOINONIA ROASTERS <onboarding@resend.dev>',
      to: [NOTIFY_TO],
      subject: `[코이노니아] 새 원두 납품 신청 — ${body.name}`,
      html,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('[notify-wholesale-request] Resend error:', detail)
    return new Response(JSON.stringify({ error: 'Email send failed' }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
