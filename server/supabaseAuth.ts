import type { Express, RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js'

// For development, we'll use a simplified auth approach
// In production, you'd want to use a service role key for server-side auth
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not available on server side, using simplified auth')
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = authHeader.split(' ')[1]
  
  try {
    // For development, we'll extract user info from the JWT token directly
    // In production, you'd verify this with Supabase's auth API
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    if (!payload.sub) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Add user info to request object
    (req as any).user = {
      id: payload.sub,
      email: payload.email,
      user_metadata: payload.user_metadata || {}
    }
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ message: "Unauthorized" })
  }
}

export async function setupAuth(app: Express) {
  // Simple setup - no complex session management needed with Supabase
  console.log('Supabase authentication middleware ready')
}