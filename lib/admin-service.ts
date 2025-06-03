import { createClient } from "@supabase/supabase-js"

export class AdminService {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  /**
   * Verifica se um usuário é administrador
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("role").eq("id", userId).single()

      if (error) throw error

      return data?.role === "admin"
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  /**
   * Cria um novo administrador (deve ser chamado apenas por outro admin)
   */
  async createAdmin(
    email: string,
    password: string,
    currentUserId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se o usuário atual é admin
      const isCurrentUserAdmin = await this.isAdmin(currentUserId)
      if (!isCurrentUserAdmin) {
        return { success: false, error: "Permissão negada" }
      }

      // Criar o usuário
      const { data: userData, error: userError } = await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (userError) throw userError

      // Definir o papel como admin
      const { error: roleError } = await this.supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userData.user.id)

      if (roleError) throw roleError

      return { success: true }
    } catch (error) {
      console.error("Error creating admin:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar administrador",
      }
    }
  }
}
