// Implementação de Logger seguindo princípios SOLID
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface ILogger {
  debug(message: string, meta?: Record<string, any>): void
  info(message: string, meta?: Record<string, any>): void
  warn(message: string, meta?: Record<string, any>): void
  error(message: string, error?: Error, meta?: Record<string, any>): void
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  meta?: Record<string, any>
  error?: Error
  userId?: string
  sessionId?: string
}

// Strategy Pattern para diferentes tipos de log
export interface ILogTransport {
  log(entry: LogEntry): Promise<void>
}

export class ConsoleTransport implements ILogTransport {
  async log(entry: LogEntry): Promise<void> {
    const levelName = LogLevel[entry.level]
    const timestamp = entry.timestamp
    const message = `[${timestamp}] ${levelName}: ${entry.message}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.meta)
        break
      case LogLevel.INFO:
        console.info(message, entry.meta)
        break
      case LogLevel.WARN:
        console.warn(message, entry.meta)
        break
      case LogLevel.ERROR:
        console.error(message, entry.error, entry.meta)
        break
    }
  }
}

export class RemoteTransport implements ILogTransport {
  constructor(private endpoint: string) {}

  async log(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // Fallback para console se remote falhar
      console.error("Failed to send log to remote:", error)
    }
  }
}

// Singleton Pattern com Dependency Injection
export class Logger implements ILogger {
  private static instance: Logger
  private transports: ILogTransport[] = []
  private minLevel: LogLevel = LogLevel.INFO
  private userId?: string
  private sessionId: string

  private constructor() {
    this.sessionId = this.generateSessionId()
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public addTransport(transport: ILogTransport): void {
    this.transports.push(transport)
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  public setUserId(userId: string): void {
    this.userId = userId
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private async logEntry(level: LogLevel, message: string, error?: Error, meta?: Record<string, any>): Promise<void> {
    if (level < this.minLevel) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      error,
      userId: this.userId,
      sessionId: this.sessionId,
    }

    // Enviar para todos os transports
    await Promise.all(
      this.transports.map((transport) => transport.log(entry).catch((err) => console.error("Transport failed:", err))),
    )
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logEntry(LogLevel.DEBUG, message, undefined, meta)
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logEntry(LogLevel.INFO, message, undefined, meta)
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logEntry(LogLevel.WARN, message, undefined, meta)
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    this.logEntry(LogLevel.ERROR, message, error, meta)
  }
}

// Factory para configurar logger
export class LoggerFactory {
  static createLogger(config: {
    minLevel?: LogLevel
    enableConsole?: boolean
    enableRemote?: boolean
    remoteEndpoint?: string
  }): Logger {
    const logger = Logger.getInstance()

    if (config.minLevel !== undefined) {
      logger.setMinLevel(config.minLevel)
    }

    if (config.enableConsole !== false) {
      logger.addTransport(new ConsoleTransport())
    }

    if (config.enableRemote && config.remoteEndpoint) {
      logger.addTransport(new RemoteTransport(config.remoteEndpoint))
    }

    return logger
  }
}
