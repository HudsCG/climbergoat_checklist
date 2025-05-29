import jsPDF from "jspdf"
import type { MaturityLevel } from "./checklist-data"

interface PDFData {
  userData: { name: string; email: string; whatsapp: string }
  totalScore: number
  maturityLevel: MaturityLevel | null
  categoriesScores: { id: string; title: string; score: number }[]
  improvements: string[]
  strengths: { id: string; title: string; score: number }[]
  weaknesses: { id: string; title: string; score: number }[]
}

export const generateProfessionalPDF = async (data: PDFData) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4")

    // Cores baseadas no nível
    const getColor = (level: string) => {
      switch (level) {
        case "gold":
          return [245, 158, 11]
        case "good":
          return [16, 185, 129]
        case "regular":
          return [249, 115, 22]
        case "beginner":
          return [239, 68, 68]
        default:
          return [107, 114, 128]
      }
    }

    const primaryColor = getColor(data.maturityLevel?.id || "beginner")

    // Header com gradiente simulado
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.rect(0, 0, 210, 40, "F")

    // Logo/Título
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text("DIAGNÓSTICO GOOGLE MEU NEGÓCIO", 105, 20, { align: "center" })

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Relatório Completo - ${data.userData.name}`, 105, 30, { align: "center" })

    // Data
    pdf.setFontSize(10)
    pdf.text(new Date().toLocaleDateString("pt-BR"), 180, 35)

    // Reset cor do texto
    pdf.setTextColor(0, 0, 0)

    let yPos = 60

    // Score Principal
    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.text("PONTUAÇÃO GERAL", 20, yPos)

    // Círculo do score (simulado com texto)
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.circle(50, yPos + 20, 15, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text(`${data.totalScore}%`, 50, yPos + 25, { align: "center" })

    // Nível
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.text(`Nível: ${data.maturityLevel?.name || "N/A"}`, 80, yPos + 15)

    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    const description = data.maturityLevel?.description || ""
    const wrappedDesc = pdf.splitTextToSize(description, 110)
    pdf.text(wrappedDesc, 80, yPos + 25)

    yPos += 60

    // Categorias
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("ANÁLISE POR CATEGORIA", 20, yPos)
    yPos += 10

    data.categoriesScores.slice(0, 5).forEach((category, index) => {
      const scoreColor = category.score >= 70 ? [16, 185, 129] : category.score >= 40 ? [245, 158, 11] : [239, 68, 68]

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      // Nome da categoria
      const categoryName = category.title.length > 35 ? category.title.substring(0, 35) + "..." : category.title
      pdf.text(categoryName, 20, yPos + 5)

      // Score
      pdf.setFont("helvetica", "bold")
      pdf.text(`${category.score}%`, 170, yPos + 5)

      // Barra de progresso
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, yPos + 8, 100, 3, "F")

      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2])
      pdf.rect(20, yPos + 8, (category.score / 100) * 100, 3, "F")

      yPos += 15
    })

    yPos += 10

    // Plano de Ação
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("PLANO DE AÇÃO PRIORITÁRIO", 20, yPos)
    yPos += 10

    data.improvements.slice(0, 5).forEach((improvement, index) => {
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")

      // Número
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.circle(25, yPos + 3, 3, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.text(`${index + 1}`, 25, yPos + 4, { align: "center" })

      // Texto
      pdf.setTextColor(0, 0, 0)
      pdf.setFont("helvetica", "normal")
      const wrappedText = pdf.splitTextToSize(improvement, 160)
      pdf.text(wrappedText, 35, yPos + 2)

      yPos += Math.max(8, wrappedText.length * 4)
    })

    // Footer/CTA
    yPos = 260 // Posição fixa no final
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.rect(0, yPos, 210, 30, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("QUER IMPLEMENTAR TUDO ISSO?", 105, yPos + 10, { align: "center" })

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text("Implementamos seu checklist completo em 7-30 dias", 105, yPos + 18, { align: "center" })

    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("(73) 99869-9065 • A partir de R$ 600", 105, yPos + 25, { align: "center" })

    // Salvar
    const fileName = `diagnostico-gmb-${data.userData.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
    pdf.save(fileName)

    return fileName
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    throw new Error("Falha ao gerar o PDF. Tente novamente.")
  }
}
