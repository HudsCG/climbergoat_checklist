"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChecklistComponent } from "@/components/checklist"
import { getUserData } from "@/lib/storage"

export default function ChecklistPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Scroll para o topo quando a página carregar
    window.scrollTo(0, 0)

    const checkUserData = async () => {
      try {
        const userData = await getUserData()
        if (!userData || !userData.name) {
          // Redirect to home page if no user data
          router.push("/")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error checking user data:", error)
        router.push("/")
      }
    }

    checkUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <ChecklistComponent />
}
