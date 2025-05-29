"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { confirmPasswordReset } from "@/lib/auth"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar se há token de reset na URL
    const token = searchParams.get("token")
    if (!token) {
      setError("Token de recuperação não encontrado. Solicite um novo link de recuperação.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsProcessing(false)
      return
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsProcessing(false)
      return
    }

    try {
      const result = await confirmPasswordReset(newPassword)

      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          window.location.href = "/admin"
        }, 3000)
      } else {
        setError(result.error || "Erro ao redefinir senha")
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      setError("Erro ao redefinir senha. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)" }}>Redefinir Senha</h1>
          <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Digite sua nova senha</p>
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
            }}
          >
            {success}
            <br />
            <small>Redirecionando para o login...</small>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="form-input"
                required
                disabled={isProcessing}
                minLength={6}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="form-input"
                required
                disabled={isProcessing}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "1rem", marginBottom: "1rem" }}
              disabled={isProcessing}
            >
              {isProcessing ? "Atualizando..." : "Atualizar Senha"}
            </button>

            <Link
              href="/admin"
              style={{
                display: "block",
                textAlign: "center",
                color: "var(--warm-gray)",
                fontSize: "0.9rem",
                textDecoration: "underline",
              }}
            >
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
