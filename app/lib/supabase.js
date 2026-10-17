import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// One client for the whole browser app. Stored on globalThis so Next.js
// hot reloads (and any duplicate module instances) reuse it instead of
// creating a second GoTrueClient that fights over the same session.
const globalForSupabase = globalThis

export const supabase =
  globalForSupabase.__mrRentSupabase ??
  (globalForSupabase.__mrRentSupabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }))