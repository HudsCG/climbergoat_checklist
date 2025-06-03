import type { SupabaseClient } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  role: string
}

interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

class AuthService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Usar exclusivamente o Supabase para autenticação
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Verificar se o usuário é admin consultando o perfil no banco
      const { data: profile } = await this.supabase.from("profiles").select("role").eq("id", data.user.id).single()

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || "user",
        },
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Falha na autenticação" }
    }
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut()
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Signup error:", error)
        return { success: false, error: error.message }
      }

      // Create a user profile in the 'profiles' table
      const { error: profileError } = await this.supabase
        .from("profiles")
        .insert([{ id: data.user.id, email: data.user.email, role: "user" }])

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { success: false, error: "Erro ao criar perfil de usuário." }
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: "user",
        },
      }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "Falha ao criar conta" }
    }
  }

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: profile, error } = await this.supabase.from("profiles").select("role").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: profile?.role || "user",
    }
  }
}

export default AuthService
