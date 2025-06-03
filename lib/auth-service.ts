import { signInWithEmail } from "./supabase-client"

interface AuthResult {
  success: boolean
  user?: {
    email: string
    role: string
  }
  error?: string
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    // Check if we're online
    if (!navigator.onLine) {
      return {
        success: false,
        error: "Você precisa estar conectado à internet para fazer login",
      }
    }

    const { data, error } = await signInWithEmail(email, password)

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      return {
        success: true,
        user: {
          email: data.user.email || "",
          role: "admin",
        },
      }
    }

    return { success: false, error: "Falha na autenticação" }
  } catch (error) {
    return {
      success: false,
      error: "Erro de conectividade. Verifique sua conexão com a internet.",
    }
  }
}
