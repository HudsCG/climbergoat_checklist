import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  name: string
  email: string
  whatsapp: string
  location?: {
    latitude: number
    longitude: number
    city?: string
    state?: string
    country?: string
  }
  created_at: string
  updated_at: string
}

export interface ChecklistAnswers {
  id: string
  user_id: string
  answers: Record<string, boolean>
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}
