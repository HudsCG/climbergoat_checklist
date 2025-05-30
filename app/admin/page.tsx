"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import Link from "next/link"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se já está autenticado
    const authStatus = sessionStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Senha simples para demonstração - em produção usar autenticação real
    if (password === "climbergoat2024") {
      setIsAuthenticated(true)
      sessionStorage.setItem("admin_authenticated", "true")
    } else {
      alert("Senha incorreta")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("admin_authenticated")
    setPassword("")
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
            <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Digite a senha para acessar o dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Senha de acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
