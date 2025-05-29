import { supabase } from "./client"

export class SupabaseAdminService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`)
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    if (adminError || !adminUser) {
      await supabase.auth.signOut()
      throw new Error("Access denied: Not an admin user")
    }

    return { user: data.user, adminUser }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`)
    }
  }

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(`Password update failed: ${error.message}`)
    }
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: adminUser, error } = await supabase.from("admin_users").select("*").eq("email", user.email).single()

    if (error || !adminUser) return null

    return { user, adminUser }
  }

  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  }
}
