import { supabase } from "./client"

export class SupabaseAdminService {
  private checkSupabaseConnection() {
    if (!supabase) {
      throw new Error("Supabase client not initialized. Check environment variables.")
    }
  }

  async signIn(email: string, password: string) {
    try {
      this.checkSupabaseConnection()

      console.log("🔐 Tentando fazer login com:", email)

      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ Erro de autenticação:", error)
        throw new Error(`Authentication failed: ${error.message}`)
      }

      if (!data.user) {
        throw new Error("No user data returned")
      }

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase!
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single()

      if (adminError || !adminUser) {
        await supabase!.auth.signOut()
        throw new Error("Access denied: Not an admin user")
      }

      return { user: data.user, adminUser }
    } catch (error) {
      console.error("🚨 Erro no login:", error)
      throw error
    }
  }

  async signOut() {
    this.checkSupabaseConnection()
    const { error } = await supabase!.auth.signOut()
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  }

  async resetPassword(email: string) {
    this.checkSupabaseConnection()
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`)
    }
  }

  async updatePassword(newPassword: string) {
    this.checkSupabaseConnection()
    const { error } = await supabase!.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(`Password update failed: ${error.message}`)
    }
  }

  async getCurrentUser() {
    try {
      this.checkSupabaseConnection()

      const {
        data: { user },
      } = await supabase!.auth.getUser()

      if (!user) return null

      const { data: adminUser, error } = await supabase!
        .from("admin_users")
        .select("*")
        .eq("email", user.email)
        .single()

      if (error || !adminUser) return null

      return { user, adminUser }
    } catch (error) {
      console.error("Erro ao verificar usuário atual:", error)
      return null
    }
  }

  async getSession() {
    this.checkSupabaseConnection()
    const {
      data: { session },
    } = await supabase!.auth.getSession()
    return session
  }
}
