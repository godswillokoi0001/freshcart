import { createClient } from "@supabase/supabase-js"

function cleanSupabaseUrl(url?: string): string {
  if (!url) return "https://placeholder.supabase.co"
  // Remove trailing /rest/v1 or slashes which cause Supabase Auth/Realtime/Storage calls to 404
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "")
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = cleanSupabaseUrl(rawUrl)
const supabaseAnonKey = rawKey || "placeholder-anon-key"

export const isSupabaseConfigured = Boolean(rawUrl && rawKey && !rawUrl.includes("placeholder"))

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

