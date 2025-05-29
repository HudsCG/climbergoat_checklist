import type React from "react"
import type { MaturityLevel } from "./checklist-data"

// Clean Code: Constantes bem definidas ao invés de magic numbers
export const SCORE_THRESHOLDS = {
  BEGINNER: 30,
  REGULAR: 60,
  GOOD: 85,
  EXCELLENT: 100,
} as const

export const MATURITY_COLORS = {
  gold: "#f59e0b",
  good: "#10b981",
  regular: "#f97316",
  beginner: "#ef4444",
  default: "#6b7280",
} as const

export const PROGRESS_COLORS = {
  excellent: "var(--sage)",
  good: "var(--gold)",
  poor: "#ef4444",
} as const

// Strategy Pattern: Diferentes estratégias de conteúdo baseadas no score
interface ContentStrategy {
  getContent(score: number, maturityLevel: MaturityLevel | null): PersonalizedContent
}

export interface PersonalizedContent {
  tone: string
  title: string
  subtitle: string
  offer: string
  urgency: string
  whatsappText: string
  timeline: string
  potential: number
  ctaStyle: React.CSSProperties
}

class BeginnerContentStrategy implements ContentStrategy {
  getContent(score: number): PersonalizedContent {
    return {
      tone: "urgent",
      title: "Seu perfil precisa de atenção, mas não se preocupe!",
      subtitle: "Todo negócio de sucesso começou exatamente onde você está agora.",
      offer:
        "🚀 OFERTA ESPECIAL: Implementamos TUDO do seu checklist em apenas 7 dias por R$600. Sem dor de cabeça, sem perda de tempo.",
      urgency: "⏰ Seus concorrentes já estão na frente. Cada dia que passa é cliente perdido!",
      whatsappText: `Olá! Meu perfil no Google Meu Negócio está com ${score}% e preciso de ajuda URGENTE para começar a atrair turistas. Quero implementar tudo em 7 dias!`,
      timeline: "7-15 dias",
      potential: Math.min(score + 70, SCORE_THRESHOLDS.EXCELLENT),
      ctaStyle: { background: "#ef4444", color: "white", fontSize: "1.1rem", padding: "1rem 2rem" },
    }
  }
}

class RegularContentStrategy implements ContentStrategy {
  getContent(score: number): PersonalizedContent {
    return {
      tone: "encouraging",
      title: "Você está indo bem, mas sabemos que gerenciar tudo isso dá trabalho!",
      subtitle: "Seu perfil está no caminho certo, mas há várias oportunidades para acelerar seus resultados.",
      offer:
        "🎯 ACELERE SEUS RESULTADOS: Otimizamos seu perfil para o nível OURO em 15 dias por R$600. Mais clientes, menos trabalho para você.",
      urgency: "📈 Você já tem uma base boa. Agora é hora de ACELERAR e deixar a concorrência para trás!",
      whatsappText: `Olá! Meu perfil GMB está com ${score}% e quero acelerar os resultados para chegar ao nível OURO. Como vocês podem me ajudar?`,
      timeline: "15-30 dias",
      potential: Math.min(score + 40, 95),
      ctaStyle: { background: "#f59e0b", color: "white", fontSize: "1.1rem", padding: "1rem 2rem" },
    }
  }
}

class GoodContentStrategy implements ContentStrategy {
  getContent(score: number): PersonalizedContent {
    return {
      tone: "recognition",
      title: "Parabéns pelo ótimo trabalho!",
      subtitle: "Você está quase lá, mas esses últimos detalhes fazem toda diferença para se destacar.",
      offer:
        "🏆 RUMO À EXCELÊNCIA: Levamos seu perfil ao nível OURO e mantemos a excelência por R$600. Você foca no negócio, nós cuidamos da presença digital.",
      urgency: "⭐ Você está quase no topo! Esses últimos 15-25% fazem TODA a diferença na atração de clientes.",
      whatsappText: `Olá! Meu perfil GMB está com ${score}% e quero chegar ao nível OURO. Como vocês podem me ajudar a alcançar a excelência?`,
      timeline: "7-15 dias",
      potential: Math.min(score + 15, SCORE_THRESHOLDS.EXCELLENT),
      ctaStyle: { background: "var(--sage)", color: "white", fontSize: "1.1rem", padding: "1rem 2rem" },
    }
  }
}

class ExcellentContentStrategy implements ContentStrategy {
  getContent(score: number): PersonalizedContent {
    return {
      tone: "celebration",
      title: "Impressionante! Você domina o Google Meu Negócio!",
      subtitle:
        "Você é um exemplo, mas manter essa excelência dá trabalho e tempo que você poderia investir no crescimento.",
      offer:
        "👑 MANUTENÇÃO VIP: Mantemos seu perfil OURO sempre atualizado e otimizado por R$600. Você vira nosso case de sucesso!",
      urgency:
        "🚀 Você já domina o GMB! Agora é hora de focar 100% no crescimento enquanto mantemos sua excelência digital.",
      whatsappText: `Olá! Meu perfil GMB está com ${score}% (nível OURO) e quero manter essa excelência. Como posso virar um case de sucesso?`,
      timeline: "Manutenção contínua",
      potential: SCORE_THRESHOLDS.EXCELLENT,
      ctaStyle: { background: "var(--gold)", color: "white", fontSize: "1.1rem", padding: "1rem 2rem" },
    }
  }
}

// Factory Pattern: Cria a estratégia apropriada baseada no score
export class ContentStrategyFactory {
  static createStrategy(score: number): ContentStrategy {
    if (score <= SCORE_THRESHOLDS.BEGINNER) return new BeginnerContentStrategy()
    if (score <= SCORE_THRESHOLDS.REGULAR) return new RegularContentStrategy()
    if (score <= SCORE_THRESHOLDS.GOOD) return new GoodContentStrategy()
    return new ExcellentContentStrategy()
  }
}

// Clean Code: Funções utilitárias com responsabilidade única
export const getMaturityColor = (level: MaturityLevel | null): string => {
  if (!level?.id) return MATURITY_COLORS.default
  return MATURITY_COLORS[level.id as keyof typeof MATURITY_COLORS] || MATURITY_COLORS.default
}

export const getProgressColor = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.GOOD) return PROGRESS_COLORS.excellent
  if (score >= SCORE_THRESHOLDS.REGULAR) return PROGRESS_COLORS.good
  return PROGRESS_COLORS.poor
}
