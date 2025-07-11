import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

console.log('Supabase URL length:', supabaseUrl.length)
console.log('Supabase Anon Key length:', supabaseAnonKey.length)

// Fix JWT token URL issue - extract project ref from JWT if needed
if (supabaseUrl.startsWith('eyJ')) {
  try {
    // Decode the JWT to get the project reference
    const payload = JSON.parse(atob(supabaseUrl.split('.')[1]))
    if (payload.ref) {
      supabaseUrl = `https://${payload.ref}.supabase.co`
      console.log('Extracted Supabase URL from JWT:', supabaseUrl)
    }
  } catch (error) {
    console.error('Failed to decode JWT token:', error)
  }
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Should be https://your-project-id.supabase.co`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})