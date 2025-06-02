// Pragmatic Programmer: Error handling centralizado
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400)
  }
}

export class StorageError extends AppError {
  constructor(message: string) {
    super(message, "STORAGE_ERROR", 500)
  }
}

// Clean Code: Error handler centralizado
export class ErrorHandler {
  static handle(error: unknown): string {
    console.error("Error occurred:", error)

    if (error instanceof AppError) {
      return error.message
    }

    if (error instanceof Error) {
      return "Ocorreu um erro inesperado. Tente novamente."
    }

    return "Erro desconhecido. Tente novamente."
  }

  static logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString()
    const errorInfo = {
      timestamp,
      context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    }

    console.error("Application Error:", errorInfo)

    // Em produção, enviar para serviço de monitoramento
    // this.sendToMonitoringService(errorInfo)
  }
}
