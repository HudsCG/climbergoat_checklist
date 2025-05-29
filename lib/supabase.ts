import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validação obrigatória das variáveis
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Configuração do Supabase é obrigatória. Verifique as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

// Clean Code: Cliente tipado para type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Security: Não persistir sessões no cliente
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "climber-goat-checklist",
    },
  },
})

// Security: Função para verificar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1)
    return !error
  } catch {
    return false
  }
}

// Função para verificar se está em ambiente de desenvolvimento
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development"
}
