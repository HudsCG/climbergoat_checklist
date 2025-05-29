"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SupabaseAdminService } from "@/lib/supabase/admin-service"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const adminService = new SupabaseAdminService()

  useEffect(() => {
    // Check if we have the necessary tokens from the URL
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (!accessToken || !refreshToken) {
      setError("Link de recuperação inválido ou expirado")
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsSubmitting(true)

    try {
      await adminService.updatePassword(password)
      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar senha")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
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
        <div className="card" style={{ maxWidth: "400px", width: "100%", margin: "0 1rem", textAlign: "center" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>
              Senha atualizada!
            </h1>
            <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Redirecionando para o painel...</p>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)" }}>Nova Senha</h1>
          <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Digite sua nova senha</p>
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

        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Nova senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              className="form-input"
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Confirmar senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              className="form-input"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "1rem", marginBottom: "1rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Atualizando..." : "Atualizar senha"}
          </button>

          <div style={{ textAlign: "center" }}>
            <Link
              href="/admin"
              style={{
                color: "var(--sage)",
                fontSize: "0.875rem",
                textDecoration: "underline",
              }}
            >
              Voltar ao login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
