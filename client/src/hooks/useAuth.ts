import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    console.log('📧 Starting email sign-in...')
    console.log('🔧 Environment variables:')
    console.log('  - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('  - VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length)
    console.log('  - Email:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('📊 Email sign-in result:')
    console.log('  - data:', data)
    console.log('  - error:', error)
    console.log('  - error message:', error?.message)
    console.log('  - error status:', error?.status)
    
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    // Use environment-specific URL or fallback to current origin
    const redirectUrl = import.meta.env.VITE_APP_URL 
      ? `${import.meta.env.VITE_APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`
    
    console.log('🚀 Starting Google OAuth...')
    console.log('🔧 Environment variables:')
    console.log('  - VITE_APP_URL:', import.meta.env.VITE_APP_URL)
    console.log('  - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('🎯 Redirect URL:', redirectUrl)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    console.log('📊 OAuth initiation result:')
    console.log('  - data:', data)
    console.log('  - error:', error)
    console.log('  - url:', data?.url)
    
    if (error) {
      console.error('❌ Google OAuth error:', error)
    }
    return { data, error }
  }

  const signInWithApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({
      scope: 'local'
    })
    if (error) {
      console.error('Sign out error:', error)
    }
    // Ensure we stay on current domain after logout
    window.location.href = window.location.origin
    return { error }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
  }
}