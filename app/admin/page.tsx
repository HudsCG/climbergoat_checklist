"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { SupabaseAdminService } from "@/lib/supabase/admin-service"
import Link from "next/link"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")
  const [initError, setInitError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setInitError("Supabase não configurado. Verifique as variáveis de ambiente.")
      setIsLoading(false)
      return
    }

    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const adminService = new SupabaseAdminService()
      const currentUser = await adminService.getCurrentUser()
      if (currentUser) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Erro ao verificar autenticação")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const adminService = new SupabaseAdminService()
      await adminService.signIn(email, password)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      const adminService = new SupabaseAdminService()
      await adminService.signOut()
      setIsAuthenticated(false)
      setEmail("")
      setPassword("")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setResetMessage("")

    try {
      const adminService = new SupabaseAdminService()
      await adminService.resetPassword(resetEmail)
      setResetMessage("Email de recuperação enviado! Verifique sua caixa de entrada.")
      setShowResetPassword(false)
      setResetEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (initError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ maxWidth: "400px", textAlign: "center" }}>
          <h1 style={{ color: "#dc2626", marginBottom: "1rem" }}>Erro de Configuração</h1>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>{initError}</p>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            <p>Verifique se as seguintes variáveis estão configuradas:</p>
            <ul style={{ textAlign: "left", marginTop: "0.5rem" }}>
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="card" style={{ maxWidth: "400px", width: "100%", margin: "0 1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
              <img
                src="/images/climber-goat-logo.png"
                alt="Climber Goat"
                style={{ height: "3rem", margin: "0 auto 1rem", cursor: "pointer" }}
              />
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)" }}>Painel Administrativo</h1>
            <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
              {showResetPassword ? "Recuperar senha" : "Entre com suas credenciais"}
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1rem",
                color: "#dc2626",
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {resetMessage && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1rem",
                color: "#166534",
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              {resetMessage}
            </div>
          )}

          {!showResetPassword ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@climbergoat.com"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", marginBottom: "1rem" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--sage)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Esqueci minha senha
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Email para recuperação</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", marginBottom: "1rem" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar email de recuperação"}
              </button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false)
                    setError("")
                    setResetMessage("")
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--sage)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
