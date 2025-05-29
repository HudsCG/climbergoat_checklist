import { supabase } from "./supabase"
import { logger } from "./logger"
import type { ChecklistCategory } from "./checklist-data"

export interface UserData {
  id: string
  name: string
  email: string
  whatsapp: string
  location?: {
    city?: string
    state?: string
    country?: string
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

// Helper function to get or create a user ID for localStorage fallback
const getUserId = (): string => {
  if (typeof window === "undefined") return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  let userId = localStorage.getItem("user_id")
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("user_id", userId)
  }
  return userId
}

// Salvar dados do usuário com fallback para localStorage
export const saveUserData = async (userData: {
  name: string
  email: string
  whatsapp: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
}): Promise<string> => {
  try {
    // Tentar salvar no Supabase primeiro
    if (supabase) {
      // Verificar se usuário já existe pelo email
      const { data: existingUser, error: searchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userData.email)
        .single()

      if (searchError && searchError.code !== "PGRST116") {
        throw searchError
      }

      if (existingUser) {
        // Atualizar usuário existente
        const { data, error } = await supabase
          .from("users")
          .update({
            name: userData.name,
            whatsapp: userData.whatsapp,
            location: userData.location || null,
          })
          .eq("id", existingUser.id)
          .select()
          .single()

        if (error) throw error

        logger.info("User data updated in Supabase", { userId: existingUser.id })

        // Salvar também no localStorage como backup
        if (typeof window !== "undefined") {
          localStorage.setItem("user_id", existingUser.id)
          localStorage.setItem(
            `user_data_${existingUser.id}`,
            JSON.stringify({
              ...userData,
              id: existingUser.id,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }),
          )
        }

        return existingUser.id
      } else {
        // Criar novo usuário
        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              name: userData.name,
              email: userData.email,
              whatsapp: userData.whatsapp,
              location: userData.location || null,
            },
          ])
          .select()
          .single()

        if (error) throw error

        logger.info("New user created in Supabase", { userId: data.id })

        // Salvar também no localStorage como backup
        if (typeof window !== "undefined") {
          localStorage.setItem("user_id", data.id)
          localStorage.setItem(
            `user_data_${data.id}`,
            JSON.stringify({
              ...userData,
              id: data.id,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }),
          )
        }

        return data.id
      }
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error saving user data to Supabase, using localStorage fallback", {
      error: error.message,
      userData: { email: userData.email, name: userData.name },
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const userId = getUserId()
      const userDataWithId = {
        ...userData,
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(`user_data_${userId}`, JSON.stringify(userDataWithId))
      logger.info("User data saved to localStorage as fallback", { userId })
      return userId
    } else {
      // Se não há window (SSR), gerar ID temporário
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      logger.info("Generated temporary user ID for SSR", { userId })
      return userId
    }
  }
}

// Buscar dados do usuário
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Tentar buscar no localStorage
          if (typeof window !== "undefined") {
            const localData = localStorage.getItem(`user_data_${userId}`)
            return localData ? JSON.parse(localData) : null
          }
          return null
        }
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
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error getting user data from Supabase, trying localStorage", {
      error: error.message,
      userId,
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(`user_data_${userId}`)
      return localData ? JSON.parse(localData) : null
    }

    return null
  }
}

