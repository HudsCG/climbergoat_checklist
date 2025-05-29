"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import Link from "next/link"

type ViewMode = "login" | "forgot-password"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("login")

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/verify")
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setEmail("")
        setPassword("")
      } else {
        setError(data.error || "Falha na autenticação")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
      } else {
        setError(data.error || "Erro ao solicitar recuperação")
      }
    } catch (error) {
      console.error("Erro na recuperação:", error)
      setError("Erro ao solicitar recuperação. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      setIsAuthenticated(false)
      setEmail("")
      setPassword("")
      setError(null)
      setViewMode("login")
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)" }}>
              {viewMode === "login" && "Painel Administrativo"}
              {viewMode === "forgot-password" && "Recuperar Senha"}
            </h1>
            <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
              {viewMode === "login" && "Digite suas credenciais para acessar o dashboard"}
              {viewMode === "forgot-password" && "Digite seu email para receber instruções de recuperação"}
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                whiteSpace: "pre-line",
              }}
            >
              {success}
            </div>
          )}

          {/* Formulário de Login */}
          {viewMode === "login" && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="form-input"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="form-input"
                  required
                  disabled={isProcessing}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", marginBottom: "1rem" }}
                disabled={isProcessing}
              >
                {isProcessing ? "Entrando..." : "Entrar"}
              </button>

              <button
                type="button"
                onClick={() => setViewMode("forgot-password")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--warm-gray)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Esqueceu sua senha?
              </button>
            </form>
          )}

          {/* Formulário de Esqueceu Senha */}
          {viewMode === "forgot-password" && (
            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="form-input"
                  required
                  disabled={isProcessing}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", marginBottom: "1rem" }}
                disabled={isProcessing}
              >
                {isProcessing ? "Enviando..." : "Enviar Email"}
              </button>

              <button
                type="button"
                onClick={() => setViewMode("login")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--warm-gray)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Voltar ao login
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
