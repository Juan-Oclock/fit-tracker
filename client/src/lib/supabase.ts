import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

console.log('Supabase URL length:', supabaseUrl.length)
console.log('Supabase Anon Key length:', supabaseAnonKey.length)
console.log('Extracted Supabase URL from JWT:', supabaseUrl)

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Should be https://your-project-id.supabase.co`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})