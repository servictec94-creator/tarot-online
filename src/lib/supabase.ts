import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

// Client-side Supabase
export const createClient = () =>
  createClientComponentClient<Database>()

export type SupabaseClient = ReturnType<typeof createClient>