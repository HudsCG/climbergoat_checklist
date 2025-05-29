"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, MapPin, Star, Navigation, AlertCircle } from "lucide-react"
import { saveUserData } from "@/lib/storage"
import Link from "next/link"

interface FormData {
  name: string
  email: string
  whatsapp: string
  location?: {
    latitude?: number
    longitude?: number
    city?: string
    state?: string
    country?: string
    timezone?: string
    ip?: string
    source: "gps" | "ip" | "manual"
  }
}

interface LocationData {
  latitude?: number
  longitude?: string
  city?: string
  state?: string
  country?: string
  timezone?: string
  ip?: string
  source: "gps" | "ip" | "manual"
}

export function LandingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    whatsapp: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"none" | "getting" | "success" | "error">("none")
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Verificar se já existe um userId no localStorage ao carregar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_id")
      if (storedUserId) {
        setUserId(storedUserId)
      }
    }
  }, [])

  // Função para obter localização por IP (automática)
  const getLocationByIP = async (): Promise<LocationData | null> => {
    const services = [
      {
        name: "ipapi.co",
        url: "https://ipapi.co/json/",
        parser: (data: any) => ({
          city: data.city,
          state: data.region,
          country: data.country_name,
          timezone: data.timezone,
          ip: data.ip,
          latitude: data.latitude,
          longitude: data.longitude,
          source: "ip" as const,
        }),
      },
      {
        name: "ipinfo.io",
        url: "https://ipinfo.io/json",
        parser: (data: any) => {
          const [lat, lng] = data.loc ? data.loc.split(",").map(Number) : [null, null]
          return {
            city: data.city,
            state: data.region,
            country: data.country,
            timezone: data.timezone,
            ip: data.ip,
            latitude: lat,
            longitude: lng,
            source: "ip" as const,
          }
        },
      },
      {
        name: "ip-api.com",
        url: "http://ip-api.com/json/",
        parser: (data: any) => ({
          city: data.city,
          state: data.regionName,
          country: data.country,
          timezone: data.timezone,
          ip: data.query,
          latitude: data.lat,
          longitude: data.lon,
          source: "ip" as const,
        }),
      },
    ]

    for (const service of services) {
      try {
        console.log(`Tentando obter localização via ${service.name}...`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          const location = service.parser(data)

          if (location.city || location.state) {
            console.log(`Localização obtida via ${service.name}:`, location)
            return location
          }
        }
      } catch (error) {
        console.log(`Erro com ${service.name}:`, error)
        continue // Tenta o próximo serviço
      }
    }

    console.log("Todos os serviços de IP falharam")
    return null
  }

  // Função para obter localização GPS (com aprovação)
  const getLocationByGPS = async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("Geolocalização não suportada pelo navegador")
        resolve(null)
        return
      }

      const options = {
        enableHighAccuracy: false, // Mudado para false para ser mais rápido
        timeout: 15000, // Aumentado para 15 segundos
        maximumAge: 600000, // 10 minutos - aceita cache mais antigo
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Reverse geocoding com timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)

            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`,
              {
                signal: controller.signal,
                headers: {
                  Accept: "application/json",
                },
              },
            )

            clearTimeout(timeoutId)

            if (response.ok) {
              const data = await response.json()
              resolve({
                latitude,
                longitude,
                city: data.city || data.locality,
                state: data.principalSubdivision,
                country: data.countryName,
                source: "gps",
              })
            } else {
              // Retorna só as coordenadas se reverse geocoding falhar
              resolve({ latitude, longitude, source: "gps" })
            }
          } catch (error) {
            console.log("Reverse geocoding falhou, usando apenas coordenadas:", error)
            // Ainda retorna as coordenadas mesmo se reverse geocoding falhar
            resolve({ latitude, longitude, source: "gps" })
          }
        },
        (error) => {
          console.log("Erro na geolocalização:", error.message)

          // Log mais detalhado do erro
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("Usuário negou a solicitação de geolocalização")
              break
            case error.POSITION_UNAVAILABLE:
              console.log("Informações de localização não disponíveis")
              break
            case error.TIMEOUT:
              console.log("Timeout na solicitação de geolocalização")
              break
            default:
              console.log("Erro desconhecido na geolocalização")
              break
          }

          resolve(null)
        },
        options,
      )
    })
  }

  // Tentar obter localização automaticamente quando a página carrega
  useEffect(() => {
    const attemptAutoLocation = async () => {
      if (autoLocationAttempted) return

      setAutoLocationAttempted(true)
      setLocationStatus("getting")

      try {
        console.log("Iniciando detecção automática de localização...")

        // Primeiro tenta por IP (automático)
        const ipLocation = await getLocationByIP()

        if (ipLocation) {
          console.log("Localização por IP obtida:", ipLocation)
          setFormData((prev) => ({ ...prev, location: ipLocation }))
          setLocationStatus("success")
          return
        }

        console.log("Localização por IP falhou, tentando GPS silencioso...")

        // Se falhar, tenta GPS silenciosamente apenas se já autorizado
        if (navigator.permissions) {
          try {
            const permission = await navigator.permissions.query({ name: "geolocation" })

            if (permission.state === "granted") {
              console.log("Permissão GPS já concedida, obtendo localização...")
              const gpsLocation = await getLocationByGPS()
              if (gpsLocation) {
                console.log("Localização GPS obtida:", gpsLocation)
                setFormData((prev) => ({ ...prev, location: gpsLocation }))
                setLocationStatus("success")
                return
              }
            } else {
              console.log("Permissão GPS não concedida:", permission.state)
            }
          } catch (permissionError) {
            console.log("Erro ao verificar permissões:", permissionError)
          }
        }

        console.log("Nenhuma localização automática disponível")
        setLocationStatus("none")
      } catch (error) {
        console.error("Erro na localização automática:", error)
        setLocationStatus("none")
      }
    }

    // Delay pequeno para não impactar o carregamento da página
    const timeoutId = setTimeout(attemptAutoLocation, 1000)

    return () => clearTimeout(timeoutId)
  }, [autoLocationAttempted])

  // Handler para capturar localização GPS manualmente
  const handleGetGPSLocation = async () => {
    setIsGettingLocation(true)
    setLocationStatus("getting")

    try {
      console.log("Solicitando localização GPS manualmente...")
      const gpsLocation = await getLocationByGPS()

      if (gpsLocation) {
        console.log("Localização GPS manual obtida:", gpsLocation)
        setFormData((prev) => ({ ...prev, location: gpsLocation }))
        setLocationStatus("success")
      } else {
        console.log("Falha ao obter localização GPS manual")
        setLocationStatus("error")
      }
    } catch (error) {
      console.error("Erro ao capturar localização GPS manual:", error)
      setLocationStatus("error")
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Função para enviar email via EmailJS
  const sendEmailNotification = async (data: FormData) => {
    try {
      // Preparar dados para o EmailJS
      const emailData = {
        to_email: "contatoclimbergoat@gmail.com",
        from_name: data.name,
        from_email: data.email,
        whatsapp: data.whatsapp,
        location: data.location
          ? `${data.location.city || ""}, ${data.location.state || ""} (${data.location.source})`
          : "Não detectada",
        coordinates:
          data.location?.latitude && data.location?.longitude
            ? `${data.location.latitude}, ${data.location.longitude}`
            : "Não disponível",
        timestamp: new Date().toLocaleString("pt-BR"),
        subject: `Novo Lead - ${data.name}`,
      }

      // Enviar via fetch para EmailJS
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: "service_g50ko5k", // Sua Service ID
          template_id: "template_vhdyssy", // Sua Template ID
          user_id: "Qofon-InGdFR7UFoe", // Sua User ID
          template_params: emailData,
        }),
      })

      if (response.ok) {
        console.log("Email enviado com sucesso via EmailJS!")
        return true
      } else {
        console.log("Erro no envio via EmailJS")
        return false
      }
    } catch (error) {
      console.error("Erro no EmailJS:", error)
      return false
    }
  }

  // Efeito para redirecionar quando o formulário for enviado e o userId estiver definido
  useEffect(() => {
    if (formSubmitted && userId) {
      console.log("Redirecionando para /checklist com userId:", userId)

      // Garantir que o userId está no localStorage antes de redirecionar
      if (typeof window !== "undefined") {
        localStorage.setItem("user_id", userId)
      }

      // Pequeno delay para garantir que o localStorage foi atualizado
      const redirectTimeout = setTimeout(() => {
        router.push("/checklist")
      }, 1500)

      return () => clearTimeout(redirectTimeout)
    }
  }, [formSubmitted, userId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validação básica
      if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Por favor, insira um email válido.")
      }

      console.log("Iniciando salvamento dos dados do usuário...")

      // Salvar dados do usuário (com fallback automático)
      const newUserId = await saveUserData({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        whatsapp: formData.whatsapp.trim(),
        location: formData.location
          ? {
              city: formData.location.city,
              state: formData.location.state,
              country: formData.location.country,
            }
          : undefined,
      })

      console.log("Dados salvos com sucesso, userId:", newUserId)

      // Salvar o ID do usuário no estado e no localStorage
      setUserId(newUserId)
      if (typeof window !== "undefined") {
        localStorage.setItem("user_id", newUserId)
      }

      // Tentar enviar email (não bloqueia se falhar)
      try {
        await sendEmailNotification(formData)
        console.log("Email enviado com sucesso")
      } catch (emailError) {
        console.log("Email falhou, mas continuando:", emailError)
      }

      // Marcar como enviado - o redirecionamento acontecerá pelo useEffect
      setFormSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error("Erro no envio do formulário:", error)
      setSubmitError(error.message || "Erro ao salvar dados. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToForm = () => {
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth" })
  }

  const getLocationDisplay = () => {
    if (!formData.location) return null

    const { city, state, source } = formData.location
    const locationText = city && state ? `${city}, ${state}` : city || state || "Localização detectada"

    const sourceIcon = source === "gps" ? "📍" : source === "ip" ? "🌐" : "📍"
    const sourceText = source === "gps" ? "GPS" : source === "ip" ? "Automática" : "Manual"

    return (
      <div
        style={{
          background: "rgba(109, 142, 117, 0.1)",
          border: "1px solid var(--sage)",
          borderRadius: "0.5rem",
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>{sourceIcon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "500", color: "var(--dark)", fontSize: "0.9rem" }}>{locationText}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--sage)" }}>Detectado via {sourceText}</div>
        </div>
        {source === "ip" && (
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isGettingLocation}
            style={{
              background: "var(--sage)",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.75rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <Navigation size={12} />
            Melhorar
          </button>
        )}
      </div>
    )
  }

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
            {formSubmitted ? (
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
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sage mx-auto mt-4"></div>
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
                  {/* Mostrar erro se houver */}
                  {submitError && (
                    <div
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid #ef4444",
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <AlertCircle size={16} color="#ef4444" />
                      <span style={{ color: "#ef4444", fontSize: "0.875rem" }}>{submitError}</span>
                    </div>
                  )}

                  {/* Mostrar localização detectada automaticamente */}
                  {getLocationDisplay()}

                  <div className="mb-3">
                    <label className="form-label">Nome completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="form-input"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">E-mail</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="form-input"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="form-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                        Enviando...
                      </>
                    ) : (
                      "Iniciar diagnóstico"
                    )}
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
