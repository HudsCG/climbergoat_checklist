"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { updatePassword, getCurrentUser } from "@/lib/supabase"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is authenticated (came from email link)
    const checkAuth = async () => {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push("/admin")
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await updatePassword(password)

      if (error) {
        setError(error.message)
      } else {
        setMessage("Senha atualizada com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      }
    } catch (err) {
      setError("Erro ao atualizar senha")
    } finally {
      setIsLoading(false)
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

        {message && (
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
            {message}
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

        <form onSubmit={handleSubmit}>
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
            style={{ width: "100%", padding: "1rem" }}
            disabled={isLoading}
          >
            {isLoading ? "Atualizando..." : "Atualizar Senha"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link
            href="/admin"
            style={{
              color: "var(--sage)",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
