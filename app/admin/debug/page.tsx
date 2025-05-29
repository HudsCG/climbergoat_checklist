"use client"

import { useState } from "react"
import { SupabaseAdminService } from "@/lib/supabase/admin-service"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const adminService = new SupabaseAdminService()

  const addResult = (test: string, result: any) => {
    setResults((prev) => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const runTests = async () => {
    setIsLoading(true)
    setResults([])

    // Test 1: Environment Variables
    addResult("Environment Variables", {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Missing",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing",
    })

    // Test 2: Basic Connection
    try {
      const connectionTest = await adminService.testConnection()
      addResult("Database Connection", connectionTest)
    } catch (error) {
      addResult("Database Connection", {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 3: Check Tables
    try {
      const { data: tables, error } = await supabase.rpc("get_table_names")
      addResult("Tables Check", { success: !error, tables: tables || [], error })
    } catch (error) {
      addResult("Tables Check", { success: false, error: error instanceof Error ? error.message : "Unknown error" })
    }

    // Test 4: Check Admin Users Table
    try {
      const { data, error } = await supabase.from("admin_users").select("*").limit(5)
      addResult("Admin Users Table", { success: !error, count: data?.length || 0, data, error })
    } catch (error) {
      addResult("Admin Users Table", {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 5: Auth Status
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      addResult("Auth Session", { hasSession: !!session, session })
    } catch (error) {
      addResult("Auth Session", { success: false, error: error instanceof Error ? error.message : "Unknown error" })
    }

    setIsLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <Link href="/admin" style={{ textDecoration: "none", color: "var(--sage)" }}>
            ← Voltar para Admin
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: "600", color: "var(--dark)", margin: "1rem 0" }}>
            Debug Supabase
          </h1>
        </div>

        <div className="card" style={{ marginBottom: "2rem" }}>
          <button
            onClick={runTests}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "1rem" }}
          >
            {isLoading ? "Executando testes..." : "Executar Testes de Diagnóstico"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--dark)" }}>Resultados</h2>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  background: result.result.success === false ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${result.result.success === false ? "#fecaca" : "#bbf7d0"}`,
                  borderRadius: "0.5rem",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>{result.test}</h3>
                <pre style={{ fontSize: "0.875rem", overflow: "auto", margin: 0 }}>
                  {JSON.stringify(result.result, null, 2)}
                </pre>
                <small style={{ color: "var(--warm-gray)", fontSize: "0.75rem" }}>
                  {new Date(result.timestamp).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
