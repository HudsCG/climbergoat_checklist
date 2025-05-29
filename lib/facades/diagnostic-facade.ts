import type { UserEntity, ChecklistAnswers, MaturityLevel, CreateUserData } from "../types"
import { Logger } from "../utils/logger"
import type { IUserService } from "../services/user-service"
import type { IChecklistService } from "../services/checklist-service"
import type { IScoreCalculator } from "../services/score-calculator"
import type { IRecommendationEngine } from "../services/recommendation-engine"

// Facade Pattern para simplificar operações complexas
export interface DiagnosticResult {
  user: UserEntity
  answers: ChecklistAnswers
  score: number
  maturityLevel: MaturityLevel
  recommendations: string[]
  strengths: CategoryScore[]
  weaknesses: CategoryScore[]
}

export interface CategoryScore {
  categoryId: string
  title: string
  score: number
}

export class DiagnosticFacade {
  private readonly logger = Logger.getInstance()

  constructor(
    private readonly userService: IUserService,
    private readonly checklistService: IChecklistService,
    private readonly scoreCalculator: IScoreCalculator,
    private readonly recommendationEngine: IRecommendationEngine,
  ) {}

  async createDiagnostic(userData: CreateUserData): Promise<string> {
    try {
      this.logger.info("Starting diagnostic creation", { userEmail: userData.email })

      // Criar usuário
      const user = await this.userService.createUser(userData)

      // Inicializar checklist vazio
      await this.checklistService.initializeChecklist(user.id)

      this.logger.info("Diagnostic created successfully", { userId: user.id })
      return user.id
    } catch (error) {
      this.logger.error("Failed to create diagnostic", error as Error, userData)
      throw new Error("Failed to create diagnostic")
    }
  }

  async updateAnswer(userId: string, questionId: string, answer: boolean): Promise<void> {
    try {
      await this.checklistService.updateAnswer(userId, questionId, answer)
      this.logger.debug("Answer updated", { userId, questionId, answer })
    } catch (error) {
      this.logger.error("Failed to update answer", error as Error, { userId, questionId })
      throw new Error("Failed to update answer")
    }
  }

  async generateResults(userId: string): Promise<DiagnosticResult> {
    try {
      this.logger.info("Generating diagnostic results", { userId })

      // Buscar dados do usuário e respostas
      const [user, answers] = await Promise.all([
        this.userService.getUserById(userId),
        this.checklistService.getAnswers(userId),
      ])

      if (!user) {
        throw new Error("User not found")
      }

      if (!answers) {
        throw new Error("No answers found for user")
      }

      // Calcular scores
      const score = this.scoreCalculator.calculateTotalScore(answers.answers)
      const categoryScores = this.scoreCalculator.calculateCategoryScores(answers.answers)
      const maturityLevel = this.scoreCalculator.getMaturityLevel(score)

      // Gerar recomendações
      const recommendations = this.recommendationEngine.generateRecommendations(answers.answers, categoryScores)

      // Identificar pontos fortes e fracos
      const sortedCategories = categoryScores.sort((a, b) => b.score - a.score)
      const strengths = sortedCategories.slice(0, 3).filter((cat) => cat.score >= 70)
      const weaknesses = sortedCategories.slice(-3).filter((cat) => cat.score < 50)

      const result: DiagnosticResult = {
        user,
        answers,
        score,
        maturityLevel,
        recommendations,
        strengths,
        weaknesses,
      }

      this.logger.info("Diagnostic results generated", {
        userId,
        score,
        maturityLevel: maturityLevel.name,
      })

      return result
    } catch (error) {
      this.logger.error("Failed to generate results", error as Error, { userId })
      throw new Error("Failed to generate diagnostic results")
    }
  }

  async exportResults(userId: string, format: "pdf" | "csv"): Promise<string> {
    try {
      const results = await this.generateResults(userId)

      let exportUrl: string

      if (format === "pdf") {
        exportUrl = await this.generatePDF(results)
      } else {
        exportUrl = await this.generateCSV(results)
      }

      this.logger.info("Results exported", { userId, format })
      return exportUrl
    } catch (error) {
      this.logger.error("Failed to export results", error as Error, { userId, format })
      throw new Error("Failed to export results")
    }
  }

  private async generatePDF(results: DiagnosticResult): Promise<string> {
    // Implementação da geração de PDF
    // Retorna URL do arquivo gerado
    return "pdf-url"
  }

  private async generateCSV(results: DiagnosticResult): Promise<string> {
    // Implementação da geração de CSV
    // Retorna URL do arquivo gerado
    return "csv-url"
  }
}
