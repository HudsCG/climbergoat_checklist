import { supabase, type UserData, type ChecklistAnswers } from "./supabase"
import { ErrorHandler } from "./error-handler"

// Detectar se estamos em ambiente de preview
const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("v0.dev") || window.location.hostname.includes("vusercontent.net")
}

export interface StorageRepository {
  saveUserData(userData: UserData): Promise<string>
  getUserData(userId?: string): Promise<UserData | null>
  saveChecklistAnswers(userId: string, answers: Record<string, boolean>, totalScore: number): Promise<void>
  getChecklistAnswers(userId?: string): Promise<ChecklistAnswers | null>
  getAllUsers(): Promise<
    Array<{
      userId: string
      userData: UserData
      answers: ChecklistAnswers | null
      completedAt: string | null
      totalScore: number
    }>
  >
  deleteUser(userId: string): Promise<void>
}

// Implementação para ambiente de preview usando localStorage
export class LocalStorageRepository implements StorageRepository {
  private currentUserId: string | null = null

  private async getCurrentUserId(): Promise<string> {
    if (this.currentUserId) return this.currentUserId

    // Try to get from localStorage first
    let userId = localStorage.getItem("anonymous_user_id")

    if (!userId) {
      // Generate new anonymous user ID
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem("anonymous_user_id", userId)
    }

    this.currentUserId = userId
    return userId
  }

