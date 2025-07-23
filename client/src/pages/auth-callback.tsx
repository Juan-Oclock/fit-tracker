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
        const access_token = urlParams.get('access_token')
        const refresh_token = urlParams.get('refresh_token')
        const error_param = urlParams.get('error')
        const error_description = urlParams.get('error_description')
        
        console.log('🔍 URL Parameters:')
        console.log('  - code:', code ? 'present' : 'null')
        console.log('  - access_token:', access_token ? 'present' : 'null')
        console.log('  - refresh_token:', refresh_token ? 'present' : 'null')
        console.log('  - error:', error_param)
        
        if (error_param) {
          console.error('❌ OAuth error from provider:', error_param, error_description)
          setLocation(`/?error=oauth_${error_param}`)
          return
        }
        
        // Handle PKCE flow with direct tokens
        if (access_token && refresh_token) {
          console.log('🔄 PKCE flow detected - tokens received directly')
          
          // Set the session using the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })
          
          console.log('📊 Session set result:')
          console.log('  - data:', data)
          console.log('  - session:', data?.session ? 'exists' : 'null')
          console.log('  - user:', data?.user ? data.user.email : 'null')
          console.log('  - error:', error)
          
          if (error) {
            console.error('❌ Session set error:', error)
            setLocation('/?error=auth_failed')
            return
          }

          if (data.session) {
            console.log('✅ Authentication successful, redirecting to dashboard')
            setLocation('/')
          } else {
            console.log('⚠️ No session found after setting tokens, redirecting to landing')
            setLocation('/')
          }
        }
        // Handle traditional code exchange flow
        else if (code) {
          console.log('🔄 Code exchange flow detected')
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
          console.log('🔍 No code or tokens, checking existing session...')
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