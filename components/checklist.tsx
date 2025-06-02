"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { type ChecklistItem, checklistData } from "@/lib/checklist-data"
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react"
import {
  saveChecklistAnswers,
  getChecklistAnswers,
  calculateCategoryScore,
  calculateTotalScore,
  saveCompletionDate,
} from "@/lib/storage"
import Link from "next/link"

// Clean Code: Constantes para evitar magic numbers e strings
const ANIMATION_DURATION = 300
const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 50,
} as const

// Clean Code: Tipos específicos para melhor type safety
interface CategoryState {
  allChecked: boolean
  someChecked: boolean
  checkedCount: number
  totalCount: number
}

export function ChecklistComponent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("informacoes-basicas")
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Clean Code: Função com responsabilidade única para carregar dados
  const loadAnswers = useCallback(async () => {
    try {
      const savedAnswers = await getChecklistAnswers()
      if (savedAnswers) {
        setAnswers(savedAnswers)
      }
    } catch (error) {
      console.error("Error loading answers:", error)
      // Pragmatic Programmer: Fail fast - mostrar erro para o usuário
      // Em produção, você poderia mostrar um toast ou modal de erro
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnswers()
  }, [loadAnswers])

  // Clean Code: Função pura para calcular estado da categoria
  const getCategoryState = useCallback(
    (category: (typeof checklistData)[0]): CategoryState => {
      const checkedItems = category.items.filter((item) => answers[item.id] === true)
      const checkedCount = checkedItems.length
      const totalCount = category.items.length

      return {
        allChecked: checkedCount === totalCount && totalCount > 0,
        someChecked: checkedCount > 0,
        checkedCount,
        totalCount,
      }
    },
    [answers],
  )

  // Clean Code: Função com responsabilidade única para mudança de checkbox
  const handleCheckboxChange = useCallback(
    async (id: string, checked: boolean) => {
      try {
        // Pragmatic Programmer: Immutability - criar novo objeto ao invés de mutar
        const newAnswers = { ...answers, [id]: checked }
        setAnswers(newAnswers)
        await saveChecklistAnswers(newAnswers)
      } catch (error) {
        console.error("Error saving answer:", error)
        // Pragmatic Programmer: Fail fast - reverter estado em caso de erro
        setAnswers(answers) // Reverte para o estado anterior
      }
    },
    [answers],
  )

  // Design Pattern: Strategy Pattern - estratégia para marcar/desmarcar todos
  const handleToggleAllItems = useCallback(
    async (category: (typeof checklistData)[0]) => {
      try {
        const categoryState = getCategoryState(category)
        const newValue = !categoryState.allChecked

        // Clean Code: Criar novo estado de uma vez ao invés de múltiplas atualizações
        const newAnswers = { ...answers }
        category.items.forEach((item) => {
          newAnswers[item.id] = newValue
        })

        setAnswers(newAnswers)
        await saveChecklistAnswers(newAnswers)
      } catch (error) {
        console.error("Error toggling all items:", error)
        // Manter estado anterior em caso de erro
      }
    },
    [answers, getCategoryState],
  )

  // Clean Code: Funções pequenas e com nomes descritivos
  const navigateToCategory = useCallback((categoryId: string) => {
    setActiveTab(categoryId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const navigateToNextCategory = useCallback(() => {
    const categories = checklistData.map((cat) => cat.id)
    const currentIndex = categories.indexOf(activeTab)

    if (currentIndex < categories.length - 1) {
      navigateToCategory(categories[currentIndex + 1])
    } else {
      router.push("/results")
    }
  }, [activeTab, navigateToCategory, router])

  const navigateToPrevCategory = useCallback(() => {
    const categories = checklistData.map((cat) => cat.id)
    const currentIndex = categories.indexOf(activeTab)

    if (currentIndex > 0) {
      navigateToCategory(categories[currentIndex - 1])
    }
  }, [activeTab, navigateToCategory])

  // Clean Code: Função pura para determinar cor do progresso
  const getProgressColor = useCallback((score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return "var(--sage)"
    if (score >= SCORE_THRESHOLDS.GOOD) return "var(--gold)"
    return "#ef4444"
  }, [])

  // Clean Code: Computações derivadas em variáveis bem nomeadas
  const currentCategory = checklistData.find((cat) => cat.id === activeTab)
  const totalScore = calculateTotalScore(answers, checklistData)
  const isLastCategory = activeTab === checklistData[checklistData.length - 1].id
  const allQuestionsAnswered = checklistData.every((category) =>
    category.items.every((item) => typeof answers[item.id] === "boolean"),
  )

  // Pragmatic Programmer: Early return para casos especiais
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!currentCategory) {
    return <ErrorState message="Categoria não encontrada" />
  }

  const categoryState = getCategoryState(currentCategory)

  const handleFinish = async () => {
    try {
      await saveCompletionDate()
      router.push("/results")
    } catch (error) {
      console.error("Error saving completion date:", error)
      router.push("/results") // Continuar mesmo se houver erro
    }
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <Header totalScore={totalScore} />

      <main className="container section" style={{ padding: "0 1.5rem" }}>
        <ProgressOverview totalScore={totalScore} getProgressColor={getProgressColor} />

        <CategoryNavigation
          categories={checklistData}
          activeTab={activeTab}
          answers={answers}
          onNavigate={navigateToCategory}
          calculateCategoryScore={calculateCategoryScore}
        />

        <CategorySection
          category={currentCategory}
          categoryState={categoryState}
          answers={answers}
          onToggleAll={() => handleToggleAllItems(currentCategory)}
          onItemChange={handleCheckboxChange}
        />

        <NavigationButtons
          canGoPrev={activeTab !== checklistData[0].id}
          canGoNext={true}
          isLastCategory={isLastCategory}
          allQuestionsAnswered={allQuestionsAnswered}
          onPrev={navigateToPrevCategory}
          onNext={navigateToNextCategory}
          onFinish={handleFinish}
          currentCategoryTitle={currentCategory.title}
        />
      </main>
    </div>
  )
}

// Clean Code: Componentes pequenos e focados
function LoadingSpinner() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "2rem",
          height: "2rem",
          border: "2px solid var(--sage)",
          borderTop: "2px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--warm-gray)", fontSize: "1.1rem" }}>{message}</p>
    </div>
  )
}

