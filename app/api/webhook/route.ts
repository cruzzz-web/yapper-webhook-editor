import { NextResponse } from 'next/server'

const YAPIN_WEBHOOK = /^https:\/\/(?:www\.)?yapin\.gg\/api\/webhooks\/[A-Za-z0-9_-]+\/[A-Za-z0-9._~-]+$/

function getUrl(body: unknown) {
  const url = typeof body === 'object' && body !== null && 'url' in body ? (body as { url?: unknown }).url : undefined
  if (typeof url !== 'string' || !YAPIN_WEBHOOK.test(url)) throw new Error('Enter a valid Yapin webhook URL.')
  return url
}

async function yapin(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : typeof data?.error === 'string' ? data.error : 'Yapin rejected the request.'
    const error = new Error(message) as Error & { status?: number; retryAfter?: number }
    error.status = response.status
    error.retryAfter = Number(response.headers.get('retry-after')) || undefined
    throw error
  }
  return data
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = getUrl(body)
    if (body.action === 'load') return NextResponse.json({ connected: true })
    if (body.action === 'send') {
      const payload = body.payload
      if (!payload || typeof payload !== 'object') throw new Error('Message payload is required.')
      await yapin(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      return NextResponse.json({ sent: true })
    }
    return NextResponse.json({ error: 'Unsupported webhook action.' }, { status: 400 })
  } catch (error) {
    const status = typeof (error as { status?: number }).status === 'number' ? (error as { status: number }).status : 400
    const retryAfter = (error as { retryAfter?: number }).retryAfter
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook request failed.', retryAfter }, { status })
  }
}
