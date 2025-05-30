// Simple Dependency Injection Container
import { LoggerFactory, LogLevel } from "./loggerFactory"
import { LocalStorageUserRepository } from "./localStorageUserRepository"
import { LocalStorageChecklistRepository } from "./localStorageChecklistRepository"
import { UserService } from "./userService"
import { ChecklistService } from "./checklistService"
import { ScoreCalculator } from "./scoreCalculator"
import { RecommendationEngine } from "./recommendationEngine"
import { DiagnosticFacade } from "./diagnosticFacade"
import { CommandHistory } from "./commandHistory"

export interface ServiceContainer {
  register<T>(token: string, factory: () => T): void
  registerSingleton<T>(token: string, factory: () => T): void
  resolve<T>(token: string): T
}

export class DIContainer implements ServiceContainer {
  private services = new Map<string, any>()
  private singletons = new Map<string, any>()
  private factories = new Map<string, () => any>()

  register<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory)
  }

  registerSingleton<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory)
    this.singletons.set(token, null) // Mark as singleton
  }

  resolve<T>(token: string): T {
    // Check if it's a singleton and already created
    if (this.singletons.has(token)) {
      let instance = this.singletons.get(token)
      if (!instance) {
        const factory = this.factories.get(token)
        if (!factory) {
          throw new Error(`Service ${token} not registered`)
        }
        instance = factory()
        this.singletons.set(token, instance)
      }
      return instance
    }

    // Regular service
    const factory = this.factories.get(token)
    if (!factory) {
      throw new Error(`Service ${token} not registered`)
    }

    return factory()
  }
}

// Service tokens
export const SERVICE_TOKENS = {
  LOGGER: "Logger",
  USER_REPOSITORY: "UserRepository",
  CHECKLIST_REPOSITORY: "ChecklistRepository",
  USER_SERVICE: "UserService",
  CHECKLIST_SERVICE: "ChecklistService",
  SCORE_CALCULATOR: "ScoreCalculator",
  RECOMMENDATION_ENGINE: "RecommendationEngine",
  DIAGNOSTIC_FACADE: "DiagnosticFacade",
  COMMAND_HISTORY: "CommandHistory",
} as const

// Container setup
export function setupContainer(): ServiceContainer {
  const container = new DIContainer()

  // Register singletons
  container.registerSingleton(SERVICE_TOKENS.LOGGER, () =>
    LoggerFactory.createLogger({
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === "production",
    }),
  )

  container.registerSingleton(SERVICE_TOKENS.USER_REPOSITORY, () => new LocalStorageUserRepository())

  container.registerSingleton(SERVICE_TOKENS.CHECKLIST_REPOSITORY, () => new LocalStorageChecklistRepository())

  // Register services
  container.register(
    SERVICE_TOKENS.USER_SERVICE,
    () => new UserService(container.resolve(SERVICE_TOKENS.USER_REPOSITORY)),
  )

  container.register(
    SERVICE_TOKENS.CHECKLIST_SERVICE,
    () => new ChecklistService(container.resolve(SERVICE_TOKENS.CHECKLIST_REPOSITORY)),
  )

  container.register(SERVICE_TOKENS.SCORE_CALCULATOR, () => new ScoreCalculator())

  container.register(SERVICE_TOKENS.RECOMMENDATION_ENGINE, () => new RecommendationEngine())

  container.register(
    SERVICE_TOKENS.DIAGNOSTIC_FACADE,
    () =>
      new DiagnosticFacade(
        container.resolve(SERVICE_TOKENS.USER_SERVICE),
        container.resolve(SERVICE_TOKENS.CHECKLIST_SERVICE),
        container.resolve(SERVICE_TOKENS.SCORE_CALCULATOR),
        container.resolve(SERVICE_TOKENS.RECOMMENDATION_ENGINE),
      ),
  )

  container.registerSingleton(SERVICE_TOKENS.COMMAND_HISTORY, () => new CommandHistory())

  return container
}
