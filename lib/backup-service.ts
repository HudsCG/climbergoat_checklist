import { getSupabaseClient, isSupabaseConfigured } from "./supabase"
import { storageService } from "./storage"
import { logger } from "./logger"

export interface BackupData {
  version: string
  timestamp: string
  domain: string
  mode: "supabase" | "localStorage"
  data: {
    users: any[]
    checklistAnswers: any[]
    metadata: {
      totalUsers: number
      totalAnswers: number
      averageScore: number
      lastActivity: string | null
    }
  }
}

class BackupService {
  private readonly BACKUP_VERSION = "1.0.0"
  private readonly DOMAIN = "checklist.climbergoat.com"

  async createBackup(): Promise<BackupData> {
    try {
      logger.info("Starting backup creation")

      const [users, stats] = await Promise.all([storageService.getAllUsers(), storageService.getStats()])

      // Buscar todas as respostas
      const allAnswers = []
      for (const user of users) {
        const userAnswers = await storageService.getChecklistAnswers(user.id)
        allAnswers.push(...userAnswers)
      }

      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        domain: this.DOMAIN,
        mode: isSupabaseConfigured() ? "supabase" : "localStorage",
        data: {
          users,
          checklistAnswers: allAnswers,
          metadata: stats,
        },
      }

      logger.info("Backup created successfully", {
        totalUsers: users.length,
        totalAnswers: allAnswers.length,
        mode: backup.mode,
      })

      return backup
    } catch (error) {
      logger.error("Error creating backup", { error: error.message })
      throw new Error(`Falha ao criar backup: ${error.message}`)
    }
  }

  async createBackupFile(): Promise<{ filename: string; content: string }> {
    const backup = await this.createBackup()
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `climbergoat-checklist-backup-${timestamp}.json`
    const content = JSON.stringify(backup, null, 2)

    return { filename, content }
  }

  async restoreFromBackup(backupData: BackupData): Promise<{ success: boolean; message: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          message: "Restauração automática só está disponível no modo Supabase",
        }
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Cliente Supabase não disponível")
      }

      logger.info("Starting backup restoration", {
        backupVersion: backupData.version,
        backupTimestamp: backupData.timestamp,
        totalUsers: backupData.data.users.length,
        totalAnswers: backupData.data.checklistAnswers.length,
      })

      // Restaurar usuários
      for (const user of backupData.data.users) {
        const { error } = await supabase.from("users").upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          location: user.location,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        })

        if (error) {
          logger.error("Error restoring user", { userId: user.id, error: error.message })
        }
      }

      // Restaurar respostas
      for (const answer of backupData.data.checklistAnswers) {
        const { error } = await supabase.from("checklist_answers").upsert({
          id: answer.id,
          user_id: answer.userId,
          answers: answer.answers,
          total_score: answer.totalScore,
          completed_at: answer.completedAt,
          created_at: answer.createdAt,
          updated_at: answer.updatedAt,
        })

        if (error) {
          logger.error("Error restoring answer", { answerId: answer.id, error: error.message })
        }
      }

      logger.info("Backup restoration completed successfully")

      return {
        success: true,
        message: `Backup restaurado com sucesso! ${backupData.data.users.length} usuários e ${backupData.data.checklistAnswers.length} respostas foram restaurados.`,
      }
    } catch (error) {
      logger.error("Error restoring backup", { error: error.message })
      return {
        success: false,
        message: `Erro ao restaurar backup: ${error.message}`,
      }
    }
  }

  validateBackup(backupData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!backupData.version) errors.push("Versão do backup não encontrada")
    if (!backupData.timestamp) errors.push("Timestamp do backup não encontrado")
    if (!backupData.data) errors.push("Dados do backup não encontrados")
    if (!Array.isArray(backupData.data?.users)) errors.push("Lista de usuários inválida")
    if (!Array.isArray(backupData.data?.checklistAnswers)) errors.push("Lista de respostas inválida")

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export const backupService = new BackupService()