// Salvar respostas do checklist
export const saveChecklistAnswers = async (
  userId: string,
  answers: Record<string, boolean>,
): Promise<ChecklistAnswer> => {
  try {
    // Calcular score total
    const { checklistData } = await import("./checklist-data")
    const totalScore = calculateTotalScore(answers, checklistData)

    if (supabase) {
      // Verificar se já existe resposta para este usuário
      const { data: existingAnswer, error: searchError } = await supabase
        .from("checklist_answers")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (searchError && searchError.code !== "PGRST116") {
        throw searchError
      }

      if (existingAnswer) {
        // Atualizar resposta existente
        const { data, error } = await supabase
          .from("checklist_answers")
          .update({
            answers,
            total_score: totalScore,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existingAnswer.id)
          .select()
          .single()

        if (error) throw error

        logger.info("Checklist answers updated in Supabase", { userId, answerId: data.id })

        const result = {
          id: data.id,
          userId: data.user_id,
          answers: data.answers,
          totalScore: data.total_score,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

        // Backup no localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(`checklist_answers_${userId}`, JSON.stringify(answers))
        }

        return result
      } else {
        // Criar nova resposta
        const { data, error } = await supabase
          .from("checklist_answers")
          .insert([
            {
              user_id: userId,
              answers,
              total_score: totalScore,
            },
          ])
          .select()
          .single()

        if (error) throw error

        logger.info("New checklist answers created in Supabase", { userId, answerId: data.id })

        const result = {
          id: data.id,
          userId: data.user_id,
          answers: data.answers,
          totalScore: data.total_score,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

        // Backup no localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(`checklist_answers_${userId}`, JSON.stringify(answers))
        }

        return result
      }
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error saving checklist answers to Supabase, using localStorage fallback", {
      error: error.message,
      userId,
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const answerId = `answer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const answerData: ChecklistAnswer = {
        id: answerId,
        userId,
        answers,
        totalScore: calculateTotalScore(answers, await import("./checklist-data").then((m) => m.checklistData)),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(`checklist_answers_${userId}`, JSON.stringify(answers))
      localStorage.setItem(`checklist_answer_data_${answerId}`, JSON.stringify(answerData))
      logger.info("Checklist answers saved to localStorage as fallback", { userId, answerId })
      return answerData
    } else {
      // Retornar dados mínimos se não há localStorage
      return {
        id: `temp_${Date.now()}`,
        userId,
        answers,
        totalScore: calculateTotalScore(answers, await import("./checklist-data").then((m) => m.checklistData)),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }
}

// Buscar respostas do checklist
export const getChecklistAnswers = async (userId: string): Promise<Record<string, boolean> | null> => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("checklist_answers").select("answers").eq("user_id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Tentar buscar no localStorage
          if (typeof window !== "undefined") {
            const localData = localStorage.getItem(`checklist_answers_${userId}`)
            return localData ? JSON.parse(localData) : null
          }
          return null
        }
        throw error
      }

      return data.answers
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error getting checklist answers from Supabase, trying localStorage", {
      error: error.message,
      userId,
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(`checklist_answers_${userId}`)
      return localData ? JSON.parse(localData) : null
    }

    return null
  }
}

// Calculate the score for a specific category
export const calculateCategoryScore = (answers: Record<string, boolean>, category: ChecklistCategory): number => {
  const totalItems = category.items.length

  if (totalItems === 0) return 0

  const completedItems = category.items.filter((item) => answers[item.id] === true).length
  return Math.round((completedItems / totalItems) * 100)
}

// Calculate the total score across all categories
export const calculateTotalScore = (answers: Record<string, boolean>, categories: ChecklistCategory[]): number => {
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)

  if (totalItems === 0) return 0

  const completedItems = Object.values(answers).filter((value) => value === true).length
  return Math.round((completedItems / totalItems) * 100)
}

// Get all users data for admin dashboard
export const getAllUsersData = async (): Promise<
  Array<{
    userId: string
    userData: UserData
    answers: Record<string, boolean> | null
    completedAt: string | null
    totalScore: number
  }>
> => {
  try {
    if (supabase) {
      const { data: users, error } = await supabase
        .from("users")
        .select(`
          *,
          checklist_answers (
            answers,
            total_score,
            completed_at
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      return users.map((user) => ({
        userId: user.id,
        userData: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          location: user.location,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        answers: user.checklist_answers?.[0]?.answers || null,
        completedAt: user.checklist_answers?.[0]?.completed_at || null,
        totalScore: user.checklist_answers?.[0]?.total_score || 0,
      }))
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error getting all users data from Supabase, trying localStorage", {
      error: error.message,
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const users: Array<{
        userId: string
        userData: UserData
        answers: Record<string, boolean> | null
        completedAt: string | null
        totalScore: number
      }> = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("user_data_")) {
          const userId = key.replace("user_data_", "")
          const userDataStr = localStorage.getItem(key)

          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr)
              const answersStr = localStorage.getItem(`checklist_answers_${userId}`)
              const answers = answersStr ? JSON.parse(answersStr) : null

              let totalScore = 0
              let completedAt = null

              if (answers) {
                const { checklistData } = await import("./checklist-data")
                totalScore = calculateTotalScore(answers, checklistData)
                completedAt = new Date().toISOString()
              }

              users.push({
                userId,
                userData,
                answers,
                completedAt,
                totalScore,
              })
            } catch (parseError) {
              logger.error("Error parsing localStorage user data", { userId, error: parseError.message })
            }
          }
        }
      }

      return users.sort((a, b) => new Date(b.userData.createdAt).getTime() - new Date(a.userData.createdAt).getTime())
    }

    return []
  }
}

// Save completion date when user finishes checklist
export const saveCompletionDate = async (): Promise<void> => {
  // Esta função agora é automática no Supabase via completed_at
  // Mantida para compatibilidade
}

