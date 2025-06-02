"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { signInWithEmail, signOut, resetPassword, getCurrentUser } from "@/lib/supabase"
import Link from "next/link"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState("")
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { user } = await getCurrentUser()
      if (user) {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSigningIn(true)

    try {
      const { data, error } = await signInWithEmail(email, password)

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setIsAuthenticated(true)
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setIsAuthenticated(false)
      setEmail("")
      setPassword("")
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Digite seu email para recuperar a senha")
      return
    }

    try {
      const { error } = await resetPassword(email)

      if (error) {
        setError(error.message)
      } else {
        setResetEmailSent(true)
        setShowResetForm(false)
      }
    } catch (err) {
      setError("Erro ao enviar email de recuperação")
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)" }}>Painel Administrativo</h1>
            <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
              {showResetForm ? "Recuperar senha" : "Faça login para acessar o dashboard"}
            </p>
          </div>

          {resetEmailSent && (
            <div
              style={{
                background: "#d1fae5",
                border: "1px solid #a7f3d0",
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1rem",
                color: "#065f46",
                fontSize: "0.875rem",
              }}
            >
              Email de recuperação enviado! Verifique sua caixa de entrada.
            </div>
          )}

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
              }}
            >
              {error}
            </div>
          )}

          {showResetForm ? (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                Enviar email de recuperação
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--sage)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          ) : (
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
                style={{ width: "100%", padding: "1rem" }}
                disabled={isSigningIn}
              >
                {isSigningIn ? "Entrando..." : "Entrar"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--sage)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Esqueci minha senha
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
