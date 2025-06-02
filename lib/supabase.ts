// Modificar o arquivo para lidar com ambiente de preview

import { createClient } from "@supabase/supabase-js"

// Detectar se estamos em ambiente de preview
const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("v0.dev") || window.location.hostname.includes("vusercontent.net")
}

// Criar cliente Supabase apenas se não estivermos no ambiente de preview
let supabase: any

if (!isPreviewEnvironment()) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn("Variáveis de ambiente do Supabase não encontradas")
    // Criar um cliente mock para evitar erros
    supabase = {
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Ambiente de preview") }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
        updateUser: () => Promise.resolve({ data: null, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        upsert: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: () => ({ data: null, error: null }),
        single: () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null }),
      }),
    }
  }
} else {
  // Cliente mock para ambiente de preview
  supabase = {
    auth: {
      signInWithPassword: async (credentials: any) => {
        // Simular login apenas para admin@climbergoat.com
        if (credentials.email === "admin@climbergoat.com" && credentials.password === "admin123") {
          return {
            data: {
              user: {
                id: "preview-admin-id",
                email: "admin@climbergoat.com",
                role: "authenticated",
              },
            },
            error: null,
          }
        }
        return { data: null, error: { message: "Credenciais inválidas" } }
      },
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: {}, error: null }),
      getUser: async () => {
        // Verificar se há um usuário "logado" no localStorage
        const isLoggedIn = localStorage.getItem("preview_admin_logged_in") === "true"
        if (isLoggedIn) {
          return {
            data: {
              user: {
                id: "preview-admin-id",
                email: "admin@climbergoat.com",
                role: "authenticated",
              },
            },
            error: null,
          }
        }
        return { data: { user: null }, error: null }
      },
    },
    from: (table: string) => {
      return {
        select: () => {
          return {
            eq: () => {
              return {
                single: () => {
                  return { data: null, error: null }
                },
              }
            },
            order: () => {
              return { data: [], error: null }
            },
          }
        },
        insert: () => ({ data: null, error: null }),
        upsert: () => {
          return {
            select: () => {
              return {
                single: () => {
                  return { data: { id: "preview-id" }, error: null }
                },
              }
            },
          }
        },
        delete: () => ({ data: null, error: null }),
      }
    },
  }
}

export { supabase }

// Database types
export interface UserData {
  id?: string
  name: string
  email: string
  whatsapp: string
  created_at?: string
  updated_at?: string
}

export interface ChecklistAnswers {
  id?: string
  user_id: string
  answers: Record<string, boolean>
  total_score: number
  completed_at: string
  created_at?: string
  updated_at?: string
}

// Auth helpers com suporte a ambiente de preview
export const signInWithEmail = async (email: string, password: string) => {
  if (isPreviewEnvironment()) {
    // No ambiente de preview, permitir apenas login com credenciais específicas
    if (email === "admin@climbergoat.com" && password === "admin123") {
      localStorage.setItem("preview_admin_logged_in", "true")
      return {
        data: {
          user: {
            id: "preview-admin-id",
            email: "admin@climbergoat.com",
          },
        },
        error: null,
      }
    }
    return { data: null, error: { message: "Credenciais inválidas" } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  if (isPreviewEnvironment()) {
    localStorage.removeItem("preview_admin_logged_in")
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  if (isPreviewEnvironment()) {
    return { data: {}, error: null }
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  })
  return { data, error }
}

export const updatePassword = async (password: string) => {
  if (isPreviewEnvironment()) {
    return { data: {}, error: null }
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password,
  })
  return { data, error }
}

export const getCurrentUser = async () => {
  if (isPreviewEnvironment()) {
    const isLoggedIn = localStorage.getItem("preview_admin_logged_in") === "true"
    if (isLoggedIn) {
      return {
        user: {
          id: "preview-admin-id",
          email: "admin@climbergoat.com",
          role: "authenticated",
        },
        error: null,
      }
    }
    return { user: null, error: null }
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}
