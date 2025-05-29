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

// Salvar dados do usuário
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

      logger.info("User data updated", { userId: existingUser.id })
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

      logger.info("New user created", { userId: data.id })
      return data.id
    }
  } catch (error) {
    logger.error("Error saving user data", { error: error.message })
    throw error
  }
}

// Buscar dados do usuário
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

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
    logger.error("Error getting user data", { error: error.message, userId })
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

      logger.info("Checklist answers updated", { userId, answerId: data.id })
      return {
        id: data.id,
        userId: data.user_id,
        answers: data.answers,
        totalScore: data.total_score,
        completedAt: data.completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
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

      logger.info("New checklist answers created", { userId, answerId: data.id })
      return {
        id: data.id,
        userId: data.user_id,
        answers: data.answers,
        totalScore: data.total_score,
        completedAt: data.completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    }
  } catch (error) {
    logger.error("Error saving checklist answers", { error: error.message, userId })
    throw error
  }
}

// Buscar respostas do checklist
export const getChecklistAnswers = async (userId: string): Promise<Record<string, boolean> | null> => {
  try {
    const { data, error } = await supabase.from("checklist_answers").select("answers").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    return data.answers
  } catch (error) {
    logger.error("Error getting checklist answers", { error: error.message, userId })
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
  } catch (error) {
    logger.error("Error getting all users data", { error: error.message })
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
  } catch (error) {
    logger.error("Error getting user details", { error: error.message, userId })
    return null
  }
}

// Delete user data
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    // Deletar do Supabase (cascade vai deletar as respostas automaticamente)
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) throw error

    logger.info("User data deleted", { userId })
  } catch (error) {
    logger.error("Error deleting user data", { error: error.message, userId })
    throw error
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
  } catch (error) {
    logger.error("Error getting admin stats", { error: error.message })
    return {
      totalUsers: 0,
      completedDiagnostics: 0,
      averageScore: 0,
      topCategories: [],
    }
  }
}
