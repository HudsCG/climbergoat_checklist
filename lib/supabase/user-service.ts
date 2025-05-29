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
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }
}
