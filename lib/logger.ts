// Design Pattern: Singleton + Strategy para diferentes tipos de log
type LogLevel = "debug" | "info" | "warn" | "error" | "security"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  ip?: string
}

// Strategy Pattern para diferentes outputs de log
abstract class LogOutput {
  abstract write(entry: LogEntry): void
}

class ConsoleLogOutput extends LogOutput {
  write(entry: LogEntry): void {
    const { timestamp, level, message, context } = entry
    const logMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log

    logMethod(`[${timestamp}] ${level.toUpperCase()}: ${message}`, context || "")
  }
}

class LocalStorageLogOutput extends LogOutput {
  private readonly maxEntries = 1000

  write(entry: LogEntry): void {
    try {
      const logs = this.getLogs()
      logs.push(entry)

      // Manter apenas os últimos logs
      if (logs.length > this.maxEntries) {
        logs.splice(0, logs.length - this.maxEntries)
      }

      localStorage.setItem("app_logs", JSON.stringify(logs))
    } catch (error) {
      console.error("Erro ao salvar log:", error)
    }
  }

  private getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem("app_logs")
      return logs ? JSON.parse(logs) : []
    } catch {
      return []
    }
  }

  public getRecentLogs(count = 100): LogEntry[] {
    return this.getLogs().slice(-count)
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.getLogs().filter((log) => log.level === level)
  }
}

// Singleton Logger
class Logger {
  private static instance: Logger
  private outputs: LogOutput[] = []
  private isProduction = process.env.NODE_ENV === "production"

  private constructor() {
    this.outputs.push(new ConsoleLogOutput())
    if (typeof window !== "undefined") {
      this.outputs.push(new LocalStorageLogOutput())
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Em produção, não logar debug
    if (this.isProduction && level === "debug") {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    }

    this.outputs.forEach((output) => output.write(entry))
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log("debug", message, context)
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log("info", message, context)
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log("warn", message, context)
  }

  public error(message: string, context?: Record<string, any>): void {
    this.log("error", message, context)
  }

  // Security: Log específico para eventos de segurança
  public securityEvent(message: string, context?: Record<string, any>): void {
    this.log("security", `SECURITY: ${message}`, context)
  }

  // Pragmatic Programmer: Métricas e monitoramento
  public performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.log("info", `PERFORMANCE: ${operation} took ${duration}ms`, context)
  }
}

// Clean Code: Interface simples
export const logger = Logger.getInstance()

// Pragmatic Programmer: Decorator para medir performance
export function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = Date.now()
    try {
      const result = await method.apply(this, args)
      const duration = Date.now() - start
      logger.performance(`${target.constructor.name}.${propertyName}`, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`${target.constructor.name}.${propertyName} failed after ${duration}ms`, { error })
      throw error
    }
  }

  return descriptor
}
