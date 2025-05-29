import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin } from "@/lib/auth"
import { withSecurity } from "@/lib/security-middleware"
import { InputValidator } from "@/lib/validators"
import { logger } from "@/lib/logger"

class AdminAuthHandler {
  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const { email, password } = body

      // Validar inputs
      const emailValidation = InputValidator.validateEmail(email || "")
      const passwordValidation = InputValidator.validatePassword(password || "")

      if (!emailValidation.isValid) {
        logger.securityEvent("Invalid email in admin login", {
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

      if (!passwordValidation.isValid) {
        logger.securityEvent("Invalid password in admin login", {
          errors: passwordValidation.errors,
          ip: request.headers.get("x-forwarded-for"),
        })
        return NextResponse.json(
          {
            success: false,
            error: "Senha inválida",
            details: passwordValidation.errors,
          },
          { status: 400 },
        )
      }

      const result = await authenticateAdmin(emailValidation.sanitizedValue, password)

      if (result.success && result.token) {
        // Configurar cookie seguro
        const response = NextResponse.json({ success: true })
        response.cookies.set("admin_token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 24 horas
          path: "/",
        })

        return response
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Falha na autenticação",
        },
        { status: 401 },
      )
    } catch (error) {
      logger.error("Admin auth error", {
        error: error.message,
        stack: error.stack,
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

const authHandler = new AdminAuthHandler()

// Aplicar middleware de segurança com rate limiting
export const POST = withSecurity((request: NextRequest) => authHandler.handle(request), {
  rateLimit: {
    action: "ADMIN_LOGIN",
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  validateInput: true,
  allowedMethods: ["POST"],
})
