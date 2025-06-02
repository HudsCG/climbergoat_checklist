import { StorageService } from "./storage-service"
import type { ChecklistCategory } from "./checklist-data"

// Re-export for backward compatibility
export const getUserId = async (): Promise<string> => {
  // This is now handled internally by the storage service
  return "handled_by_service"
}

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
  const storageService = StorageService.getInstance()
  await storageService.saveUserData(userData)
}

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
  const storageService = StorageService.getInstance()
  return await storageService.getUserData()
}

export const saveChecklistAnswers = async (answers: Record<string, boolean>): Promise<void> => {
  const storageService = StorageService.getInstance()

  // Calculate total score
  const { checklistData } = await import("./checklist-data")
  const totalScore = calculateTotalScore(answers, checklistData)

  // Get current user ID (this will be handled by the service)
  const userData = await getUserData()
  if (!userData) throw new Error("User data not found")

  // For now, we'll use a temporary approach to get user ID
  let userId = localStorage.getItem("anonymous_user_id")
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("anonymous_user_id", userId)
  }

  await storageService.saveChecklistAnswers(userId, answers, totalScore)
}

export const getChecklistAnswers = async (): Promise<Record<string, boolean> | null> => {
  const storageService = StorageService.getInstance()
  const result = await storageService.getChecklistAnswers()
  return result?.answers || null
}

export const calculateCategoryScore = (answers: Record<string, boolean>, category: ChecklistCategory): number => {
  const totalItems = category.items.length
  if (totalItems === 0) return 0

  const completedItems = category.items.filter((item) => answers[item.id] === true).length
  return Math.round((completedItems / totalItems) * 100)
}

export const calculateTotalScore = (answers: Record<string, boolean>, categories: ChecklistCategory[]): number => {
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)
  if (totalItems === 0) return 0

  const completedItems = Object.values(answers).filter((value) => value === true).length
  return Math.round((completedItems / totalItems) * 100)
}

// Admin functions
export const getAllUsersData = async () => {
  const storageService = StorageService.getInstance()
  return await storageService.getAllUsers()
}

export const deleteUserData = async (userId: string): Promise<void> => {
  const storageService = StorageService.getInstance()
  await storageService.deleteUser(userId)
}

export const saveCompletionDate = async (): Promise<void> => {
  // This is now handled automatically when saving checklist answers
  return Promise.resolve()
}

export const getUserDetailsById = async (userId: string) => {
  const storageService = StorageService.getInstance()
  const userData = await storageService.getUserData(userId)
  const answers = await storageService.getChecklistAnswers(userId)

  if (!userData) return null

  return {
    userData,
    answers: answers?.answers || null,
    completedAt: answers?.completed_at || null,
    totalScore: answers?.total_score || 0,
  }
}

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

  // Calculate category averages
  const categoryScores: Record<string, number[]> = {}

  if (completedUsers.length > 0) {
    const { checklistData } = await import("./checklist-data")

    completedUsers.forEach((user) => {
      if (user.answers?.answers) {
        checklistData.forEach((category) => {
          const score = calculateCategoryScore(user.answers!.answers, category)
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
