"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, MapPin, Star } from "lucide-react"
import Link from "next/link"

// Clean Code: Imports organizados
import type { UserData, ValidationResult } from "@/lib/types"
import { ValidationFactory, sanitizeInput } from "@/lib/validation"
import { StorageService } from "@/lib/storage-service"
import { EmailServiceFactory } from "@/lib/email-service"
import { ErrorHandler } from "@/lib/error-handler"

// Clean Code: Interface específica para o estado do formulário
interface FormState {
  data: UserData
  errors: Record<string, string>
  isSubmitting: boolean
  isSubmitted: boolean
}

export function LandingPage() {
  const router = useRouter()

  // Clean Code: Estado inicial bem definido
  const [formState, setFormState] = useState<FormState>({
    data: {
      name: "",
      email: "",
      whatsapp: "",
    },
    errors: {},
    isSubmitting: false,
    isSubmitted: false,
  })

  // Design Patterns: Strategy Pattern para validação
  const validateField = useCallback((field: keyof UserData, value: string): ValidationResult => {
    const validator = ValidationFactory.createValidator(field)
    return validator.validate(value)
  }, [])

  // Clean Code: Função com responsabilidade única
  const updateFormData = useCallback((field: keyof UserData, value: string) => {
    const sanitizedValue = sanitizeInput(value)

    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: sanitizedValue,
      },
      errors: {
        ...prev.errors,
        [field]: "", // Clear error when user types
      },
    }))
  }, [])

  // Clean Code: Validação completa do formulário
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    let isValid = true

    // Validate all fields
    Object.entries(formState.data).forEach(([field, value]) => {
      const result = validateField(field as keyof UserData, value)
      if (!result.isValid) {
        errors[field] = result.error || "Campo inválido"
        isValid = false
      }
    })

    setFormState((prev) => ({ ...prev, errors }))
    return isValid
  }, [formState.data, validateField])

  // Pragmatic Programmer: Error handling robusto
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setFormState((prev) => ({ ...prev, isSubmitting: true }))

      try {
        const storageService = StorageService.getInstance()
        const emailService = EmailServiceFactory.create()

        // Pragmatic Programmer: Fail fast - save locally first
        await storageService.saveUserData(formState.data)

        // Email sending is non-blocking
        try {
          await emailService.sendNotification(formState.data)
        } catch (emailError) {
          // Log but don't block the flow
          ErrorHandler.logError(emailError, "Email notification failed")
        }

        setFormState((prev) => ({ ...prev, isSubmitted: true }))

        // Smooth transition
        window.scrollTo({ top: 0, behavior: "smooth" })
        setTimeout(() => router.push("/checklist"), 1500)
      } catch (error) {
        const errorMessage = ErrorHandler.handle(error)
        setFormState((prev) => ({
          ...prev,
          errors: { submit: errorMessage },
        }))
      } finally {
        setFormState((prev) => ({ ...prev, isSubmitting: false }))
      }
    },
    [formState.data, validateForm, router],
  )

  // Clean Code: Função utilitária
  const scrollToForm = useCallback(() => {
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="container mobile-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.5rem 2rem",
            gap: "1rem",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="flex gap-1" style={{ cursor: "pointer" }}>
              <img
                src="/images/climber-goat-logo.png"
                alt="Climber Goat"
                style={{ height: "clamp(2.5rem, 6vw, 3rem)" }}
              />
            </div>
          </Link>
          <button
            className="btn btn-primary"
            onClick={scrollToForm}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
              whiteSpace: "nowrap",
            }}
          >
            Começe Agora
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="section" style={{ padding: "clamp(2.5rem, 6vw, 6rem) 0" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "800px", padding: "0 2rem" }}>
          <p
            style={{
              color: "var(--sage)",
              fontWeight: "500",
              marginBottom: "clamp(1rem, 3vw, 2rem)",
              fontSize: "clamp(0.875rem, 2vw, 1rem)",
            }}
          >
            Presença Digital que Vende
          </p>

          <h1 className="text-hero" style={{ marginBottom: "clamp(1rem, 3vw, 2rem)" }}>
            Seu negócio está pronto para atrair turistas em{" "}
            <span style={{ color: "var(--sage)" }}>Prado e Cumuruxatiba</span>?
          </h1>

          <p
            className="text-large"
            style={{
              color: "var(--warm-gray)",
              marginBottom: "clamp(4rem, 8vw, 5rem)",
              maxWidth: "600px",
              margin: "0 auto 20px",
            }}
          >
            Descubra como seu perfil no Google Meu Negócio está performando e atraia mais clientes para seu
            empreendimento.
          </p>

          <div className="flex gap-2 flex-center flex-mobile-column gap-mobile">
            <button className="btn btn-primary" onClick={scrollToForm} style={{ minWidth: "200px" }}>
              Fazer diagnóstico gratuito
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: "600",
              marginBottom: "clamp(2rem, 5vw, 4rem)",
              color: "var(--dark)",
            }}
          >
            Por que o Google Meu Negócio é essencial?
          </h2>

          <div className="grid-3" style={{ margin: "0 1rem" }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "clamp(2.5rem, 6vw, 3rem)",
                  height: "clamp(2.5rem, 6vw, 3rem)",
                  background: "var(--sage)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  margin: "0 auto 1.5rem auto",
                }}
              >
                <MapPin size={20} color="white" />
              </div>
              <h3
                style={{
                  fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "var(--dark)",
                }}
              >
                Visibilidade local
              </h3>
              <p style={{ color: "var(--warm-gray)", lineHeight: "1.6" }}>
                Apareça nos mapas e buscas locais quando turistas procurarem por negócios como o seu em Prado e região.
              </p>
            </div>

            <div className="card" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "clamp(2.5rem, 6vw, 3rem)",
                  height: "clamp(2.5rem, 6vw, 3rem)",
                  background: "var(--gold)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  margin: "0 auto 1.5rem auto",
                }}
              >
                <Star size={20} color="white" />
              </div>
              <h3
                style={{
                  fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "var(--dark)",
                }}
              >
                Credibilidade
              </h3>
              <p style={{ color: "var(--warm-gray)", lineHeight: "1.6" }}>
                Avaliações e fotos de clientes geram confiança e mostram a qualidade real do seu estabelecimento.
              </p>
            </div>

            <div className="card" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "clamp(2.5rem, 6vw, 3rem)",
                  height: "clamp(2.5rem, 6vw, 3rem)",
                  background: "var(--sage)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  margin: "0 auto 1.5rem auto",
                }}
              >
                <CheckCircle size={20} color="white" />
              </div>
              <h3
                style={{
                  fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "var(--dark)",
                }}
              >
                Informações atualizadas
              </h3>
              <p style={{ color: "var(--warm-gray)", lineHeight: "1.6" }}>
                Mantenha seus horários, contatos e serviços sempre atualizados para evitar frustrações dos clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="diagnostico" className="section">
        <div className="container" style={{ maxWidth: "500px" }}>
          <div className="card mobile-cta" style={{ textAlign: "center", margin: "0 1rem" }}>
            {formState.isSubmitted ? (
              <div>
                <CheckCircle size={48} color="var(--sage)" style={{ margin: "0 auto 1.5rem" }} />
                <h2
                  style={{
                    fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  Perfeito! Vamos começar
                </h2>
                <p style={{ color: "var(--warm-gray)" }}>Estamos preparando seu diagnóstico...</p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 3.5vw, 1.75rem)",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Diagnóstico gratuito
                </h2>
                <p
                  style={{
                    color: "var(--warm-gray)",
                    marginBottom: "2rem",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                >
                  Descubra em 2 minutos como está seu Google Meu Negócio
                </p>

                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                  {/* Error message */}
                  {formState.errors.submit && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        marginBottom: "1rem",
                        color: "#dc2626",
                        fontSize: "0.875rem",
                      }}
                    >
                      {formState.errors.submit}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Nome completo</label>
                    <input
                      type="text"
                      required
                      value={formState.data.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Seu nome completo"
                      className="form-input"
                      style={{
                        borderColor: formState.errors.name ? "#ef4444" : undefined,
                      }}
                    />
                    {formState.errors.name && (
                      <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {formState.errors.name}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">E-mail</label>
                    <input
                      type="email"
                      required
                      value={formState.data.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="form-input"
                      style={{
                        borderColor: formState.errors.email ? "#ef4444" : undefined,
                      }}
                    />
                    {formState.errors.email && (
                      <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {formState.errors.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={formState.data.whatsapp}
                      onChange={(e) => updateFormData("whatsapp", e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="form-input"
                      style={{
                        borderColor: formState.errors.whatsapp ? "#ef4444" : undefined,
                      }}
                    />
                    {formState.errors.whatsapp && (
                      <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {formState.errors.whatsapp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formState.isSubmitting}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                      opacity: formState.isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {formState.isSubmitting ? "Enviando..." : "Iniciar diagnóstico"}
                  </button>

                  <p
                    style={{
                      fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                      color: "var(--warm-gray)",
                      textAlign: "center",
                      marginTop: "1rem",
                    }}
                  >
                    Seus dados estão seguros e não serão compartilhados.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--dark)", color: "white", padding: "4rem 0" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <p
              style={{
                fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                opacity: "0.7",
              }}
            >
              © {new Date().getFullYear()} Todos os direitos reservados.
            </p>
            <Link
              href="/admin"
              style={{
                color: "white",
                opacity: "0.3",
                fontSize: "0.75rem",
                textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.3")}
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
