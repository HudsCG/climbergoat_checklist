import DOMPurify from "isomorphic-dompurify"

// Clean Code: Interfaces claras e específicas
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue: string
}

export interface ValidationRule {
  validate: (value: string) => boolean
  message: string
}

// Design Pattern: Strategy Pattern para validações
export class InputValidator {
  private static emailRules: ValidationRule[] = [
    {
      validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: "Formato de email inválido",
    },
    {
      validate: (email: string) => email.length <= 254,
      message: "Email muito longo (máximo 254 caracteres)",
    },
    {
      validate: (email: string) => email.length >= 5,
      message: "Email muito curto (mínimo 5 caracteres)",
    },
  ]

  private static passwordRules: ValidationRule[] = [
    {
      validate: (password: string) => password.length >= 8,
      message: "Senha deve ter pelo menos 8 caracteres",
    },
    {
      validate: (password: string) => /[A-Z]/.test(password),
      message: "Senha deve conter pelo menos uma letra maiúscula",
    },
    {
      validate: (password: string) => /[a-z]/.test(password),
      message: "Senha deve conter pelo menos uma letra minúscula",
    },
    {
      validate: (password: string) => /\d/.test(password),
      message: "Senha deve conter pelo menos um número",
    },
    {
      validate: (password: string) => password.length <= 128,
      message: "Senha muito longa (máximo 128 caracteres)",
    },
  ]

  private static nameRules: ValidationRule[] = [
    {
      validate: (name: string) => name.trim().length >= 2,
      message: "Nome deve ter pelo menos 2 caracteres",
    },
    {
      validate: (name: string) => name.trim().length <= 100,
      message: "Nome muito longo (máximo 100 caracteres)",
    },
    {
      validate: (name: string) => /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim()),
      message: "Nome deve conter apenas letras e espaços",
    },
  ]

  private static whatsappRules: ValidationRule[] = [
    {
      validate: (phone: string) => /^$$\d{2}$$\s\d{4,5}-\d{4}$/.test(phone),
      message: "Formato inválido. Use: (11) 99999-9999",
    },
    {
      validate: (phone: string) => {
        const digits = phone.replace(/\D/g, "")
        return digits.length === 10 || digits.length === 11
      },
      message: "WhatsApp deve ter 10 ou 11 dígitos",
    },
  ]

  // Clean Code: Métodos pequenos e focados
  private static validateWithRules(value: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = []
    const sanitizedValue = this.sanitizeInput(value)

    for (const rule of rules) {
      if (!rule.validate(sanitizedValue)) {
        errors.push(rule.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue,
    }
  }

  // Security: Sanitização robusta contra XSS
  static sanitizeInput(input: string): string {
    if (typeof input !== "string") return ""

    // Remove caracteres de controle e normaliza
    let sanitized = input
      .replace(/[\x00-\x1F\x7F]/g, "") // Remove caracteres de controle
      .trim()
      .normalize("NFC") // Normalização Unicode

    // DOMPurify para remover scripts maliciosos
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })

    return sanitized
  }

  // Public API - Clean Code: Interface simples
  static validateEmail(email: string): ValidationResult {
    return this.validateWithRules(email, this.emailRules)
  }

  static validatePassword(password: string): ValidationResult {
    return this.validateWithRules(password, this.passwordRules)
  }

  static validateName(name: string): ValidationResult {
    return this.validateWithRules(name, this.nameRules)
  }

  static validateWhatsApp(phone: string): ValidationResult {
    return this.validateWithRules(phone, this.whatsappRules)
  }

  // Pragmatic Programmer: Validação de objetos completos
  static validateUserData(userData: {
    name: string
    email: string
    whatsapp: string
  }): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    const nameValidation = this.validateName(userData.name)
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errors
    }

    const emailValidation = this.validateEmail(userData.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors
    }

    const whatsappValidation = this.validateWhatsApp(userData.whatsapp)
    if (!whatsappValidation.isValid) {
      errors.whatsapp = whatsappValidation.errors
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
}

// Design Pattern: Factory para diferentes tipos de validação
export class ValidationFactory {
  static createEmailValidator(): (email: string) => ValidationResult {
    return (email: string) => InputValidator.validateEmail(email)
  }

  static createPasswordValidator(): (password: string) => ValidationResult {
    return (password: string) => InputValidator.validatePassword(password)
  }

  static createNameValidator(): (name: string) => ValidationResult {
    return (name: string) => InputValidator.validateName(name)
  }

  static createWhatsAppValidator(): (phone: string) => ValidationResult {
    return (phone: string) => InputValidator.validateWhatsApp(phone)
  }
}
