// Design Patterns: Strategy Pattern para validação
import { type ValidationStrategy, type ValidationResult, VALIDATION_RULES } from "./types"

export class NameValidationStrategy implements ValidationStrategy {
  validate(value: string): ValidationResult {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return { isValid: false, error: "Nome é obrigatório" }
    }

    if (trimmedValue.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
      return { isValid: false, error: `Nome deve ter pelo menos ${VALIDATION_RULES.NAME.MIN_LENGTH} caracteres` }
    }

    if (trimmedValue.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
      return { isValid: false, error: `Nome deve ter no máximo ${VALIDATION_RULES.NAME.MAX_LENGTH} caracteres` }
    }

    // Pragmatic Programmer: Validação contra ataques XSS
    if (/<script|javascript:|on\w+=/i.test(trimmedValue)) {
      return { isValid: false, error: "Nome contém caracteres inválidos" }
    }

    return { isValid: true }
  }
}

export class EmailValidationStrategy implements ValidationStrategy {
  validate(value: string): ValidationResult {
    const trimmedValue = value.trim().toLowerCase()

    if (!trimmedValue) {
      return { isValid: false, error: "E-mail é obrigatório" }
    }

    if (!VALIDATION_RULES.EMAIL.PATTERN.test(trimmedValue)) {
      return { isValid: false, error: "E-mail inválido" }
    }

    // Pragmatic Programmer: Validação adicional de segurança
    if (trimmedValue.length > 254) {
      return { isValid: false, error: "E-mail muito longo" }
    }

    return { isValid: true }
  }
}

export class WhatsAppValidationStrategy implements ValidationStrategy {
  validate(value: string): ValidationResult {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return { isValid: false, error: "WhatsApp é obrigatório" }
    }

    // Remove formatação para validação
    const numbersOnly = trimmedValue.replace(/\D/g, "")

    if (numbersOnly.length < 10 || numbersOnly.length > 11) {
      return { isValid: false, error: "WhatsApp deve ter 10 ou 11 dígitos" }
    }

    return { isValid: true }
  }
}

// Design Patterns: Factory Pattern para criar validadores
export class ValidationFactory {
  static createValidator(type: "name" | "email" | "whatsapp"): ValidationStrategy {
    switch (type) {
      case "name":
        return new NameValidationStrategy()
      case "email":
        return new EmailValidationStrategy()
      case "whatsapp":
        return new WhatsAppValidationStrategy()
      default:
        throw new Error(`Unknown validation type: ${type}`)
    }
  }
}

// Clean Code: Função utilitária para sanitização
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove caracteres perigosos
    .substring(0, 1000) // Limita tamanho
}
