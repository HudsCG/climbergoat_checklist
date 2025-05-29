// Design Pattern: Singleton para gerenciar rate limiting
class RateLimiter {
  private static instance: RateLimiter
  private attempts: Map<string, { count: number; resetTime: number; blockedUntil?: number }>

  private constructor() {
    this.attempts = new Map()
    // Clean Code: Limpeza automática de dados antigos
    this.startCleanupInterval()
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  // Pragmatic Programmer: Configurações flexíveis
  private readonly configs = {
    ADMIN_LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockMultiplier: 2 },
    PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockMultiplier: 3 },
    USER_SUBMIT: { maxAttempts: 10, windowMs: 60 * 60 * 1000, blockMultiplier: 1.5 },
    API_GENERAL: { maxAttempts: 100, windowMs: 60 * 60 * 1000, blockMultiplier: 1 },
  } as const

  // Clean Code: Método com responsabilidade única
  private getClientKey(ip: string, action: string): string {
    return `${ip}:${action}`
  }

  // Security: Verificação robusta com bloqueio progressivo
  public check(ip: string, action: keyof typeof this.configs): boolean {
    const config = this.configs[action]
    const key = this.getClientKey(ip, action)
    const now = Date.now()

    const attemptData = this.attempts.get(key)

    // Clean Code: Early return para casos simples
    if (!attemptData) {
      this.attempts.set(key, { count: 1, resetTime: now + config.windowMs })
      return true
    }

    // Verificar se ainda está bloqueado
    if (attemptData.blockedUntil && now < attemptData.blockedUntil) {
      return false
    }

    // Reset da janela de tempo se expirou
    if (now > attemptData.resetTime) {
      attemptData.count = 1
      attemptData.resetTime = now + config.windowMs
      delete attemptData.blockedUntil
      return true
    }

    // Incrementar tentativas
    attemptData.count++

    // Aplicar bloqueio se excedeu limite
    if (attemptData.count > config.maxAttempts) {
      const blockDuration = config.windowMs * config.blockMultiplier
      attemptData.blockedUntil = now + blockDuration
      return false
    }

    return true
  }

  // Pragmatic Programmer: Informações úteis para debugging
  public getStatus(
    ip: string,
    action: keyof typeof this.configs,
  ): {
    remaining: number
    resetTime: number
    blocked: boolean
    blockedUntil?: number
  } {
    const config = this.configs[action]
    const key = this.getClientKey(ip, action)
    const attemptData = this.attempts.get(key)
    const now = Date.now()

    if (!attemptData) {
      return {
        remaining: config.maxAttempts,
        resetTime: now + config.windowMs,
        blocked: false,
      }
    }

    const isBlocked = attemptData.blockedUntil ? now < attemptData.blockedUntil : false

    return {
      remaining: Math.max(0, config.maxAttempts - attemptData.count),
      resetTime: attemptData.resetTime,
      blocked: isBlocked,
      blockedUntil: attemptData.blockedUntil,
    }
  }

  // Clean Code: Limpeza automática para evitar vazamentos de memória
  private startCleanupInterval(): void {
    setInterval(
      () => {
        const now = Date.now()
        for (const [key, data] of this.attempts.entries()) {
          // Remove entradas expiradas
          if (now > data.resetTime && (!data.blockedUntil || now > data.blockedUntil)) {
            this.attempts.delete(key)
          }
        }
      },
      5 * 60 * 1000,
    ) // Limpeza a cada 5 minutos
  }

  // Security: Reset manual para casos especiais
  public reset(ip: string, action: keyof typeof this.configs): void {
    const key = this.getClientKey(ip, action)
    this.attempts.delete(key)
  }
}

// Clean Code: Interface simples para uso externo
export const rateLimit = {
  check: (ip: string, action: keyof typeof RateLimiter.prototype.configs) =>
    RateLimiter.getInstance().check(ip, action),

  getStatus: (ip: string, action: keyof typeof RateLimiter.prototype.configs) =>
    RateLimiter.getInstance().getStatus(ip, action),

  reset: (ip: string, action: keyof typeof RateLimiter.prototype.configs) =>
    RateLimiter.getInstance().reset(ip, action),
}
