import { getSupabaseClient, isSupabaseConfigured } from "../supabase"
import type { ChecklistCategory } from "../checklist-data"

// Clean Code: Interfaces bem definidas
export interface User {
  id: string
  name: string
  email: string
  whatsapp: string
  location?: {
    latitude?: number
    longitude?: number
    city?: string
    state?: string
    country?: string
    timezone?: string
    ip?: string
    source: "gps" | "ip" | "manual"
  }
  createdAt: string
  updatedAt: string
}

export interface ChecklistAnswer {
  id: string
  userId: string
  answers: Record<string, boolean>
  totalScore: number
  completedAt: string
  createdAt: string
  updatedAt: string
}

// Design Pattern: Repository Pattern
export abstract class BaseUserRepository {
  abstract saveUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string>
  abstract getUser(userId: string): Promise<User | null>
  abstract getUserByEmail(email: string): Promise<User | null>
  abstract saveAnswers(userId: string, answers: Record<string, boolean>): Promise<void>
  abstract getAnswers(userId: string): Promise<Record<string, boolean> | null>
  abstract getAllUsers(): Promise<Array<{ user: User; answers: ChecklistAnswer | null }>>
  abstract deleteUser(userId: string): Promise<void>
}

// Implementação para Supabase
class SupabaseUserRepository extends BaseUserRepository {
  private supabase = getSupabaseClient()

  async saveUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      // Verificar se usuário já existe
      const { data: existingUser } = await this.supabase.from("users").select("id").eq("email", userData.email).single()

