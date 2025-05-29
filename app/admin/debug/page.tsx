"use client"

import { useState } from "react"
import { SupabaseAdminService } from "@/lib/supabase/admin-service"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseInfo, setSupabaseInfo] = useState<{
    url?: string
    key?: string
    initialized: boolean
  }>({
    initialized: false,
  })

  const adminService = new SupabaseAdminService()

  const addResult = (test: string, result: any) => {
    setResults((prev) => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const runTests = async () => {
    setIsLoading(true)
    setResults([])

    // Test 0: Check Supabase Initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setSupabaseInfo({
      url: supabaseUrl,
      key: supabaseKey ? "✅ Present" : "❌ Missing",
      initialized: !!supabase,
    })

    // Test 1: Environment Variables
    addResult("Environment Variables", {
      supabaseUrl: supabaseUrl || "❌ Missing",
      supabaseKey: supabaseKey ? "✅ Present" : "❌ Missing",
      supabaseInitialized: !!supabase,
    })

    if (!supabase) {
      addResult("Supabase Client", {
        success: false,
        message: "Supabase client não foi inicializado. Verifique as variáveis de ambiente.",
      })
      setIsLoading(false)
      return
    }

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

      if (error && error.message.includes("function get_table_names() does not exist")) {
        // Fallback para listar tabelas de outra forma
        const { data: schemaData, error: schemaError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")

        addResult("Tables Check", {
          success: !schemaError,
          tables: schemaData?.map((t) => t.table_name) || [],
          error: schemaError,
        })
      } else {
        addResult("Tables Check", { success: !error, tables: tables || [], error })
      }
    } catch (error) {
      addResult("Tables Check", { success: false, error: error instanceof Error ? error.message : "Unknown error" })
    }

    // Test 4: Check Admin Users Table
    try {
      const { data, error } = await supabase.from("admin_users").select("*").limit(5)
      addResult("Admin Users Table", {
        success: !error,
        count: data?.length || 0,
        exists: !error && data !== null,
        error,
      })
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
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>Status do Supabase</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <strong>URL:</strong> {supabaseInfo.url || "Não detectada"}
              </div>
              <div>
                <strong>API Key:</strong> {supabaseInfo.key || "Não detectada"}
              </div>
              <div>
                <strong>Cliente inicializado:</strong> {supabaseInfo.initialized ? "✅ Sim" : "❌ Não"}
              </div>
            </div>
          </div>

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

        <div className="card" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Solução de Problemas</h2>

          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              1. Verificar Variáveis de Ambiente
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--warm-gray)" }}>
              Certifique-se de que as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão
              configuradas corretamente no Vercel.
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>2. Verificar Tabelas</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--warm-gray)" }}>
              Certifique-se de que a tabela admin_users existe e contém pelo menos um registro com seu email.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>3. Verificar Autenticação</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--warm-gray)" }}>
              Certifique-se de que você criou um usuário no Authentication do Supabase com o mesmo email que está na
              tabela admin_users.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