function Header({ totalScore }: { totalScore: number }) {
  return (
    <header style={{ background: "white", borderBottom: "1px solid var(--border-subtle)" }}>
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="flex gap-1" style={{ cursor: "pointer" }}>
            <img src="/images/climber-goat-logo.png" alt="Climber Goat" style={{ height: "2.5rem" }} />
          </div>
        </Link>
        <div style={{ color: "var(--sage)", fontWeight: "600", fontSize: "1.1rem" }}>Pontuação: {totalScore}%</div>
      </div>
    </header>
  )
}

function ProgressOverview({
  totalScore,
  getProgressColor,
}: {
  totalScore: number
  getProgressColor: (score: number) => string
}) {
  return (
    <div style={{ textAlign: "center", marginBottom: "4rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "600", marginBottom: "1rem", color: "var(--dark)" }}>
        Diagnóstico Google Meu Negócio
      </h1>
      <p style={{ color: "var(--warm-gray)", fontSize: "1.1rem", marginBottom: "2rem" }}>
        Responda as perguntas abaixo para avaliar a maturidade do seu perfil.
      </p>

      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>Progresso total</span>
          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--sage)" }}>{totalScore}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "var(--border-subtle)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${totalScore}%`,
              height: "100%",
              background: getProgressColor(totalScore),
              transition: `width ${ANIMATION_DURATION}ms ease`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface CategoryNavigationProps {
  categories: typeof checklistData
  activeTab: string
  answers: Record<string, boolean>
  onNavigate: (categoryId: string) => void
  calculateCategoryScore: (answers: Record<string, boolean>, category: (typeof checklistData)[0]) => number
}

function CategoryNavigation({
  categories,
  activeTab,
  answers,
  onNavigate,
  calculateCategoryScore,
}: CategoryNavigationProps) {
  return (
    <div style={{ marginBottom: "3rem", padding: "0 1rem" }}>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          padding: "1rem",
          background: "white",
          borderRadius: "1rem",
          border: "1px solid var(--border-subtle)",
          margin: "0 0.5rem",
        }}
      >
        {categories.map((category) => {
          const score = calculateCategoryScore(answers, category)
          const isActive = activeTab === category.id
          return (
            <button
              key={category.id}
              onClick={() => onNavigate(category.id)}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                background: isActive ? "var(--sage)" : "transparent",
                color: isActive ? "white" : "var(--dark)",
                fontWeight: isActive ? "600" : "500",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {category.shortTitle || category.title}
              <div
                style={{
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  opacity: isActive ? 0.9 : 0.7,
                }}
              >
                {score}%
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface CategorySectionProps {
  category: (typeof checklistData)[0]
  categoryState: CategoryState
  answers: Record<string, boolean>
  onToggleAll: () => void
  onItemChange: (id: string, checked: boolean) => void
}

function CategorySection({ category, categoryState, answers, onToggleAll, onItemChange }: CategorySectionProps) {
  return (
    <div className="card" style={{ marginBottom: "3rem", margin: "0 0.5rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--dark)" }}>
          {category.title}
        </h2>
        <p style={{ color: "var(--warm-gray)", lineHeight: "1.6", marginBottom: "1rem" }}>{category.description}</p>

        <ToggleAllButton categoryState={categoryState} onToggle={onToggleAll} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {category.items.map((item) => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            checked={!!answers[item.id]}
            onChange={(checked) => onItemChange(item.id, checked)}
          />
        ))}
      </div>
    </div>
  )
}

function ToggleAllButton({
  categoryState,
  onToggle,
}: {
  categoryState: CategoryState
  onToggle: () => void
}) {
  const buttonText = categoryState.allChecked ? "Desmarcar todos" : "Marcar todos"
  const buttonColor = categoryState.allChecked ? "#ef4444" : "var(--sage)"

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
      <span style={{ fontSize: "0.9rem", color: "var(--warm-gray)" }}>
        {categoryState.checkedCount} de {categoryState.totalCount} itens marcados
      </span>
      <button
        onClick={onToggle}
        className="btn"
        style={{
          background: buttonColor,
          color: "white",
          fontSize: "0.875rem",
          padding: "0.5rem 1rem",
          transition: `all ${ANIMATION_DURATION}ms ease`,
        }}
      >
        {buttonText}
      </button>
    </div>
  )
}

interface NavigationButtonsProps {
  canGoPrev: boolean
  canGoNext: boolean
  isLastCategory: boolean
  allQuestionsAnswered: boolean
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  currentCategoryTitle: string // Adicionar esta linha
}

function NavigationButtons({
  canGoPrev,
  isLastCategory,
  allQuestionsAnswered,
  onPrev,
  onNext,
  onFinish,
  currentCategoryTitle,
}: NavigationButtonsProps) {
  const whatsappMessage = `Olá! Estou fazendo o diagnóstico do Google Meu Negócio e gostaria de ajuda com a seção "${currentCategoryTitle}". Podem fazer o diagnóstico completo por mim?`

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {/* Botão Anterior - apenas se disponível */}
      {canGoPrev && (
        <button
          className="btn btn-secondary"
          onClick={onPrev}
          style={{
            width: "100%",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={16} style={{ marginRight: "0.5rem" }} /> Anterior
        </button>
      )}

      {/* Botão WhatsApp - sempre centralizado */}
      <a
        href={`https://wa.me/5573998699065?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ width: "100%" }}
      >
        <button
          className="btn"
          style={{
            background: "#25D366",
            color: "white",
            fontSize: "clamp(0.875rem, 2vw, 1rem)",
            width: "100%",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          Faça o diagnóstico por mim
        </button>
      </a>

      {/* Botão Próximo/Finalizar - sempre centralizado */}
      <button
        className="btn btn-primary"
        onClick={isLastCategory && allQuestionsAnswered ? onFinish : onNext}
        style={{
          width: "100%",
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isLastCategory && allQuestionsAnswered ? (
          "Ver resultados"
        ) : (
          <>
            Próximo <ChevronRight size={16} style={{ marginLeft: "0.5rem" }} />
          </>
        )}
      </button>
    </div>
  )
}

interface ChecklistItemComponentProps {
  item: ChecklistItem
  checked: boolean
  onChange: (checked: boolean) => void
}

function ChecklistItemComponent({ item, checked, onChange }: ChecklistItemComponentProps) {
  const [showTip, setShowTip] = useState(false)

  // Clean Code: Handler específico para clique no item
  const handleItemClick = useCallback(() => {
    onChange(!checked)
  }, [checked, onChange])

  // Handler para toggle da dica
  const handleTipToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowTip(!showTip)
    },
    [showTip],
  )

  // Fechar dica quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTip) {
        setShowTip(false)
      }
    }

    if (showTip) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showTip])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "clamp(1.5rem, 3vw, 2rem)",
        background: checked ? "rgba(109, 142, 117, 0.05)" : "white",
        border: `2px solid ${checked ? "var(--sage)" : "var(--border-subtle)"}`,
        borderRadius: "0.75rem",
        transition: `all ${ANIMATION_DURATION}ms ease`,
        cursor: "pointer",
        userSelect: "none",
        margin: "0 0.5rem 1rem",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        position: "relative",
      }}
      onClick={handleItemClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleItemClick()
        }
      }}
    >
      <input
        type="checkbox"
        id={item.id}
        checked={checked}
        onChange={() => {}} // Controlado pelo div pai
        style={{
          width: "1.25rem",
          height: "1.25rem",
          marginTop: "0.125rem",
          marginRight: "1rem",
          accentColor: "var(--sage)",
          cursor: "pointer",
          pointerEvents: "none", // Desabilita cliques diretos
        }}
        tabIndex={-1} // Remove do tab order
      />
      <div style={{ flex: 1 }}>
        <label
          htmlFor={item.id}
          style={{
            fontWeight: "500",
            color: "var(--dark)",
            cursor: "pointer",
            lineHeight: "1.5",
            display: "block",
            marginBottom: item.tip ? "0.75rem" : 0,
            pointerEvents: "none", // Label não interfere no clique
          }}
        >
          {item.question}
        </label>

        {item.tip && (
          <div style={{ position: "relative" }}>
            <button
              onClick={handleTipToggle}
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "var(--sage)",
                background: showTip ? "var(--sage)" : "rgba(109, 142, 117, 0.1)",
                border: "1px solid var(--sage)",
                borderRadius: "1rem",
                cursor: "pointer",
                fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                padding: "0.5rem 0.75rem",
                pointerEvents: "auto",
                minHeight: "44px",
                minWidth: "44px",
                justifyContent: "center",
                transition: "all 0.2s ease",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <HelpCircle size={16} style={{ marginRight: "0.25rem", color: showTip ? "white" : "var(--sage)" }} />
              <span style={{ whiteSpace: "nowrap", color: showTip ? "white" : "var(--sage)" }}>Dica</span>
            </button>

            {showTip && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  marginTop: "0.5rem",
                  padding: "1rem",
                  background: "white",
                  border: "2px solid var(--sage)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  zIndex: 10,
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  lineHeight: "1.5",
                  color: "var(--dark)",
                  maxWidth: "clamp(250px, 90vw, 400px)",
                  animation: "fadeIn 0.2s ease-out",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <p style={{ margin: 0 }}>{item.tip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
