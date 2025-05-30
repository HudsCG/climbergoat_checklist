"use client"

import { useState, useEffect, useCallback } from "react"
import type { DiagnosticFacade, DiagnosticResult } from "@/lib/facades/diagnostic-facade"
import { UpdateChecklistAnswerCommand } from "@/lib/commands/command-pattern"
import { SERVICE_TOKENS, setupContainer } from "@/lib/di/container"
import type { Logger } from "@/lib/logger-service"

// Hook melhorado seguindo princípios SOLID
export function useDiagnostic(userId?: string) {
  const [container] = useState(() => setupContainer())
  const [diagnosticFacade] = useState(() => container.resolve<DiagnosticFacade>(SERVICE_TOKENS.DIAGNOSTIC_FACADE))
  const [commandHistory] = useState(() => container.resolve(SERVICE_TOKENS.COMMAND_HISTORY))
  const [logger] = useState(() => container.resolve<Logger>(SERVICE_TOKENS.LOGGER))

  const [results, setResults] = useState<DiagnosticResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar resultados
  const loadResults = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const diagnosticResults = await diagnosticFacade.generateResults(userId)
      setResults(diagnosticResults)
      logger.info("Diagnostic results loaded", { userId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load results"
      setError(errorMessage)
      logger.error("Failed to load diagnostic results", err as Error, { userId })
    } finally {
      setIsLoading(false)
    }
  }, [userId, diagnosticFacade, logger])

  // Atualizar resposta com Command Pattern
  const updateAnswer = useCallback(
    async (questionId: string, answer: boolean) => {
      if (!userId) return

      try {
        const checklistService = container.resolve(SERVICE_TOKENS.CHECKLIST_SERVICE)
        const command = new UpdateChecklistAnswerCommand(checklistService, userId, questionId, answer)

        await commandHistory.execute(command)

        // Recarregar resultados
        await loadResults()

        logger.info("Answer updated successfully", { userId, questionId, answer })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update answer"
        setError(errorMessage)
        logger.error("Failed to update answer", err as Error, { userId, questionId })
      }
    },
    [userId, container, commandHistory, loadResults, logger],
  )

  // Desfazer última ação
  const undoLastAction = useCallback(async () => {
    try {
      await commandHistory.undo()
      await loadResults()
      logger.info("Last action undone", { userId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to undo"
      setError(errorMessage)
      logger.error("Failed to undo action", err as Error, { userId })
    }
  }, [commandHistory, loadResults, logger, userId])

  // Refazer ação
  const redoLastAction = useCallback(async () => {
    try {
      await commandHistory.redo()
      await loadResults()
      logger.info("Action redone", { userId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to redo"
      setError(errorMessage)
      logger.error("Failed to redo action", err as Error, { userId })
    }
  }, [commandHistory, loadResults, logger, userId])

  // Exportar resultados
  const exportResults = useCallback(
    async (format: "pdf" | "csv") => {
      if (!userId) return null

      try {
        const exportUrl = await diagnosticFacade.exportResults(userId, format)
        logger.info("Results exported", { userId, format })
        return exportUrl
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to export"
        setError(errorMessage)
        logger.error("Failed to export results", err as Error, { userId, format })
        return null
      }
    },
    [userId, diagnosticFacade, logger],
  )

  useEffect(() => {
    if (userId) {
      loadResults()
    }
  }, [userId, loadResults])

  return {
    results,
    isLoading,
    error,
    updateAnswer,
    undoLastAction,
    redoLastAction,
    canUndo: commandHistory.canUndo(),
    canRedo: commandHistory.canRedo(),
    exportResults,
    reload: loadResults,
  }
}
