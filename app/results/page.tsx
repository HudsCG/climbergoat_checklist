"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ResultsDashboard } from "@/components/results-dashboard"
import { getUserData, getChecklistAnswers } from "@/lib/storage"

export default function ResultsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkData = async () => {
      try {
        const [userData, answers] = await Promise.all([getUserData(), getChecklistAnswers()])

        if (!userData || !userData.name || !answers) {
          // Redirect to home page if data is missing
          router.push("/")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error checking data:", error)
        router.push("/")
      }
    }

    checkData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <ResultsDashboard />
}
