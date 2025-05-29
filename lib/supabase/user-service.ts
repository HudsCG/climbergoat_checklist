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
      // Primeiro, excluir todas as respostas do checklist deste usuário
      const { error: answersError } = await supabase.from("checklist_answers").delete().eq("user_id", id)

      if (answersError) {
        console.warn(`Warning: Could not delete checklist answers for user ${id}:`, answersError.message)
        // Não vamos falhar aqui, pois pode ser que o usuário não tenha respostas
      }

      // Depois, excluir o usuário
      const { error: userError } = await supabase.from("users").delete().eq("id", id)

      if (userError) {
        throw new Error(`Failed to delete user: ${userError.message}`)
      }

      console.log(`User ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  }
}
