import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Auth callback started')
        console.log('🌐 Current URL:', window.location.href)
        console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
        console.log('🔧 App URL:', import.meta.env.VITE_APP_URL)
        
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error_param = urlParams.get('error')
        const error_description = urlParams.get('error_description')
        
        console.log('📋 URL Parameters:')
        console.log('  - code:', code ? `${code.substring(0, 20)}...` : 'null')
        console.log('  - error:', error_param)
        console.log('  - error_description:', error_description)
        
        if (error_param) {
          console.error('❌ OAuth error from provider:', error_param, error_description)
          setLocation(`/?error=oauth_${error_param}`)
          return
        }
        
        if (code) {
          console.log('🔄 Exchanging code for session...')
          console.log('🔍 Code length:', code.length)
          console.log('🔍 Code preview:', code.substring(0, 20) + '...')
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          console.log('📊 Exchange result:')
          console.log('  - data:', data)
          console.log('  - session:', data?.session ? 'exists' : 'null')
          console.log('  - user:', data?.user ? data.user.email : 'null')
          console.log('  - error:', error)
          
          if (error) {
            console.error('❌ Exchange error details:')
            console.error('  - message:', error.message)
            console.error('  - status:', error.status)
            console.error('  - details:', error)
            setLocation('/?error=auth_failed')
            return
          }

          if (data.session) {
            console.log('✅ Authentication successful, redirecting to dashboard')
            setLocation('/')
          } else {
            console.log('⚠️ No session found after exchange, redirecting to landing')
            setLocation('/')
          }
        } else {
          console.log('🔍 No code parameter, checking existing session...')
          // No code parameter, check if there's already a session
          const { data, error } = await supabase.auth.getSession()
          
          console.log('📊 Session check result:')
          console.log('  - session:', data?.session ? 'exists' : 'null')
          console.log('  - user:', data?.session?.user ? data.session.user.email : 'null')
          console.log('  - error:', error)
          
          if (error) {
            console.error('❌ Session check error:', error)
            setLocation('/?error=session_check_failed')
            return
          }

          if (data.session) {
            console.log('✅ Existing session found, redirecting to dashboard')
            setLocation('/')
          } else {
            console.log('⚠️ No session or code found, redirecting to landing')
            setLocation('/')
          }
        }
      } catch (error) {
        console.error('💥 Unexpected error during auth callback:', error)
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