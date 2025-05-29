"use client"

import { useState, useEffect } from "react"
import { SupabaseUserService } from "@/lib/supabase/user-service"
import { SupabaseChecklistService } from "@/lib/supabase/checklist-service"
import { calculateTotalScore, calculateCategoryScore } from "@/lib/storage"
import { checklistData } from "@/lib/checklist-data"
import type { User } from "@/lib/supabase/client"

interface UserWithAnswers extends User {
  answers: Record<string, boolean> | null
  completedAt: string | null
  totalScore: number
}

export function useSupabaseData() {
  const [users, setUsers] = useState<UserWithAnswers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userService = new SupabaseUserService()
  const checklistService = new SupabaseChecklistService()

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [usersData, answersData] = await Promise.all([userService.getAllUsers(), checklistService.getAllAnswers()])

      // Combine users with their answers
      const usersWithAnswers: UserWithAnswers[] = usersData.map((user) => {
        const userAnswers = answersData.find((a) => a.user_id === user.id)
        const answers = userAnswers?.answers || null
        const totalScore = answers ? calculateTotalScore(answers, checklistData) : 0

        return {
          ...user,
          answers,
          completedAt: userAnswers?.completed_at || null,
          totalScore,
        }
      })

      setUsers(usersWithAnswers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId)
      await loadData() // Reload data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const getStats = () => {
    const totalUsers = users.length
    const completedUsers = users.filter((u) => u.answers !== null)
    const completedDiagnostics = completedUsers.length
    const averageScore =
      completedUsers.length > 0
        ? Math.round(completedUsers.reduce((sum, user) => sum + user.totalScore, 0) / completedUsers.length)
        : 0

    // Calculate category averages
    const categoryScores: Record<string, number[]> = {}

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

  useEffect(() => {
    loadData()
  }, [])

  return {
    users,
    isLoading,
    error,
    stats: getStats(),
    deleteUser,
    reload: loadData,
  }
}
