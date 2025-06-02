"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, ThumbsUp, Trophy, ArrowLeft, Target, TrendingUp, BarChart3, Clock, Zap } from "lucide-react"
import { generateProfessionalPDF } from "@/lib/pdf-generator"
import { ContentStrategyFactory, getMaturityColor, getProgressColor } from "@/lib/results-content-strategy"
import { useResultsData } from "@/hooks/use-results-data"

// Clean Code: Componentes pequenos e focados
const LoadingSpinner = () => (
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

const ErrorState = ({ message }: { message: string }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <p style={{ color: "var(--warm-gray)", fontSize: "1.1rem" }}>{message}</p>
  </div>
)

// Clean Code: Componente de cabeçalho separado
const DashboardHeader = () => (
  <header style={{ background: "white", borderBottom: "1px solid var(--border-subtle)" }}>
    <div
      className="container mobile-header"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem" }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <div className="flex gap-1" style={{ cursor: "pointer" }}>
          <img src="/images/climber-goat-logo.png" alt="Climber Goat" style={{ height: "clamp(1.5rem, 3vw, 2rem)" }} />
        </div>
      </Link>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link href="/checklist">
          <button className="btn btn-secondary mobile-text-sm">
            <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
            <span className="hidden md:inline">Voltar ao Checklist</span>
            <span className="md:hidden">Voltar</span>
          </button>
        </Link>
      </div>
    </div>
  </header>
)

// Clean Code: Componente de score separado
const ScoreCard = ({ totalScore }: { totalScore: number }) => (
  <div className="card mobile-p-1" style={{ textAlign: "center", margin: "0 0.5rem" }}>
    <h2
      style={{
        fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
        fontWeight: "600",
        marginBottom: "2rem",
        color: "var(--dark)",
      }}
    >
      Pontuação geral
    </h2>
    <div
      className="mobile-score-circle"
      style={{
        width: "200px",
        height: "200px",
        margin: "0 auto 2rem",
        borderRadius: "50%",
        background: `conic-gradient(${getProgressColor(totalScore)} ${totalScore * 3.6}deg, var(--border-subtle) 0deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        className="mobile-score-inner"
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="mobile-score-text"
          style={{
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: "700",
            color: "var(--dark)",
          }}
        >
          {totalScore}%
        </span>
      </div>
    </div>
  </div>
)

// Clean Code: Componente de nível de maturidade separado e otimizado
const MaturityLevelCard = ({ maturityLevel, totalScore }: { maturityLevel: any; totalScore: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const color = getMaturityColor(maturityLevel)

  const cardStyle = {
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    color: "white",
    textAlign: "center" as const,
    padding: "clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2rem)",
    boxShadow: isHovered
      ? `0 25px 80px ${color}40, 0 12px 40px ${color}30`
      : `0 20px 60px ${color}30, 0 8px 32px ${color}20`,
    border: `3px solid ${color}`,
    position: "relative" as const,
    overflow: "hidden" as const,
    transform: isHovered ? "translateY(-5px)" : "translateY(0)",
    transition: "all 0.3s ease",
  }

  return (
    <div
      className="card mobile-p-1"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background elements */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          animation: "pulse 4s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Trophy */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "clamp(80px, 15vw, 100px)",
            height: "clamp(80px, 15vw, 100px)",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            marginBottom: "1.5rem",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Trophy
            size={window.innerWidth < 768 ? 40 : 50}
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
              animation: "bounce 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Level badge */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "0.5rem 1.5rem",
            borderRadius: "2rem",
            marginBottom: "1rem",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "inline-block",
          }}
        >
          <h3
            style={{
              fontSize: "clamp(0.875rem, 2vw, 1rem)",
              fontWeight: "700",
              margin: "0",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: 0.9,
            }}
          >
            Seu Nível
          </h3>
        </div>

        {/* Level name */}
        <h2
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
            fontWeight: "900",
            marginBottom: "1.5rem",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            letterSpacing: "-0.02em",
            background: "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            position: "relative",
          }}
        >
          {maturityLevel?.name}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "4px",
              background: "rgba(255, 255, 255, 0.6)",
              borderRadius: "2px",
            }}
          />
        </h2>

        {/* Description */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            padding: "clamp(1rem, 3vw, 1.5rem)",
            borderRadius: "1rem",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <p
            style={{
              margin: "0",
              lineHeight: "1.6",
              fontSize: "clamp(0.875rem, 2.2vw, 1.1rem)",
              fontWeight: "500",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            }}
          >
            {maturityLevel?.description}
          </p>
        </div>

        {/* Score indicator */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.8)",
            }}
          />
          <span
            style={{
              fontSize: "clamp(0.875rem, 2vw, 1rem)",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            {totalScore}% Completo
          </span>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.8)",
            }}
          />
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  )
}

// Clean Code: Componente principal simplificado
export function ResultsDashboard() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const resultsData = useResultsData()

  // Pragmatic Programmer: Fail Fast
  if (resultsData.isLoading) return <LoadingSpinner />
  if (resultsData.error) return <ErrorState message={resultsData.error} />

  const { userData, totalScore, maturityLevel, categoriesScores, strengths, weaknesses, improvements } = resultsData

  // Strategy Pattern: Obter conteúdo personalizado
  const contentStrategy = ContentStrategyFactory.createStrategy(totalScore)
  const content = contentStrategy.getContent(totalScore, maturityLevel)

  const handleGeneratePDF = async () => {
    if (!userData) return

    setIsGeneratingPDF(true)
    try {
      const pdfData = {
        userData,
        totalScore,
        maturityLevel,
        categoriesScores,
        improvements,
        strengths,
        weaknesses,
      }

      const fileName = await generateProfessionalPDF(pdfData)
      alert(`PDF gerado com sucesso: ${fileName}`)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <DashboardHeader />

      <main className="container section" style={{ padding: "0 1.5rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 5vw, 4rem)" }}>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "var(--dark)",
            }}
          >
            Resultados do seu Diagnóstico
          </h1>
          <p
            style={{
              color: "var(--warm-gray)",
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
            }}
          >
            {userData?.name}, veja como seu perfil no Google Meu Negócio está performando:
          </p>
        </div>

        {/* Score and Level */}
        <div
          className="mobile-results-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          <ScoreCard totalScore={totalScore} />
          <MaturityLevelCard maturityLevel={maturityLevel} totalScore={totalScore} />
        </div>

        {/* Radar Chart e Projeção */}
        <div
          className="mobile-grid-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* Gráfico Radar das Categorias */}
          <div className="card mobile-p-1">
            <h3
              style={{
                fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                fontWeight: "600",
                marginBottom: "1.5rem",
                color: "var(--dark)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BarChart3 size={20} color="var(--sage)" style={{ marginRight: "0.75rem" }} />
              Análise por Categoria
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {categoriesScores.slice(0, 5).map((category) => (
                <div key={category.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontWeight: "500",
                        color: "var(--dark)",
                        fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
                      }}
                    >
                      {category.title.length > 20 ? category.title.substring(0, 20) + "..." : category.title}
                    </span>
                    <span style={{ fontWeight: "600", color: getProgressColor(category.score) }}>
                      {category.score}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "var(--border-subtle)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${category.score}%`,
                        height: "100%",
                        background: getProgressColor(category.score),
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projeção de Melhoria */}
          <div className="card mobile-p-1">
            <h3
              style={{
                fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                fontWeight: "600",
                marginBottom: "1.5rem",
                color: "var(--dark)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TrendingUp size={20} color="var(--gold)" style={{ marginRight: "0.75rem" }} />
              Seu Potencial
            </h3>

            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
              >
                <div>
                  <p style={{ fontSize: "0.875rem", color: "var(--warm-gray)", marginBottom: "0.25rem" }}>Atual</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--dark)" }}>{totalScore}%</p>
                </div>
                <div style={{ flex: 1, margin: "0 1rem" }}>
                  <div
                    style={{
                      height: "8px",
                      background: "var(--border-subtle)",
                      borderRadius: "4px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${totalScore}%`,
                        height: "100%",
                        background: getProgressColor(totalScore),
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${totalScore}%`,
                        width: `${content.potential - totalScore}%`,
                        height: "100%",
                        background: "var(--sage)",
                        opacity: 0.3,
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "var(--warm-gray)", marginBottom: "0.25rem" }}>Potencial</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--sage)" }}>{content.potential}%</p>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--off-white)",
                padding: "1rem",
                borderRadius: "0.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
                <Clock size={16} color="var(--sage)" style={{ marginRight: "0.5rem" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--sage)" }}>
                  Timeline: {content.timeline}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--warm-gray)" }}>
                Com a Climber Goat, você pode alcançar {content.potential}% em {content.timeline}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div
          className="mobile-grid-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* Strengths */}
          <div className="card mobile-p-1">
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <ThumbsUp size={20} color="var(--sage)" style={{ marginRight: "0.75rem" }} />
              <h3
                style={{
                  fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                  fontWeight: "600",
                  color: "var(--dark)",
                }}
              >
                Seus pontos fortes
              </h3>
            </div>
            {strengths.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {strengths.map((strength) => (
                  <div key={strength.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span
                        style={{
                          fontWeight: "500",
                          color: "var(--dark)",
                          fontSize: "clamp(0.875rem, 2vw, 1rem)",
                        }}
                      >
                        {strength.title}
                      </span>
                      <span style={{ fontWeight: "600", color: "var(--sage)" }}>{strength.score}%</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "var(--border-subtle)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${strength.score}%`,
                          height: "100%",
                          background: getProgressColor(strength.score),
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  color: "var(--warm-gray)",
                  fontStyle: "italic",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
              >
                Ainda não identificamos pontos fortes. Continue melhorando seu perfil!
              </p>
            )}
          </div>

          {/* Weaknesses */}
          <div className="card mobile-p-1">
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <Target size={20} color="#ef4444" style={{ marginRight: "0.75rem" }} />
              <h3
                style={{
                  fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                  fontWeight: "600",
                  color: "var(--dark)",
                }}
              >
                Oportunidades prioritárias
              </h3>
            </div>
            {weaknesses.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {weaknesses.map((weakness) => (
                  <div key={weakness.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span
                        style={{
                          fontWeight: "500",
                          color: "var(--dark)",
                          fontSize: "clamp(0.875rem, 2vw, 1rem)",
                        }}
                      >
                        {weakness.title}
                      </span>
                      <span style={{ fontWeight: "600", color: "#ef4444" }}>{weakness.score}%</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "var(--border-subtle)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${weakness.score}%`,
                          height: "100%",
                          background: getProgressColor(weakness.score),
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  color: "var(--warm-gray)",
                  fontStyle: "italic",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
              >
                Parabéns! Você está indo muito bem em todas as categorias.
              </p>
            )}
          </div>
        </div>

        {/* Plano de Ação Priorizado */}
        <div className="card mobile-p-1" style={{ marginBottom: "3rem" }}>
          <h3
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
              fontWeight: "600",
              marginBottom: "1.5rem",
              color: "var(--dark)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Zap size={20} color="var(--gold)" style={{ marginRight: "0.75rem" }} />
            Plano de Ação Priorizado
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {improvements.map((improvement, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "1rem",
                  background: index < 3 ? "rgba(109, 142, 117, 0.05)" : "var(--off-white)",
                  borderRadius: "0.5rem",
                  border: index < 3 ? "1px solid var(--sage)" : "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    background: index < 3 ? "var(--sage)" : "var(--warm-gray)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                    marginTop: "0.125rem",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "600" }}>{index + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: "var(--dark)",
                      lineHeight: "1.6",
                      fontSize: "clamp(0.875rem, 2vw, 1rem)",
                      marginBottom: index < 3 ? "0.5rem" : 0,
                    }}
                  >
                    {improvement}
                  </p>
                  {index < 3 && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--sage)",
                        fontWeight: "600",
                        background: "rgba(109, 142, 117, 0.1)",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      PRIORIDADE ALTA
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized CTA Section */}
        <div
          className="mobile-cta"
          style={{
            background: "white",
            borderRadius: "1rem",
            padding: "clamp(2rem, 5vw, 4rem)",
            textAlign: "center",
            border: "1px solid var(--border-subtle)",
            marginBottom: "2rem",
            margin: "0 0.5rem 2rem",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "var(--dark)",
            }}
          >
            {content.title}
          </h2>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
              marginBottom: "2rem",
              color: "var(--warm-gray)",
              maxWidth: "700px",
              margin: "0 auto 2rem",
            }}
          >
            {content.subtitle}
          </p>

          <div
            style={{
              background: "var(--sage)",
              color: "white",
              padding: "clamp(1.5rem, 4vw, 2rem)",
              borderRadius: "0.75rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                fontWeight: "600",
                marginBottom: "0.5rem",
              }}
            >
              {content.offer}
            </p>
            <p
              style={{
                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                opacity: 0.9,
              }}
            >
              {content.urgency}
            </p>
          </div>

          <div
            className="flex-mobile-column gap-mobile"
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="btn"
              style={{
                background: "white",
                color: "var(--sage)",
                fontWeight: "600",
                border: "1px solid var(--sage)",
                fontSize: "clamp(0.875rem, 2vw, 1.1rem)",
                opacity: isGeneratingPDF ? 0.7 : 1,
                cursor: isGeneratingPDF ? "not-allowed" : "pointer",
              }}
            >
              <Download size={16} style={{ marginRight: "0.5rem" }} />
              {isGeneratingPDF ? "Gerando PDF..." : "Baixar relatório PDF"}
            </button>

            <a
              href={`https://wa.me/5573998699065?text=${encodeURIComponent(content.whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="btn"
                style={{
                  background: "#25D366",
                  color: "white",
                  fontSize: "clamp(0.875rem, 2vw, 1.1rem)",
                  fontWeight: "600",
                }}
              >
                💬 Falar com Especialista
              </button>
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
              fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
              color: "var(--warm-gray)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "600", color: "var(--sage)" }}>⚡ Implementação</p>
              <p>{content.timeline}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "600", color: "var(--sage)" }}>💰 Investimento</p>
              <p>A partir de R$600</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "600", color: "var(--sage)" }}>🎯 Resultados</p>
              <p>Mais clientes em 30 dias</p>
            </div>
          </div>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
              fontWeight: "600",
              color: "var(--sage)",
              fontStyle: "italic",
            }}
          >
            Climber Goat - Transformando presença digital em resultados reais.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "var(--dark)", color: "white", padding: "4rem 0", marginTop: "4rem" }}>
        <div className="container mobile-footer flex flex-between" style={{ padding: "0 2rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="flex gap-1" style={{ cursor: "pointer" }}>
              <img
                src="/images/climber-goat-logo.png"
                alt="Climber Goat"
                style={{ height: "clamp(1.5rem, 3vw, 2rem)", filter: "brightness(0) invert(1)" }}
              />
            </div>
          </Link>
          <p
            style={{
              fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
              opacity: "0.7",
            }}
          >
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
