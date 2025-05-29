"use client"

import { useState, useEffect } from "react"
import { checklistData, getMaturityLevel, type MaturityLevel, getImprovementSuggestions } from "@/lib/checklist-data"
import { getUserData, getChecklistAnswers, calculateCategoryScore, calculateTotalScore } from "@/lib/storage"

// Clean Code: Custom hook para separar lógica de estado da apresentação
export interface ResultsData {
  userData: { name: string; email: string; whatsapp: string } | null
  answers: Record<string, boolean>
  totalScore: number
  maturityLevel: MaturityLevel | null
  categoriesScores: { id: string; title: string; score: number }[]
  strengths: { id: string; title: string; score: number }[]
  weaknesses: { id: string; title: string; score: number }[]
  improvements: string[]
  isLoading: boolean
  error: string | null
}

export function useResultsData(): ResultsData {
  const [state, setState] = useState<ResultsData>({
    userData: null,
    answers: {},
    totalScore: 0,
    maturityLevel: null,
    categoriesScores: [],
    strengths: [],
    weaknesses: [],
    improvements: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [user, savedAnswers] = await Promise.all([getUserData(), getChecklistAnswers()])

        if (!savedAnswers) {
          setState((prev) => ({ ...prev, isLoading: false, error: "Nenhuma resposta encontrada" }))
          return
        }

        const score = calculateTotalScore(savedAnswers, checklistData)
        const maturityLevel = getMaturityLevel(score)

        const categoryScores = checklistData.map((category) => ({
          id: category.id,
          title: category.title,
          score: calculateCategoryScore(savedAnswers, category),
        }))

        const sortedByScore = [...categoryScores].sort((a, b) => b.score - a.score)
        const strengths = sortedByScore.slice(0, 3).filter((cat) => cat.score >= 50)
        const weaknesses = sortedByScore
          .slice(-3)
          .reverse()
          .filter((cat) => cat.score < 70)
        const improvements = getImprovementSuggestions(savedAnswers, checklistData)

        setState({
          userData: user,
          answers: savedAnswers,
          totalScore: score,
          maturityLevel,
          categoriesScores: categoryScores,
          strengths,
          weaknesses,
          improvements,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error loading data:", error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Erro ao carregar dados",
        }))
      }
    }

    loadData()
  }, [])

  return state
}
