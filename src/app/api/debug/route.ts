import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing env vars',
      hasUrl: !!url,
      hasKey: !!key,
    })
  }

  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase.from('barbers').select('id, name, email').limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        envUrl: url.substring(0, 20) + '...',
        envKeyLength: key.length,
      })
    }

    return NextResponse.json({
      status: 'ok',
      barbers: data,
      envUrl: url.substring(0, 20) + '...',
      envKeyLength: key.length,
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
