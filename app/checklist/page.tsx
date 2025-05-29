"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChecklistComponent } from "@/components/checklist"
import { getUserData } from "@/lib/storage"

export default function ChecklistPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Scroll para o topo quando a página carregar
    window.scrollTo(0, 0)

    const checkUserData = async () => {
      try {
        // Verificar se temos um userId no localStorage
        const userId = localStorage.getItem("user_id")
        console.log("ChecklistPage - userId do localStorage:", userId)

        if (!userId) {
          console.error("Nenhum userId encontrado no localStorage")
          setError("Nenhum usuário encontrado. Redirecionando para a página inicial...")
          setTimeout(() => router.push("/"), 2000)
          return
        }

        // Buscar dados do usuário com o ID
        const userData = await getUserData(userId)
        console.log("ChecklistPage - userData:", userData)

        if (!userData || !userData.name) {
          console.error("Dados do usuário não encontrados ou incompletos")
          setError("Dados do usuário não encontrados. Redirecionando para a página inicial...")
          setTimeout(() => router.push("/"), 2000)
          return
        }

        // Tudo OK, mostrar o checklist
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking user data:", error)
        setError("Erro ao carregar dados. Redirecionando para a página inicial...")
        setTimeout(() => router.push("/"), 2000)
      }
    }

    checkUserData()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <ChecklistComponent />
}
