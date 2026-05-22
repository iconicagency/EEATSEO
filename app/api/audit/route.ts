import { NextRequest, NextResponse } from 'next/server'
import { ALL_KEYS } from '@/lib/data'

export const runtime = 'edge'

const PROMPT = (url: string, robotsTxt: string, html: string) => `Bạn là chuyên gia SEO E-E-A-T. Phân tích URL và HTML sau, đánh giá từng tiêu chí kỹ thuật.

URL: ${url}
robots.txt (đầu): ${robotsTxt.slice(0, 600) || 'N/A'}
HTML (đầu): ${html.slice(0, 12000) || 'Không fetch được — phân tích dựa trên URL và domain'}

Trả về JSON hợp lệ (chỉ JSON, không markdown, không giải thích):
{
  "summary": "nhận xét tổng quan 2-3 câu về trang",
  "top_issues": ["vấn đề ưu tiên 1", "vấn đề 2", "vấn đề 3"],
  "top_strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "checks": {
    ${ALL_KEYS.map(k => `"${k}": {"status": "pass|warn|fail", "note": "lý do ngắn gọn"}`).join(',\n    ')}
  }
}`

async function fetchUrl(url: string): Promise<string> {
  try {
    const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(8000),
    })
    const d = await r.json()
    return d.contents || ''
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, apiKey } = await req.json()

    if (!url || !apiKey) {
      return NextResponse.json({ error: 'Thiếu URL hoặc API key' }, { status: 400 })
    }

    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({ error: 'API key không hợp lệ (phải bắt đầu bằng sk-ant-)' }, { status: 400 })
    }

    const [html, robotsTxt] = await Promise.all([
      fetchUrl(url),
      fetchUrl(new URL(url).origin + '/robots.txt'),
    ])

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: PROMPT(url, robotsTxt, html) }],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json()
      return NextResponse.json(
        { error: err.error?.message || `Lỗi Anthropic API: ${anthropicRes.status}` },
        { status: anthropicRes.status }
      )
    }

    const data = await anthropicRes.json()
    const raw = data.content.map((c: { text?: string }) => c.text || '').join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