      if (existingUser) {
        // Atualizar usuário existente
        const { data, error } = await this.supabase
          .from("users")
          .update({
            name: userData.name,
            whatsapp: userData.whatsapp,
            location: userData.location,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUser.id)
          .select()
          .single()

        if (error) throw error
        return existingUser.id
      } else {
        // Criar novo usuário
        const { data, error } = await this.supabase.from("users").insert([userData]).select().single()

        if (error) throw error
        return data.id
      }
    } catch (error) {
      console.error("Erro ao salvar usuário no Supabase:", error)
      throw error
    }
  }

  async getUser(userId: string): Promise<User | null> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      const { data, error } = await this.supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") return null
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        location: data.location,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      const { data, error } = await this.supabase.from("users").select("*").eq("email", email).single()

      if (error) {
        if (error.code === "PGRST116") return null
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        location: data.location,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error)
      throw error
    }
  }

  async saveAnswers(userId: string, answers: Record<string, boolean>): Promise<void> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      // Calcular score
      const { checklistData } = await import("../checklist-data")
      const totalScore = this.calculateTotalScore(answers, checklistData)

      // Verificar se já existe resposta
      const { data: existingAnswer } = await this.supabase
        .from("checklist_answers")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (existingAnswer) {
        // Atualizar resposta existente
        const { error } = await this.supabase
          .from("checklist_answers")
          .update({
            answers,
            total_score: totalScore,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAnswer.id)

        if (error) throw error
      } else {
        // Criar nova resposta
        const { error } = await this.supabase.from("checklist_answers").insert([
          {
            user_id: userId,
            answers,
            total_score: totalScore,
          },
        ])

        if (error) throw error
      }
    } catch (error) {
      console.error("Erro ao salvar respostas:", error)
      throw error
    }
  }

  async getAnswers(userId: string): Promise<Record<string, boolean> | null> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      const { data, error } = await this.supabase
        .from("checklist_answers")
        .select("answers")
        .eq("user_id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null
        throw error
      }

      return data.answers
    } catch (error) {
      console.error("Erro ao buscar respostas:", error)
      throw error
    }
  }

  async getAllUsers(): Promise<Array<{ user: User; answers: ChecklistAnswer | null }>> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      const { data, error } = await this.supabase
        .from("users")
        .select(`
          *,
          checklist_answers (*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map((item) => ({
        user: {
          id: item.id,
          name: item.name,
          email: item.email,
          whatsapp: item.whatsapp,
          location: item.location,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
        answers: item.checklist_answers?.[0]
          ? {
              id: item.checklist_answers[0].id,
              userId: item.checklist_answers[0].user_id,
              answers: item.checklist_answers[0].answers,
              totalScore: item.checklist_answers[0].total_score,
              completedAt: item.checklist_answers[0].completed_at,
              createdAt: item.checklist_answers[0].created_at,
              updatedAt: item.checklist_answers[0].updated_at,
            }
          : null,
      }))
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error)
      throw error
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.supabase) throw new Error("Supabase não configurado")

    try {
      const { error } = await this.supabase.from("users").delete().eq("id", userId)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao deletar usuário:", error)
      throw error
    }
  }

  // Helper method
  private calculateTotalScore(answers: Record<string, boolean>, categories: ChecklistCategory[]): number {
    const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)
    if (totalItems === 0) return 0

    const completedItems = Object.values(answers).filter((value) => value === true).length
    return Math.round((completedItems / totalItems) * 100)
  }
}

// Implementação para LocalStorage (fallback)
class LocalStorageUserRepository extends BaseUserRepository {
  async saveUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(`user_data_${userId}`, JSON.stringify(user))
    localStorage.setItem("current_user_id", userId)
    return userId
  }

  async getUser(userId: string): Promise<User | null> {
    const data = localStorage.getItem(`user_data_${userId}`)
    return data ? JSON.parse(data) : null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // Buscar por todos os usuários no localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("user_data_")) {
        const userData = localStorage.getItem(key)
        if (userData) {
          const user: User = JSON.parse(userData)
          if (user.email === email) {
            return user
          }
        }
      }
    }
    return null
  }

  async saveAnswers(userId: string, answers: Record<string, boolean>): Promise<void> {
    localStorage.setItem(`checklist_answers_${userId}`, JSON.stringify(answers))
    localStorage.setItem(`completion_date_${userId}`, new Date().toISOString())
  }

  async getAnswers(userId: string): Promise<Record<string, boolean> | null> {
    const data = localStorage.getItem(`checklist_answers_${userId}`)
    return data ? JSON.parse(data) : null
  }

  async getAllUsers(): Promise<Array<{ user: User; answers: ChecklistAnswer | null }>> {
    const users: Array<{ user: User; answers: ChecklistAnswer | null }> = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("user_data_")) {
        const userId = key.replace("user_data_", "")
        const userData = localStorage.getItem(key)

        if (userData) {
          const user: User = JSON.parse(userData)
          const answersData = localStorage.getItem(`checklist_answers_${userId}`)
          const completionDate = localStorage.getItem(`completion_date_${userId}`)

          let answers: ChecklistAnswer | null = null
          if (answersData) {
            const parsedAnswers = JSON.parse(answersData)
            const { checklistData } = await import("../checklist-data")
            const totalScore = this.calculateTotalScore(parsedAnswers, checklistData)

            answers = {
              id: `answer_${userId}`,
              userId,
              answers: parsedAnswers,
              totalScore,
              completedAt: completionDate || new Date().toISOString(),
              createdAt: completionDate || new Date().toISOString(),
              updatedAt: completionDate || new Date().toISOString(),
            }
          }

          users.push({ user, answers })
        }
      }
    }

    return users.sort((a, b) => {
      const dateA = new Date(a.user.createdAt).getTime()
      const dateB = new Date(b.user.createdAt).getTime()
      return dateB - dateA
    })
  }

  async deleteUser(userId: string): Promise<void> {
    localStorage.removeItem(`user_data_${userId}`)
    localStorage.removeItem(`checklist_answers_${userId}`)
    localStorage.removeItem(`completion_date_${userId}`)
  }

  private calculateTotalScore(answers: Record<string, boolean>, categories: ChecklistCategory[]): number {
    const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)
    if (totalItems === 0) return 0

    const completedItems = Object.values(answers).filter((value) => value === true).length
    return Math.round((completedItems / totalItems) * 100)
  }
}

// Design Pattern: Factory Pattern
export class UserRepositoryFactory {
  static create(): BaseUserRepository {
    if (isSupabaseConfigured()) {
      return new SupabaseUserRepository()
    } else {
      return new LocalStorageUserRepository()
    }
  }
}

// Clean Code: Interface simples para uso externo
export const userRepository = UserRepositoryFactory.create()
