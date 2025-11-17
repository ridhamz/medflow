import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('[client-error]', body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error processing client log:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
