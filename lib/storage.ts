import type { ChecklistCategory } from "./checklist-data"

// Helper function to get or create a user ID
export const getUserId = async (): Promise<string> => {
  let userId = localStorage.getItem("user_id")

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("user_id", userId)
  }

  return userId
}

// Save user data to local storage
export const saveUserData = async (userData: {
  name: string
  email: string
  whatsapp: string
  location?: {
    latitude: number
    longitude: number
    city?: string
    state?: string
    country?: string
  }
}): Promise<void> => {
  const userId = await getUserId()
  localStorage.setItem(`user_data_${userId}`, JSON.stringify(userData))
}

// Get user data from local storage
export const getUserData = async (): Promise<{
  name: string
  email: string
  whatsapp: string
  location?: {
    latitude: number
    longitude: number
    city?: string
    state?: string
    country?: string
  }
} | null> => {
  const userId = await getUserId()
  const data = localStorage.getItem(`user_data_${userId}`)

  return data ? JSON.parse(data) : null
}

// Save checklist answers to local storage
export const saveChecklistAnswers = async (answers: Record<string, boolean>): Promise<void> => {
  const userId = await getUserId()
  localStorage.setItem(`checklist_answers_${userId}`, JSON.stringify(answers))
}

// Get checklist answers from local storage
export const getChecklistAnswers = async (): Promise<Record<string, boolean> | null> => {
  const userId = await getUserId()
  const data = localStorage.getItem(`checklist_answers_${userId}`)

  return data ? JSON.parse(data) : null
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
    userData: {
      name: string
      email: string
      whatsapp: string
      location?: {
        latitude: number
        longitude: number
        city?: string
        state?: string
        country?: string
      }
    }
    answers: Record<string, boolean> | null
    completedAt: string | null
    totalScore: number
  }>
> => {
  const users: Array<{
    userId: string
    userData: {
      name: string
      email: string
      whatsapp: string
      location?: {
        latitude: number
        longitude: number
        city?: string
        state?: string
        country?: string
      }
    }
    answers: Record<string, boolean> | null
    completedAt: string | null
    totalScore: number
  }> = []

  // Iterar por todas as chaves do localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith("user_data_")) {
      const userId = key.replace("user_data_", "")
      const userDataStr = localStorage.getItem(key)

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)

          // Buscar respostas do checklist para este usuário
          const answersStr = localStorage.getItem(`checklist_answers_${userId}`)
          const answers = answersStr ? JSON.parse(answersStr) : null

          // Calcular score se houver respostas
          let totalScore = 0
          let completedAt = null

          if (answers) {
            // Importar checklistData aqui para calcular o score
            const { checklistData } = await import("./checklist-data")
            totalScore = calculateTotalScore(answers, checklistData)

            // Tentar obter data de conclusão (se existir)
            const completionStr = localStorage.getItem(`completion_date_${userId}`)
            completedAt = completionStr || new Date().toISOString()
          }

          users.push({
            userId,
            userData,
            answers,
            completedAt,
            totalScore,
          })
        } catch (error) {
          console.error(`Error parsing user data for ${userId}:`, error)
        }
      }
    }
  }

  // Ordenar por data de conclusão (mais recentes primeiro)
  return users.sort((a, b) => {
    if (!a.completedAt && !b.completedAt) return 0
    if (!a.completedAt) return 1
    if (!b.completedAt) return -1
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  })
}

// Save completion date when user finishes checklist
export const saveCompletionDate = async (): Promise<void> => {
  const userId = await getUserId()
  localStorage.setItem(`completion_date_${userId}`, new Date().toISOString())
}

// Get user details by ID for admin
export const getUserDetailsById = async (
  userId: string,
): Promise<{
  userData: {
    name: string
    email: string
    whatsapp: string
    location?: {
      latitude: number
      longitude: number
      city?: string
      state?: string
      country?: string
    }
  } | null
  answers: Record<string, boolean> | null
  completedAt: string | null
  totalScore: number
} | null> => {
  try {
    const userDataStr = localStorage.getItem(`user_data_${userId}`)
    const answersStr = localStorage.getItem(`checklist_answers_${userId}`)
    const completionStr = localStorage.getItem(`completion_date_${userId}`)

    if (!userDataStr) return null

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
      completedAt: completionStr,
      totalScore,
    }
  } catch (error) {
    console.error(`Error getting user details for ${userId}:`, error)
    return null
  }
}

// Delete user data (for admin) - FUNÇÃO CORRIGIDA
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    console.log(`Attempting to delete user: ${userId}`)

    // Remover dados do usuário
    const userDataKey = `user_data_${userId}`
    const answersKey = `checklist_answers_${userId}`
    const completionKey = `completion_date_${userId}`

    // Verificar se as chaves existem antes de remover
    const userDataExists = localStorage.getItem(userDataKey) !== null
    const answersExists = localStorage.getItem(answersKey) !== null
    const completionExists = localStorage.getItem(completionKey) !== null

    console.log(`User data exists: ${userDataExists}`)
    console.log(`Answers exist: ${answersExists}`)
    console.log(`Completion exists: ${completionExists}`)

    // Remover todas as chaves relacionadas ao usuário
    if (userDataExists) {
      localStorage.removeItem(userDataKey)
      console.log(`Removed: ${userDataKey}`)
    }

    if (answersExists) {
      localStorage.removeItem(answersKey)
      console.log(`Removed: ${answersKey}`)
    }

    if (completionExists) {
      localStorage.removeItem(completionKey)
      console.log(`Removed: ${completionKey}`)
    }

    console.log(`Successfully deleted user: ${userId}`)
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error)
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
  const users = await getAllUsersData()
  const completedUsers = users.filter((user) => user.answers !== null)

  const totalUsers = users.length
  const completedDiagnostics = completedUsers.length
  const averageScore =
    completedUsers.length > 0
      ? Math.round(completedUsers.reduce((sum, user) => sum + user.totalScore, 0) / completedUsers.length)
      : 0

  // Calcular médias por categoria
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
