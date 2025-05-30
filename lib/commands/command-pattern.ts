// Command Pattern para ações do usuário
import { Logger } from "./logger" // Import Logger
import type { IChecklistService } from "./checklist-service" // Import IChecklistService

export interface ICommand {
  execute(): Promise<void>
  undo(): Promise<void>
  canUndo(): boolean
}

export interface ICommandHistory {
  execute(command: ICommand): Promise<void>
  undo(): Promise<void>
  redo(): Promise<void>
  canUndo(): boolean
  canRedo(): boolean
  clear(): void
}

export class CommandHistory implements ICommandHistory {
  private history: ICommand[] = []
  private currentIndex = -1
  private readonly logger = Logger.getInstance()

  async execute(command: ICommand): Promise<void> {
    try {
      await command.execute()

      // Remove commands after current index (for redo functionality)
      this.history = this.history.slice(0, this.currentIndex + 1)
      this.history.push(command)
      this.currentIndex++

      this.logger.debug("Command executed", {
        commandType: command.constructor.name,
        historyLength: this.history.length,
      })
    } catch (error) {
      this.logger.error("Command execution failed", error as Error, {
        commandType: command.constructor.name,
      })
      throw error
    }
  }

  async undo(): Promise<void> {
    if (!this.canUndo()) {
      throw new Error("No commands to undo")
    }

    try {
      const command = this.history[this.currentIndex]
      await command.undo()
      this.currentIndex--

      this.logger.debug("Command undone", {
        commandType: command.constructor.name,
      })
    } catch (error) {
      this.logger.error("Command undo failed", error as Error)
      throw error
    }
  }

  async redo(): Promise<void> {
    if (!this.canRedo()) {
      throw new Error("No commands to redo")
    }

    try {
      this.currentIndex++
      const command = this.history[this.currentIndex]
      await command.execute()

      this.logger.debug("Command redone", {
        commandType: command.constructor.name,
      })
    } catch (error) {
      this.currentIndex--
      this.logger.error("Command redo failed", error as Error)
      throw error
    }
  }

  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  clear(): void {
    this.history = []
    this.currentIndex = -1
    this.logger.debug("Command history cleared")
  }
}

// Comando específico para atualizar resposta do checklist
export class UpdateChecklistAnswerCommand implements ICommand {
  private previousValue?: boolean
  private readonly logger = Logger.getInstance()

  constructor(
    private readonly checklistService: IChecklistService,
    private readonly userId: string,
    private readonly questionId: string,
    private readonly newValue: boolean,
  ) {}

  async execute(): Promise<void> {
    try {
      // Salvar valor anterior para undo
      const currentAnswers = await this.checklistService.getAnswers(this.userId)
      this.previousValue = currentAnswers?.answers[this.questionId]

      // Executar comando
      await this.checklistService.updateAnswer(this.userId, this.questionId, this.newValue)

      this.logger.debug("Checklist answer updated", {
        userId: this.userId,
        questionId: this.questionId,
        newValue: this.newValue,
        previousValue: this.previousValue,
      })
    } catch (error) {
      this.logger.error("Failed to update checklist answer", error as Error, {
        userId: this.userId,
        questionId: this.questionId,
      })
      throw error
    }
  }

  async undo(): Promise<void> {
    if (this.previousValue === undefined) {
      throw new Error("Cannot undo: no previous value stored")
    }

    try {
      await this.checklistService.updateAnswer(this.userId, this.questionId, this.previousValue)

      this.logger.debug("Checklist answer undone", {
        userId: this.userId,
        questionId: this.questionId,
        restoredValue: this.previousValue,
      })
    } catch (error) {
      this.logger.error("Failed to undo checklist answer", error as Error, {
        userId: this.userId,
        questionId: this.questionId,
      })
      throw error
    }
  }

  canUndo(): boolean {
    return this.previousValue !== undefined
  }
}
