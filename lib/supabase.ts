import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if we're in local mode
export const isLocalMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Lazy initialization of Supabase client
let _supabase: SupabaseClient | null = null

export const getSupabaseClient = () => {
  if (_supabase) return _supabase

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if environment variables are properly set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  Missing Supabase environment variables!')
  console.warn('⚠️  App will run in LOCAL MODE only (no cloud database)')
  console.warn('⚠️  Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
}

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

// Export for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient]
  }
})

// Database types
export interface SavedDocument {
  id: string
  user_id?: string
  file_name: string
  summary: string
  questions: string[]

  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
} 