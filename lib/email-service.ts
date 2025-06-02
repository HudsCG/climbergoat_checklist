// Clean Code: Service dedicado para email
import type { UserData } from "./types"
import { AppError, ErrorHandler } from "./error-handler"

export interface EmailService {
  sendNotification(userData: UserData): Promise<boolean>
}

export class EmailJSService implements EmailService {
  private readonly serviceId = "service_g50ko5k"
  private readonly templateId = "template_vhdyssy"
  private readonly userId = "Qofon-InGdFR7UFoe"
  private readonly apiUrl = "https://api.emailjs.com/api/v1.0/email/send"

  async sendNotification(userData: UserData): Promise<boolean> {
    try {
      // Pragmatic Programmer: Input validation
      if (!userData.name || !userData.email || !userData.whatsapp) {
        throw new AppError("Dados incompletos para envio de email", "INVALID_DATA")
      }

      // TEMPORARIAMENTE DESABILITADO - EmailJS
      console.log("📧 Email temporariamente desabilitado. Dados que seriam enviados:", {
        to_email: "contatoclimbergoat@gmail.com",
        from_name: userData.name,
        from_email: userData.email,
        whatsapp: userData.whatsapp,
        timestamp: new Date().toLocaleString("pt-BR"),
        subject: `Novo Lead - ${userData.name}`,
      })

      // Simular sucesso sem enviar email
      return true

      /* CÓDIGO ORIGINAL COMENTADO:
      const emailData = {
        to_email: "contatoclimbergoat@gmail.com",
        from_name: userData.name,
        from_email: userData.email,
        whatsapp: userData.whatsapp,
        timestamp: new Date().toLocaleString("pt-BR"),
        subject: `Novo Lead - ${userData.name}`,
      }

      // Pragmatic Programmer: Timeout para evitar hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: this.templateId,
          user_id: this.userId,
          template_params: emailData,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new AppError(`Email service error: ${response.status}`, "EMAIL_SERVICE_ERROR")
      }

      return true
      */
    } catch (error) {
      ErrorHandler.logError(error, "EmailJSService.sendNotification")

      // Pragmatic Programmer: Graceful degradation
      if (error instanceof AppError) {
        throw error
      }

      return false
    }
  }
}

// Design Patterns: Factory Pattern
export class EmailServiceFactory {
  static create(): EmailService {
    return new EmailJSService()
  }
}
