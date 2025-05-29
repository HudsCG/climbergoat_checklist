import { type NextRequest, NextResponse } from "next/server"
import { requestPasswordReset } from "@/lib/auth"
import { withSecurity } from "@/lib/security-middleware"
import { InputValidator } from "@/lib/validators"
import { logger } from "@/lib/logger"

class ResetPasswordHandler {
  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const { email } = body

      // Validar email
      const emailValidation = InputValidator.validateEmail(email || "")

      if (!emailValidation.isValid) {
        logger.securityEvent("Invalid email in password reset", {
          errors: emailValidation.errors,
          ip: request.headers.get("x-forwarded-for"),
        })
        return NextResponse.json(
          {
            success: false,
            error: "Email inválido",
            details: emailValidation.errors,
          },
          { status: 400 },
        )
      }

      const result = await requestPasswordReset(emailValidation.sanitizedValue)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erro ao solicitar recuperação de senha",
        },
        { status: 400 },
      )
    } catch (error) {
      logger.error("Password reset error", {
        error: error.message,
        ip: request.headers.get("x-forwarded-for"),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Erro interno do servidor",
        },
        { status: 500 },
      )
    }
  }
}

const resetHandler = new ResetPasswordHandler()

export const POST = withSecurity((request: NextRequest) => resetHandler.handle(request), {
  rateLimit: {
    action: "PASSWORD_RESET",
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  validateInput: true,
  allowedMethods: ["POST"],
})
