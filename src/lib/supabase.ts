import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface MockSupabaseClient extends SupabaseClient {
  _isMock?: boolean
}

let _client: MockSupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY

    if (!url || !key) {
      _client = createClient(
        'https://placeholder.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder'
      ) as MockSupabaseClient
      _client._isMock = true
    } else {
      _client = createClient(url, key)
    }
  }
  return _client
}

export const supabase = getSupabase()
