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

      // Verificar se o Supabase está configurado
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Supabase não configurado. Verifique as variáveis de ambiente.")
      }

      // Buscar dados com tratamento de erro
      let usersData: User[] = []
      let answersData: any[] = []

      try {
        usersData = await userService.getAllUsers()
      } catch (err) {
        console.error("Erro ao buscar usuários:", err)
        usersData = []
      }

      try {
        answersData = await checklistService.getAllAnswers()
      } catch (err) {
        console.error("Erro ao buscar respostas:", err)
        answersData = []
      }

      // Combinar usuários com suas respostas com verificações de segurança
      const usersWithAnswers: UserWithAnswers[] = usersData.map((user) => {
        // Verificar se o usuário é válido
        if (!user || !user.id) {
          console.warn("Usuário inválido encontrado:", user)
          return {
            id: "invalid-id",
            name: "Usuário Inválido",
            email: "",
            whatsapp: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            answers: null,
            completedAt: null,
            totalScore: 0,
          }
        }

        const userAnswers = answersData.find((a) => a && a.user_id === user.id)
        const answers = userAnswers?.answers || null

        // Calcular score com verificação de segurança
        let totalScore = 0
        if (answers && typeof answers === "object") {
          try {
            totalScore = calculateTotalScore(answers, checklistData)
          } catch (err) {
            console.error(`Erro ao calcular score para usuário ${user.id}:`, err)
          }
        }

        return {
          ...user,
          answers,
          completedAt: userAnswers?.completed_at || null,
          totalScore,
        }
      })

      setUsers(usersWithAnswers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao carregar dados"
      console.error("Erro em loadData:", errorMessage)
      setError(errorMessage)
      setUsers([]) // Garantir que users seja um array vazio em caso de erro
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId)
      await loadData() // Recarregar dados
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Falha ao excluir usuário")
    }
  }

  const getStats = () => {
    // Verificações de segurança para evitar erros
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        completedDiagnostics: 0,
        averageScore: 0,
        topCategories: [],
      }
    }

    try {
      const totalUsers = users.length
      const completedUsers = users.filter((u) => u && u.answers !== null)
      const completedDiagnostics = completedUsers.length
      const averageScore =
        completedUsers.length > 0
          ? Math.round(completedUsers.reduce((sum, user) => sum + (user.totalScore || 0), 0) / completedUsers.length)
          : 0

      // Calcular médias por categoria com verificações de segurança
      const categoryScores: Record<string, number[]> = {}

      if (completedUsers.length > 0 && Array.isArray(checklistData)) {
        completedUsers.forEach((user) => {
          if (user && user.answers) {
            checklistData.forEach((category) => {
              if (category && category.title) {
                try {
                  const score = calculateCategoryScore(user.answers, category)
                  if (!categoryScores[category.title]) {
                    categoryScores[category.title] = []
                  }
                  categoryScores[category.title].push(score)
                } catch (err) {
                  console.error(`Erro ao calcular score da categoria ${category.title}:`, err)
                }
              }
            })
          }
        })
      }

      const topCategories = Object.entries(categoryScores)
        .map(([category, scores]) => ({
          category,
          averageScore:
            scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5)

      return {
        totalUsers,
        completedDiagnostics,
        averageScore,
        topCategories,
      }
    } catch (err) {
      console.error("Erro ao calcular estatísticas:", err)
      return {
        totalUsers: users.length,
        completedDiagnostics: 0,
        averageScore: 0,
        topCategories: [],
      }
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
