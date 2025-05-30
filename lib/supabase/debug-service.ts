import { supabase } from "./client"

export class SupabaseDebugService {
  async testPermissions() {
    console.log("🔍 Testando permissões do Supabase...")

    try {
      // Testar leitura de usuários
      const { data: users, error: readError } = await supabase.from("users").select("id, name, email").limit(1)

      if (readError) {
        console.error("❌ Erro ao ler usuários:", readError)
        return { canRead: false, canWrite: false, canDelete: false, error: readError }
      }

      console.log("✅ Leitura de usuários: OK")

      // Testar criação (inserção)
      const testUser = {
        name: "Teste Delete",
        email: `teste-delete-${Date.now()}@test.com`,
        whatsapp: "11999999999",
      }

      const { data: newUser, error: createError } = await supabase.from("users").insert([testUser]).select().single()

      if (createError) {
        console.error("❌ Erro ao criar usuário de teste:", createError)
        return { canRead: true, canWrite: false, canDelete: false, error: createError }
      }

      console.log("✅ Criação de usuário: OK", newUser)

      // Testar exclusão
      const { error: deleteError } = await supabase.from("users").delete().eq("id", newUser.id)

      if (deleteError) {
        console.error("❌ Erro ao excluir usuário de teste:", deleteError)
        return { canRead: true, canWrite: true, canDelete: false, error: deleteError }
      }

      console.log("✅ Exclusão de usuário: OK")

      return { canRead: true, canWrite: true, canDelete: true, error: null }
    } catch (error) {
      console.error("❌ Erro geral no teste de permissões:", error)
      return { canRead: false, canWrite: false, canDelete: false, error }
    }
  }

  async checkRLS() {
    console.log("🔍 Verificando RLS (Row Level Security)...")

    try {
      // Verificar se RLS está habilitado
      const { data, error } = await supabase.rpc("check_rls_status")

      if (error) {
        console.log("⚠️ Não foi possível verificar RLS automaticamente")
        return null
      }

      return data
    } catch (error) {
      console.log("⚠️ Função RLS não disponível")
      return null
    }
  }
}
