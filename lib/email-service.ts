import nodemailer from "nodemailer"
import { logger } from "./logger"

interface EmailConfig {
  user: string
  pass: string
}

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType?: string
  }>
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private readonly DOMAIN = "checklist.climbergoat.com"

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const config = this.getEmailConfig()
    if (!config) {
      logger.warn("Email configuration not found, email service disabled")
      return
    }

    this.transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })

    logger.info("Email service initialized successfully")
  }

  private getEmailConfig(): EmailConfig | null {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD

    if (!user || !pass) {
      return null
    }

    return { user, pass }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: "Serviço de email não configurado",
      }
    }

    try {
      const config = this.getEmailConfig()
      if (!config) {
        throw new Error("Configuração de email não encontrada")
      }

      const mailOptions = {
        from: `"Climber Goat Checklist" <${config.user}>`,
        to: options.to,
        subject: `[${this.DOMAIN}] ${options.subject}`,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)

      logger.info("Email sent successfully", {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      logger.error("Error sending email", {
        error: error.message,
        to: options.to,
        subject: options.subject,
      })

      return {
        success: false,
        error: error.message,
      }
    }
  }

  async sendBackupEmail(
    to: string,
    backupContent: string,
    filename: string,
  ): Promise<{ success: boolean; error?: string }> {
    const currentDate = new Date().toLocaleDateString("pt-BR")

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">🔄 Backup Automático - Climber Goat Checklist</h2>
          <p style="color: #7f8c8d; margin: 10px 0 0 0;">Backup gerado em ${currentDate}</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="color: #2c3e50;">📊 Informações do Backup</h3>
          <ul style="color: #495057;">
            <li><strong>Domínio:</strong> ${this.DOMAIN}</li>
            <li><strong>Data/Hora:</strong> ${new Date().toLocaleString("pt-BR")}</li>
            <li><strong>Arquivo:</strong> ${filename}</li>
            <li><strong>Formato:</strong> JSON</li>
          </ul>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d;">
              <strong>✅ Backup realizado com sucesso!</strong><br>
              O arquivo em anexo contém todos os dados dos usuários e diagnósticos.
            </p>
          </div>
          
          <h3 style="color: #2c3e50;">🔒 Segurança</h3>
          <p style="color: #495057;">
            Este backup contém dados sensíveis. Mantenha-o em local seguro e não compartilhe com terceiros.
          </p>

          <p style="color: #495057;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Acessar Painel Administrativo</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
          
          <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
            Este é um email automático do sistema Climber Goat Checklist.<br>
            Para dúvidas, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject: `Backup Automático - ${currentDate}`,
      html: htmlContent,
      attachments: [
        {
          filename,
          content: backupContent,
          contentType: "application/json",
        },
      ],
    })
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: "Serviço de email não configurado",
      }
    }

    try {
      await this.transporter.verify()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

export const emailService = new EmailService()
