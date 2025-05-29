import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "./rate-limit"
import { logger } from "./logger"
import { InputValidator } from "./validators"

// Clean Code: Interfaces bem definidas
interface SecurityConfig {
  rateLimit?: {
    action: "ADMIN_LOGIN" | "PASSWORD_RESET" | "USER_SUBMIT" | "API_GENERAL"
    maxAttempts?: number
    windowMs?: number
  }
  validateInput?: boolean
  requireAuth?: boolean
  allowedMethods?: string[]
}

interface SecurityContext {
  clientIp: string
  userAgent: string
  method: string
  path: string
}

// Design Pattern: Decorator Pattern para middleware
export function withSecurity(handler: (request: NextRequest) => Promise<NextResponse>, config: SecurityConfig = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()

    try {
      // Extrair contexto de segurança
      const context = extractSecurityContext(request)

      // Log da requisição
      logger.info("API Request", {
        method: context.method,
        path: context.path,
        ip: context.clientIp,
        userAgent: context.userAgent,
      })

      // Validar método HTTP
      if (config.allowedMethods && !config.allowedMethods.includes(context.method)) {
        logger.securityEvent("Method not allowed", context)
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
      }

      // Rate limiting
      if (config.rateLimit) {
        const isAllowed = rateLimit.check(context.clientIp, config.rateLimit.action)
        if (!isAllowed) {
          const status = rateLimit.getStatus(context.clientIp, config.rateLimit.action)
          logger.securityEvent("Rate limit exceeded", { ...context, status })

          return NextResponse.json(
            {
              error: "Muitas tentativas. Tente novamente mais tarde.",
              retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000),
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": config.rateLimit.maxAttempts?.toString() || "unknown",
                "X-RateLimit-Remaining": status.remaining.toString(),
                "X-RateLimit-Reset": status.resetTime.toString(),
              },
            },
          )
        }
      }

      // Validação de input (se habilitada)
      if (config.validateInput && (context.method === "POST" || context.method === "PUT")) {
        const validationResult = await validateRequestBody(request)
        if (!validationResult.isValid) {
          logger.securityEvent("Invalid input detected", { ...context, errors: validationResult.errors })
          return NextResponse.json(
            {
              error: "Dados inválidos",
              details: validationResult.errors,
            },
            { status: 400 },
          )
        }
      }

      // Executar handler principal
      const response = await handler(request)

      // Log de sucesso
      const duration = Date.now() - startTime
      logger.performance("API Request", duration, {
        method: context.method,
        path: context.path,
        status: response.status,
      })

      // Adicionar headers de segurança
      addSecurityHeaders(response)

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error("API Error", {
        error: error.message,
        duration,
        method: request.method,
        path: request.nextUrl.pathname,
      })

      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }
  }
}

// Clean Code: Funções auxiliares com responsabilidades específicas
function extractSecurityContext(request: NextRequest): SecurityContext {
  return {
    clientIp:
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    method: request.method,
    path: request.nextUrl.pathname,
  }
}

async function validateRequestBody(request: NextRequest): Promise<{ isValid: boolean; errors?: any }> {
  try {
    const body = await request.clone().json()

    // Validações básicas de segurança
    if (typeof body !== "object" || body === null) {
      return { isValid: false, errors: ["Body deve ser um objeto JSON válido"] }
    }

    // Verificar se há tentativas de injection
    const bodyString = JSON.stringify(body)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /function\s*\(/i,
      /setTimeout/i,
      /setInterval/i,
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyString)) {
        return { isValid: false, errors: ["Conteúdo suspeito detectado"] }
      }
    }

    // Sanitizar strings no body
    sanitizeObject(body)

    return { isValid: true }
  } catch (error) {
    return { isValid: false, errors: ["JSON inválido"] }
  }
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = InputValidator.sanitizeInput(obj[key])
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key])
    }
  }
}

function addSecurityHeaders(response: NextResponse): void {
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

  // CORS headers (se necessário)
  if (process.env.NODE_ENV === "development") {
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }
}

// Pragmatic Programmer: Utilitário para extrair IP real
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || request.ip || "unknown"
  )
}