// Get user details by ID for admin
export const getUserDetailsById = async (
  userId: string,
): Promise<{
  userData: UserData | null
  answers: Record<string, boolean> | null
  completedAt: string | null
  totalScore: number
} | null> => {
  try {
    if (supabase) {
      const { data: user, error } = await supabase
        .from("users")
        .select(`
          *,
          checklist_answers (
            answers,
            total_score,
            completed_at
          )
        `)
        .eq("id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null
        throw error
      }

      return {
        userData: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          location: user.location,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        answers: user.checklist_answers?.[0]?.answers || null,
        completedAt: user.checklist_answers?.[0]?.completed_at || null,
        totalScore: user.checklist_answers?.[0]?.total_score || 0,
      }
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error getting user details from Supabase, trying localStorage", {
      error: error.message,
      userId,
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const userDataStr = localStorage.getItem(`user_data_${userId}`)
      const answersStr = localStorage.getItem(`checklist_answers_${userId}`)

      if (!userDataStr) return null

      try {
        const userData = JSON.parse(userDataStr)
        const answers = answersStr ? JSON.parse(answersStr) : null

        let totalScore = 0
        if (answers) {
          const { checklistData } = await import("./checklist-data")
          totalScore = calculateTotalScore(answers, checklistData)
        }

        return {
          userData,
          answers,
          completedAt: answers ? new Date().toISOString() : null,
          totalScore,
        }
      } catch (parseError) {
        logger.error("Error parsing localStorage user details", { userId, error: parseError.message })
        return null
      }
    }

    return null
  }
}

// Delete user data
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    if (supabase) {
      // Deletar do Supabase (cascade vai deletar as respostas automaticamente)
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error

      logger.info("User data deleted from Supabase", { userId })
    }
  } catch (error) {
    logger.error("Error deleting user data from Supabase", { error: error.message, userId })
  }

  // Deletar do localStorage também (sempre tentar)
  if (typeof window !== "undefined") {
    localStorage.removeItem(`user_data_${userId}`)
    localStorage.removeItem(`checklist_answers_${userId}`)
    logger.info("User data deleted from localStorage", { userId })
  }
}

// Get admin statistics
export const getAdminStats = async (): Promise<{
  totalUsers: number
  completedDiagnostics: number
  averageScore: number
  topCategories: Array<{ category: string; averageScore: number }>
}> => {
  try {
    if (supabase) {
      // Buscar estatísticas do Supabase
      const { data: users, error: usersError } = await supabase.from("users").select("id")

      const { data: completedAnswers, error: answersError } = await supabase
        .from("checklist_answers")
        .select("total_score, answers")

      if (usersError) throw usersError
      if (answersError) throw answersError

      const totalUsers = users?.length || 0
      const completedDiagnostics = completedAnswers?.length || 0
      const averageScore =
        completedAnswers?.length > 0
          ? Math.round(completedAnswers.reduce((sum, answer) => sum + answer.total_score, 0) / completedAnswers.length)
          : 0

      // Calcular médias por categoria
      const categoryScores: Record<string, number[]> = {}

      if (completedAnswers?.length > 0) {
        const { checklistData } = await import("./checklist-data")

        completedAnswers.forEach((answer) => {
          if (answer.answers) {
            checklistData.forEach((category) => {
              const score = calculateCategoryScore(answer.answers, category)
              if (!categoryScores[category.title]) {
                categoryScores[category.title] = []
              }
              categoryScores[category.title].push(score)
            })
          }
        })
      }

      const topCategories = Object.entries(categoryScores)
        .map(([category, scores]) => ({
          category,
          averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5)

      return {
        totalUsers,
        completedDiagnostics,
        averageScore,
        topCategories,
      }
    } else {
      throw new Error("Supabase client not available")
    }
  } catch (error) {
    logger.error("Error getting admin stats from Supabase, using localStorage fallback", {
      error: error.message,
    })

    // Fallback para localStorage
    if (typeof window !== "undefined") {
      const users = await getAllUsersData()
      const completedUsers = users.filter((user) => user.answers !== null)

      const totalUsers = users.length
      const completedDiagnostics = completedUsers.length
      const averageScore =
        completedUsers.length > 0
          ? Math.round(completedUsers.reduce((sum, user) => sum + user.totalScore, 0) / completedUsers.length)
          : 0

      const categoryScores: Record<string, number[]> = {}

      if (completedUsers.length > 0) {
        const { checklistData } = await import("./checklist-data")

        completedUsers.forEach((user) => {
          if (user.answers) {
            checklistData.forEach((category) => {
              const score = calculateCategoryScore(user.answers!, category)
              if (!categoryScores[category.title]) {
                categoryScores[category.title] = []
              }
              categoryScores[category.title].push(score)
            })
          }
        })
      }

      const topCategories = Object.entries(categoryScores)
        .map(([category, scores]) => ({
          category,
          averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5)

      return {
        totalUsers,
        completedDiagnostics,
        averageScore,
        topCategories,
      }
    }

    return {
      totalUsers: 0,
      completedDiagnostics: 0,
      averageScore: 0,
      topCategories: [],
    }
  }
}
