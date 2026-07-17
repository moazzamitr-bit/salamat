import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const useMockData =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project')

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (useMockData) return null
  if (!client && supabaseUrl && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}
