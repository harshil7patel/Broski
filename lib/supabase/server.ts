import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { createClient as createJsClient } from "@supabase/supabase-js"

// For Server Components and Server Actions (uses next/headers cookies)
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll()      { return cookieStore.getAll() },
        setAll(toSet: { name: string; value: string; options?: any }[]) {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch { /* ignore — called from Server Component */ }
        },
      },
    }
  )
}

// For Route Handlers — reads the auth token from cookies directly
export function createRouteClient(req: NextRequest) {
  const allCookies = req.cookies.getAll()
  
  // Find any cookie related to supabase auth
  const authCookies = allCookies.filter(c => c.name.includes("auth-token"))
  
  let accessToken: string | null = null
  let refreshToken: string | null = null

  if (authCookies.length > 0) {
    // It might be a single cookie or chunked
    const baseName = authCookies[0].name.split('.')[0]
    
    const chunks: string[] = []
    // Try reading chunks 0, 1, 2...
    for (let i = 0; i < 5; i++) {
      const chunk = allCookies.find(c => c.name === `${baseName}.${i}`)
      if (chunk) chunks.push(chunk.value)
    }
    
    // If no chunks found, try the base name itself
    if (chunks.length === 0) {
      const baseCookie = allCookies.find(c => c.name === baseName)
      if (baseCookie) chunks.push(baseCookie.value)
    }

    if (chunks.length > 0) {
      try {
        const parsed = JSON.parse(chunks.join(""))
        accessToken = parsed.access_token || null
        refreshToken = parsed.refresh_token || null
      } catch (err) {
        console.error("Failed to parse auth cookie chunks", err)
      }
    }
  }

  // Create a regular Supabase client with the access token as auth header
  const supabase = createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )

  return { supabase, accessToken, refreshToken }
}

// Helper to get user from route handler request
export async function getRouteUser(req: NextRequest) {
  const { supabase, accessToken } = createRouteClient(req)
  if (!accessToken) return { supabase, user: null }

  try {
    // Manually decode JWT to completely bypass network requests on Windows
    const payload = accessToken.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    
    if (decoded && decoded.sub) {
      return { 
        supabase, 
        user: { 
          id: decoded.sub, 
          email: decoded.email,
          user_metadata: decoded.user_metadata || {}
        } 
      }
    }
  } catch (err) {
    console.error("JWT decode error:", err)
  }

  return { supabase, user: null }
}
