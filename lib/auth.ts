import { supabase } from "./supabase"
import { logger } from "./logger"

export interface AuthResult {
  success: boolean
  token?: string
  error?: string
  message?: string
}

// Autenticação via Supabase Auth
export async function authenticateAdmin(email: string, password: string): Promise<AuthResult> {
  try {
    // Tentar login com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.securityEvent("Failed admin login attempt", { email, error: error.message })
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Verificar se é admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("email", email)
        .single()

      if (adminError || !adminData) {
        logger.securityEvent("Non-admin user attempted login", { email })
        return { success: false, error: "Usuário não é administrador" }
      }

      logger.info("Successful admin login", { email, userId: data.user.id })
      return {
        success: true,
        token: data.session?.access_token,
      }
    }

    return { success: false, error: "Falha na autenticação" }
  } catch (error) {
    logger.error("Admin authentication error", { error: error.message, email })
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Recuperação de senha via Supabase
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    // Verificar se o email existe na tabela admin_users
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", email)
      .single()

    if (adminError || !adminData) {
      logger.securityEvent("Password reset attempted for non-admin email", { email })
      return { success: false, error: "Email não encontrado nos administradores" }
    }

    // Enviar email de recuperação
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
    })

    if (error) {
      logger.error("Password reset email failed", { email, error: error.message })
      return { success: false, error: error.message }
    }

    logger.info("Password reset email sent", { email })
    return {
      success: true,
      message: "Email de recuperação enviado! Verifique sua caixa de entrada.",
    }
  } catch (error) {
    logger.error("Password reset error", { error: error.message, email })
    return { success: false, error: "Erro ao enviar email de recuperação" }
  }
}

// Confirmar reset de senha via Supabase
export async function confirmPasswordReset(newPassword: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      logger.error("Password update failed", { error: error.message })
      return { success: false, error: error.message }
    }

    logger.info("Password updated successfully")
    return {
      success: true,
      message: "Senha atualizada com sucesso! Você pode fazer login agora.",
    }
  } catch (error) {
    logger.error("Password confirmation error", { error: error.message })
    return { success: false, error: "Erro ao atualizar senha" }
  }
}

// Verificar token
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser(token)
    return !error && !!data.user
  } catch {
    return false
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut()
    logger.info("User logged out")
  } catch (error) {
    logger.error("Logout error", { error: error.message })
  }
}

// Verificar se usuário atual é admin
export async function verifyCurrentUserIsAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: adminData, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", user.email)
      .single()

    return !error && !!adminData
  } catch {
    return false
  }
}
