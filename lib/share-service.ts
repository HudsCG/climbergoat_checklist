import type { MaturityLevel } from "./checklist-data"

// Clean Code: Separação de responsabilidades - serviço dedicado para compartilhamento
export interface ShareData {
  platform: string
  userData: any
  totalScore: number
  maturityLevel: MaturityLevel | null
}

export class ShareService {
  private static readonly BASE_URL = typeof window !== "undefined" ? window.location.origin : ""

  private static createBaseText(totalScore: number, maturityLevel: MaturityLevel | null): string {
    return `🎯 Acabei de descobrir que meu negócio está ${totalScore}% otimizado para atrair turistas!

📊 Nível: ${maturityLevel?.name}

✨ Diagnóstico feito pela Climber Goat`
  }

  private static getShareUrls(baseText: string) {
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(baseText + `\n\n🔗 Faça o seu diagnóstico: ${this.BASE_URL}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.BASE_URL)}&title=${encodeURIComponent("Diagnóstico Google Meu Negócio")}&summary=${encodeURIComponent(baseText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.BASE_URL)}&quote=${encodeURIComponent(baseText)}`,
      instagram: baseText,
    }
  }

  static share({ platform, userData, totalScore, maturityLevel }: ShareData): void {
    const baseText = this.createBaseText(totalScore, maturityLevel)
    const shareUrls = this.getShareUrls(baseText)

    if (platform === "instagram") {
      this.copyToClipboard(baseText)
      alert("Texto copiado! Cole no seu Instagram Stories ou post.")
      return
    }

    const url = shareUrls[platform as keyof typeof shareUrls]
    if (url) {
      window.open(url, "_blank")
    }
  }

  private static copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Erro ao copiar texto:", err)
    })
  }
}
