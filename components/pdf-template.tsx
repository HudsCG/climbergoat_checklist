"use client"

import { Trophy, Target, TrendingUp, CheckCircle, Zap, Phone } from "lucide-react"
import type { MaturityLevel } from "@/lib/checklist-data"

interface PDFTemplateProps {
  userData: { name: string; email: string; whatsapp: string }
  totalScore: number
  maturityLevel: MaturityLevel | null
  categoriesScores: { id: string; title: string; score: number }[]
  improvements: string[]
  strengths: { id: string; title: string; score: number }[]
  weaknesses: { id: string; title: string; score: number }[]
}

export function PDFTemplate({
  userData,
  totalScore,
  maturityLevel,
  categoriesScores,
  improvements,
  strengths,
  weaknesses,
}: PDFTemplateProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "#10b981"
    if (score >= 50) return "#f59e0b"
    return "#ef4444"
  }

  const getMaturityColor = (level: MaturityLevel | null) => {
    switch (level?.id) {
      case "gold":
        return "#f59e0b"
      case "good":
        return "#10b981"
      case "regular":
        return "#f97316"
      case "beginner":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <div
      id="pdf-content"
      style={{
        width: "794px",
        height: "1123px",
        background: "white",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
        color: "#1f2937",
        padding: "0",
        margin: "0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #6d8e75 0%, #8ba394 100%)",
          padding: "20px 30px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              fontWeight: "bold",
              color: "#6d8e75",
              fontSize: "14px",
            }}
          >
            CG
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "700", margin: "0", letterSpacing: "-0.025em" }}>
              DIAGNÓSTICO GOOGLE MEU NEGÓCIO
            </h1>
            <p style={{ fontSize: "12px", margin: "0", opacity: "0.9" }}>Relatório Completo - {userData.name}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", margin: "0", opacity: "0.8" }}>
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "24px 30px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Score e Level */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          {/* Score Card */}
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 16px 0", color: "#1f2937" }}>
              Pontuação Geral
            </h3>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: `conic-gradient(${getScoreColor(totalScore)} ${totalScore * 3.6}deg, #f1f5f9 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>{totalScore}%</span>
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: "0" }}>Nível de Maturidade</p>
          </div>

          {/* Level Card */}
          <div
            style={{
              background: `linear-gradient(135deg, ${getMaturityColor(maturityLevel)} 0%, ${getMaturityColor(maturityLevel)}dd 100%)`,
              padding: "20px",
              borderRadius: "12px",
              color: "white",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={32} style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "12px", fontWeight: "600", margin: "0 0 6px 0", textTransform: "uppercase" }}>
              Seu Nível
            </h3>
            <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 8px 0" }}>{maturityLevel?.name || "N/A"}</h2>
            <p style={{ fontSize: "10px", margin: "0", opacity: "0.9", lineHeight: "1.3", textAlign: "center" }}>
              {maturityLevel?.description}
            </p>
          </div>
        </div>

        {/* Grid principal - 3 colunas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Categories Analysis */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                margin: "0 0 12px 0",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TrendingUp size={16} style={{ marginRight: "6px", color: "#6d8e75" }} />
              Categorias
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {categoriesScores.slice(0, 4).map((category) => (
                <div key={category.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "500", color: "#1f2937", fontSize: "10px", lineHeight: "1.2" }}>
                      {category.title.length > 20 ? category.title.substring(0, 20) + "..." : category.title}
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color: getScoreColor(category.score),
                        fontSize: "10px",
                        minWidth: "30px",
                        textAlign: "right",
                      }}
                    >
                      {category.score}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "#f1f5f9",
                      borderRadius: "3px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: `${category.score}%`,
                        height: "100%",
                        background: getScoreColor(category.score),
                        borderRadius: "3px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: "600",
                margin: "0 0 12px 0",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CheckCircle size={16} style={{ marginRight: "6px", color: "#10b981" }} />
              Pontos Fortes
            </h4>
            {strengths.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {strengths.slice(0, 3).map((strength) => (
                  <div key={strength.id} style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        background: "#10b981",
                        borderRadius: "50%",
                        marginRight: "8px",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "10px", color: "#1f2937", lineHeight: "1.4" }}>
                      {strength.title.length > 25 ? strength.title.substring(0, 25) + "..." : strength.title} (
                      {strength.score}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "10px", color: "#6b7280", margin: "0", fontStyle: "italic", lineHeight: "1.4" }}>
                Continue melhorando para identificar pontos fortes.
              </p>
            )}
          </div>

          {/* Weaknesses */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: "600",
                margin: "0 0 12px 0",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Target size={16} style={{ marginRight: "6px", color: "#ef4444" }} />
              Oportunidades
            </h4>
            {weaknesses.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {weaknesses.slice(0, 3).map((weakness) => (
                  <div key={weakness.id} style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        background: "#ef4444",
                        borderRadius: "50%",
                        marginRight: "8px",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "10px", color: "#1f2937", lineHeight: "1.4" }}>
                      {weakness.title.length > 25 ? weakness.title.substring(0, 25) + "..." : weakness.title} (
                      {weakness.score}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "10px", color: "#6b7280", margin: "0", fontStyle: "italic", lineHeight: "1.4" }}>
                Parabéns! Todas as categorias estão bem.
              </p>
            )}
          </div>
        </div>

        {/* Action Plan */}
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #e2e8f0",
            flex: 1,
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              margin: "0 0 12px 0",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Zap size={16} style={{ marginRight: "8px", color: "#f59e0b" }} />
            Plano de Ação Prioritário
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {improvements.slice(0, 4).map((improvement, index) => {
              const isHighPriority = index < 2 // Ajustar para 2 itens de alta prioridade
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "10px",
                    background: isHighPriority ? "#f0f9f4" : "#f8fafc",
                    borderRadius: "6px",
                    border: `1px solid ${isHighPriority ? "#d1fae5" : "#e2e8f0"}`,
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      background: isHighPriority ? "#10b981" : "#6b7280",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "10px",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: "9px",
                        fontWeight: "700",
                        lineHeight: "1",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0", fontSize: "9px", color: "#1f2937", lineHeight: "1.4" }}>
                      {improvement.length > 65 ? improvement.substring(0, 65) + "..." : improvement}
                    </p>
                    {isHighPriority && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "4px",
                          fontSize: "7px",
                          fontWeight: "600",
                          color: "#10b981",
                          background: "#d1fae5",
                          padding: "2px 4px",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                          lineHeight: "1",
                        }}
                      >
                        Alta Prioridade
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #6d8e75 0%, #8ba394 100%)",
            padding: "16px",
            borderRadius: "8px",
            color: "white",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 8px 0" }}>Quer Implementar Tudo Isso?</h3>
          <p style={{ fontSize: "12px", margin: "0 0 12px 0", opacity: "0.9" }}>
            Implementamos seu checklist completo em 7-30 dias
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Phone size={14} style={{ marginRight: "6px" }} />
              <span style={{ fontSize: "12px", fontWeight: "600" }}>(73) 99869-9065</span>
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>A partir de R$ 600</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#1f2937",
          color: "white",
          padding: "12px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ margin: "0", fontSize: "12px", fontWeight: "600" }}>Climber Goat</p>
          <p style={{ margin: "0", fontSize: "10px", opacity: "0.8" }}>
            Transformando presença digital em resultados reais
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "0", fontSize: "10px", opacity: "0.8" }}>Prado • Cumuruxatiba • Bahia</p>
          <p style={{ margin: "0", fontSize: "10px", opacity: "0.8" }}>www.climbergoat.com</p>
        </div>
      </div>
    </div>
  )
}
