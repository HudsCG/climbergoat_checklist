import { supabase, type User } from "./client"

export class SupabaseUserService {
  async createUser(userData: {
    name: string
    email: string
    whatsapp: string
    location?: any
  }): Promise<User> {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return data
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw new Error(`Failed to get user: ${error.message}`)
    }

    return data
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw new Error(`Failed to get user by email: ${error.message}`)
    }

    return data
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to get users: ${error.message}`)
    }

    return data || []
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return data
  }

  async deleteUser(id: string): Promise<void> {
    try {
      console.log(`🗑️ Iniciando exclusão do usuário: ${id}`)

      // Primeiro, verificar se o usuário existe
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", id)
        .single()

      if (checkError) {
        if (checkError.code === "PGRST116") {
          console.log(`❌ Usuário ${id} não encontrado`)
          throw new Error(`Usuário não encontrado`)
        }
        console.error(`❌ Erro ao verificar usuário:`, checkError)
        throw new Error(`Erro ao verificar usuário: ${checkError.message}`)
      }

      console.log(`✅ Usuário encontrado:`, existingUser)

      // Primeiro, tentar excluir todas as respostas do checklist deste usuário
      console.log(`🗑️ Excluindo respostas do checklist para usuário: ${id}`)
      const { error: answersError, count: deletedAnswers } = await supabase
        .from("checklist_answers")
        .delete()
        .eq("user_id", id)

      if (answersError) {
        console.warn(`⚠️ Aviso ao excluir respostas do checklist:`, answersError)
        // Não vamos falhar aqui, pois pode ser que o usuário não tenha respostas
      } else {
        console.log(`✅ Respostas do checklist excluídas. Count:`, deletedAnswers)
      }

      // Depois, excluir o usuário
      console.log(`🗑️ Excluindo usuário: ${id}`)
      const { error: userError, count: deletedUsers } = await supabase.from("users").delete().eq("id", id)

      if (userError) {
        console.error(`❌ Erro ao excluir usuário:`, userError)
        throw new Error(`Failed to delete user: ${userError.message}`)
      }

      console.log(`✅ Usuário excluído com sucesso. Count:`, deletedUsers)

      // Verificar se realmente foi excluído
      const { data: verifyUser, error: verifyError } = await supabase.from("users").select("id").eq("id", id).single()

      if (verifyError && verifyError.code === "PGRST116") {
        console.log(`✅ Confirmado: usuário ${id} foi excluído do banco`)
      } else if (verifyUser) {
        console.error(`❌ PROBLEMA: usuário ${id} ainda existe no banco!`)
        throw new Error(`Usuário não foi excluído do banco de dados`)
      }
    } catch (error) {
      console.error(`❌ Erro geral na exclusão do usuário ${id}:`, error)
      throw error
    }
  }
}
