interface CardData {
  userData: { name: string; email: string; whatsapp: string }
  totalScore: number
  maturityLevel: { id: string; name: string; description: string } | null
  topCategories: { title: string; score: number }[]
}

export const generateResultCard = async (data: CardData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Criar canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Canvas context not available")
      }

      // Dimensões do card (formato Instagram/LinkedIn)
      canvas.width = 800
      canvas.height = 600

      // Cores baseadas no nível
      const getColors = (level: string) => {
        switch (level) {
          case "gold":
            return { primary: "#f59e0b", secondary: "#fbbf24", bg: "#fffbeb" }
          case "good":
            return { primary: "#10b981", secondary: "#34d399", bg: "#ecfdf5" }
          case "regular":
            return { primary: "#f97316", secondary: "#fb923c", bg: "#fff7ed" }
          case "beginner":
            return { primary: "#ef4444", secondary: "#f87171", bg: "#fef2f2" }
          default:
            return { primary: "#6b7280", secondary: "#9ca3af", bg: "#f9fafb" }
        }
      }

      const colors = getColors(data.maturityLevel?.id || "beginner")

      // Fundo com gradiente
      const gradient = ctx.createLinearGradient(0, 0, 800, 600)
      gradient.addColorStop(0, colors.bg)
      gradient.addColorStop(1, "#ffffff")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 800, 600)

      // Header com logo e título
      ctx.fillStyle = colors.primary
      ctx.fillRect(0, 0, 800, 80)

      // Título
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 24px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("DIAGNÓSTICO GOOGLE MEU NEGÓCIO", 400, 35)

      ctx.font = "16px Inter, sans-serif"
      ctx.fillText("Resultado Completo", 400, 60)

      // Nome do usuário
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 20px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(data.userData.name, 400, 120)

      // Score principal (círculo)
      const centerX = 200
      const centerY = 250
      const radius = 80

      // Círculo de fundo
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = "#f1f5f9"
      ctx.fill()

      // Círculo de progresso
      const progressAngle = (data.totalScore / 100) * 2 * Math.PI - Math.PI / 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, progressAngle)
      ctx.lineWidth = 12
      ctx.strokeStyle = colors.primary
      ctx.lineCap = "round"
      ctx.stroke()

      // Score texto
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 36px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${data.totalScore}%`, centerX, centerY + 10)

      // Nível badge
      const badgeX = 200
      const badgeY = 360
      const badgeWidth = 160
      const badgeHeight = 40

      // Fundo do badge
      ctx.fillStyle = colors.primary
      ctx.roundRect(badgeX - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 20)
      ctx.fill()

      // Texto do nível
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(data.maturityLevel?.name || "N/A", badgeX, badgeY + 5)

      // Top 3 categorias
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 18px Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("Top Categorias:", 450, 180)

      data.topCategories.slice(0, 3).forEach((category, index) => {
        const y = 210 + index * 50

        // Nome da categoria
        ctx.fillStyle = "#374151"
        ctx.font = "14px Inter, sans-serif"
        const categoryName = category.title.length > 25 ? category.title.substring(0, 25) + "..." : category.title
        ctx.fillText(categoryName, 450, y)

        // Score
        ctx.fillStyle = colors.primary
        ctx.font = "bold 14px Inter, sans-serif"
        ctx.textAlign = "right"
        ctx.fillText(`${category.score}%`, 750, y)

        // Barra de progresso
        const barWidth = 280
        const barHeight = 8
        const barX = 450
        const barY = y + 8

        // Fundo da barra
        ctx.fillStyle = "#e5e7eb"
        ctx.roundRect(barX, barY, barWidth, barHeight, 4)
        ctx.fill()

        // Progresso da barra
        const progressWidth = (category.score / 100) * barWidth
        ctx.fillStyle = colors.primary
        ctx.roundRect(barX, barY, progressWidth, barHeight, 4)
        ctx.fill()

        ctx.textAlign = "left"
      })

      // Call to action
      const ctaY = 450
      ctx.fillStyle = "#6b7280"
      ctx.font = "16px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Faça seu diagnóstico gratuito:", 400, ctaY)

      ctx.fillStyle = colors.primary
      ctx.font = "bold 18px Inter, sans-serif"
      ctx.fillText("climbergoat.com/diagnostico", 400, ctaY + 25)

      // Logo/Branding no footer
      ctx.fillStyle = "#9ca3af"
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Climber Goat - Transformando presença digital em resultados reais", 400, 570)

      // Converter para blob e retornar URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          } else {
            reject(new Error("Failed to create blob"))
          }
        },
        "image/png",
        0.9,
      )
    } catch (error) {
      reject(error)
    }
  })
}

// Função helper para roundRect (caso não esteja disponível)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    this.beginPath()
    this.moveTo(x + radius, y)
    this.lineTo(x + width - radius, y)
    this.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.lineTo(x + width, y + height - radius)
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.lineTo(x + radius, y + height)
    this.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.lineTo(x, y + radius)
    this.quadraticCurveTo(x, y, x + radius, y)
    this.closePath()
  }
}
