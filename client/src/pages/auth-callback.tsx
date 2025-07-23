import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth callback error:', error)
            setLocation('/?error=auth_failed')
            return
          }

          if (data.session) {
            console.log('Authentication successful, redirecting to dashboard')
            setLocation('/')
          } else {
            console.log('No session found, redirecting to landing')
            setLocation('/')
          }
        } else {
          // No code parameter, check if there's already a session
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Session check error:', error)
            setLocation('/?error=session_check_failed')
            return
          }

          if (data.session) {
            console.log('Existing session found, redirecting to dashboard')
            setLocation('/')
          } else {
            console.log('No session or code found, redirecting to landing')
            setLocation('/')
          }
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        setLocation('/?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}