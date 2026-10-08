// Vercel serverless function (Node.js runtime). Fires an email to the shop owner whenever
// the public business inquiry form (src/components/BusinessInquiryForm.tsx) submits
// successfully. Best effort only: the form's real source of truth is the inquiries DB row,
// already written before this is called — a failure here just means no email, not a lost
// inquiry.
import type { VercelRequest, VercelResponse } from '@vercel/node'

const NOTIFY_TO = 'hyeonnim98@naver.com'

interface InquiryPayload {
  companyName: string
  contactName: string
  phone: string
  email: string
  businessType: string
  region: string
  interestArea?: string
  expectedVolume?: string
  message: string
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Not configured yet — don't break the form over it, just skip silently server-side.
    res.status(200).json({ skipped: true })
    return
  }

  const body = req.body as InquiryPayload

  const rows: [string, string][] = [
    ['업체명/성함', body.companyName],
    ['담당자명', body.contactName],
    ['연락처', body.phone],
    ['이메일', body.email],
    ['업종', body.businessType],
    ['지역', body.region],
    ['관심 분야', body.interestArea || '-'],
    ['예상 사용량', body.expectedVolume || '-'],
  ]

  const html = `
    <h2>새 문의가 접수되었습니다</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color:#555;font-weight:600">${escapeHtml(label)}</td><td>${escapeHtml(value || '-')}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="margin-top:16px"><b>문의 내용</b><br/>${escapeHtml(body.message).replace(/\n/g, '<br/>')}</p>
    <p style="color:#888;font-size:12px;margin-top:16px">관리자 페이지 &gt; 문의 관리에서도 확인할 수 있습니다.</p>
  `

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KOINONIA ROASTERS <onboarding@resend.dev>',
        to: [NOTIFY_TO],
        subject: `[코이노니아] 새 문의 — ${body.companyName}`,
        html,
      }),
    })

    if (!resendRes.ok) {
      const detail = await resendRes.text()
      console.error('[notify-inquiry] Resend error:', detail)
      res.status(502).json({ error: 'Email send failed' })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[notify-inquiry] failed:', err)
    res.status(502).json({ error: 'Email send failed' })
  }
}