  async saveUserData(userData: UserData): Promise<string> {
    try {
      const userId = await this.getCurrentUserId()

      // Salvar no localStorage
      localStorage.setItem(
        `user_data_${userId}`,
        JSON.stringify({
          id: userId,
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      )

      return userId
    } catch (error) {
      ErrorHandler.logError(error, "saveUserData")
      throw new Error("Falha ao salvar dados do usuário")
    }
  }

  async getUserData(userId?: string): Promise<UserData | null> {
    try {
      const id = userId || (await this.getCurrentUserId())
      const userData = localStorage.getItem(`user_data_${id}`)

      return userData ? JSON.parse(userData) : null
    } catch (error) {
      ErrorHandler.logError(error, "getUserData")
      return null
    }
  }

  async saveChecklistAnswers(userId: string, answers: Record<string, boolean>, totalScore: number): Promise<void> {
    try {
      const checklistData = {
        user_id: userId,
        answers,
        total_score: totalScore,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem(`checklist_answers_${userId}`, JSON.stringify(checklistData))
    } catch (error) {
      ErrorHandler.logError(error, "saveChecklistAnswers")
      throw new Error("Falha ao salvar respostas")
    }
  }

  async getChecklistAnswers(userId?: string): Promise<ChecklistAnswers | null> {
    try {
      const id = userId || (await this.getCurrentUserId())
      const answers = localStorage.getItem(`checklist_answers_${id}`)

      return answers ? JSON.parse(answers) : null
    } catch (error) {
      ErrorHandler.logError(error, "getChecklistAnswers")
      return null
    }
  }

  async getAllUsers(): Promise<
    Array<{
      userId: string
      userData: UserData
      answers: ChecklistAnswers | null
      completedAt: string | null
      totalScore: number
    }>
  > {
    try {
      // No ambiente de preview, vamos simular alguns usuários
      return [
        {
          userId: "preview_user_1",
          userData: {
            id: "preview_user_1",
            name: "João Silva (Preview)",
            email: "joao@exemplo.com",
            whatsapp: "(73) 99999-9999",
          },
          answers: {
            id: "1",
            user_id: "preview_user_1",
            answers: { "nome-empresa": true, "categoria-principal": true },
            total_score: 75,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          completedAt: new Date().toISOString(),
          totalScore: 75,
        },
        {
          userId: "preview_user_2",
          userData: {
            id: "preview_user_2",
            name: "Maria Santos (Preview)",
            email: "maria@exemplo.com",
            whatsapp: "(73) 88888-8888",
          },
          answers: null,
          completedAt: null,
          totalScore: 0,
        },
      ]
    } catch (error) {
      ErrorHandler.logError(error, "getAllUsers")
      return []
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`user_data_${userId}`)
      localStorage.removeItem(`checklist_answers_${userId}`)
    } catch (error) {
      ErrorHandler.logError(error, "deleteUser")
      throw new Error("Falha ao excluir usuário")
    }
  }
}

// Implementação original do Supabase
export class SupabaseStorageRepository implements StorageRepository {
  private currentUserId: string | null = null

  private async getCurrentUserId(): Promise<string> {
    if (this.currentUserId) return this.currentUserId

    // Try to get from localStorage first (for anonymous users)
    let userId = localStorage.getItem("anonymous_user_id")

    if (!userId) {
      // Generate new anonymous user ID
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem("anonymous_user_id", userId)
    }

    this.currentUserId = userId
    return userId
  }

  async saveUserData(userData: UserData): Promise<string> {
    try {
      const userId = await this.getCurrentUserId()

      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: userId,
          name: userData.name,
          email: userData.email,
          whatsapp: userData.whatsapp,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase saveUserData error:", error)
        throw error
      }

      console.log("User data saved successfully:", data)
      return userId
    } catch (error) {
      ErrorHandler.logError(error, "saveUserData")
      throw new Error("Falha ao salvar dados do usuário")
    }
  }

  async getUserData(userId?: string): Promise<UserData | null> {
    try {
      const id = userId || (await this.getCurrentUserId())

      const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase getUserData error:", error)
        throw error
      }

      console.log("User data retrieved:", data)
      return data || null
    } catch (error) {
      ErrorHandler.logError(error, "getUserData")
      return null
    }
  }

  async saveChecklistAnswers(userId: string, answers: Record<string, boolean>, totalScore: number): Promise<void> {
    try {
      console.log("Saving checklist answers:", { userId, answers, totalScore })

      // Primeiro, verificar se já existe um registro
      const { data: existingData, error: selectError } = await supabase
        .from("checklist_answers")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking existing data:", selectError)
        throw selectError
      }

      let result
      if (existingData) {
        // UPDATE - registro já existe
        console.log("Updating existing record for user:", userId)
        result = await supabase
          .from("checklist_answers")
          .update({
            answers: answers,
            total_score: totalScore,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
      } else {
        // INSERT - novo registro
        console.log("Creating new record for user:", userId)
        result = await supabase
          .from("checklist_answers")
          .insert({
            user_id: userId,
            answers: answers,
            total_score: totalScore,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
      }

      if (result.error) {
        console.error("Supabase saveChecklistAnswers error:", result.error)
        throw result.error
      }

      console.log("Checklist answers saved successfully:", result.data)
    } catch (error) {
      ErrorHandler.logError(error, "saveChecklistAnswers")
      throw new Error("Falha ao salvar respostas")
    }
  }

  async getChecklistAnswers(userId?: string): Promise<ChecklistAnswers | null> {
    try {
      const id = userId || (await this.getCurrentUserId())

      console.log("Getting checklist answers for user:", id)

      const { data, error } = await supabase.from("checklist_answers").select("*").eq("user_id", id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase getChecklistAnswers error:", error)
        throw error
      }

      console.log("Checklist answers retrieved:", data)
      return data || null
    } catch (error) {
      ErrorHandler.logError(error, "getChecklistAnswers")
      return null
    }
  }

  async getAllUsers(): Promise<
    Array<{
      userId: string
      userData: UserData
      answers: ChecklistAnswers | null
      completedAt: string | null
      totalScore: number
    }>
  > {
    try {
      console.log("Getting all users...")

      // Buscar todos os usuários
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) {
        console.error("Error fetching users:", usersError)
        throw usersError
      }

      console.log("Users fetched:", users)

      // Buscar todas as respostas
      const { data: answers, error: answersError } = await supabase.from("checklist_answers").select("*")

      if (answersError) {
        console.error("Error fetching answers:", answersError)
        throw answersError
      }

      console.log("Answers fetched:", answers)

      // Combinar dados
      const result = users.map((user) => {
        const userAnswers = answers.find((a) => a.user_id === user.id)

        console.log(`Processing user ${user.id}:`, {
          user,
          userAnswers,
          hasAnswers: !!userAnswers,
        })

        return {
          userId: user.id,
          userData: {
            id: user.id,
            name: user.name,
            email: user.email,
            whatsapp: user.whatsapp,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          answers: userAnswers || null,
          completedAt: userAnswers?.completed_at || null,
          totalScore: userAnswers?.total_score || 0,
        }
      })

      console.log("Final result:", result)
      return result
    } catch (error) {
      console.error("Error in getAllUsers:", error)
      ErrorHandler.logError(error, "getAllUsers")
      throw new Error("Falha ao carregar usuários")
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      console.log("Deleting user:", userId)

      // Delete checklist answers first (foreign key constraint)
      const { error: answersError } = await supabase.from("checklist_answers").delete().eq("user_id", userId)

      if (answersError) {
        console.error("Error deleting answers:", answersError)
        throw answersError
      }

      // Delete user
      const { error: userError } = await supabase.from("users").delete().eq("id", userId)

      if (userError) {
        console.error("Error deleting user:", userError)
        throw userError
      }

      console.log("User deleted successfully")
    } catch (error) {
      ErrorHandler.logError(error, "deleteUser")
      throw new Error("Falha ao excluir usuário")
    }
  }
}

// Factory que escolhe a implementação correta baseada no ambiente
export class StorageService {
  private static instance: StorageRepository

  static getInstance(): StorageRepository {
    if (!this.instance) {
      // Escolher implementação baseada no ambiente
      if (isPreviewEnvironment()) {
        console.log("Usando LocalStorageRepository para ambiente de preview")
        this.instance = new LocalStorageRepository()
      } else {
        console.log("Usando SupabaseStorageRepository para ambiente de produção")
        this.instance = new SupabaseStorageRepository()
      }
    }
    return this.instance
  }
}
