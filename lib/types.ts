// Clean Code: Tipos centralizados e bem definidos
export interface UserData {
  name: string
  email: string
  whatsapp: string
}

export interface ChecklistAnswers {
  [key: string]: boolean
}

export interface AdminStats {
  totalUsers: number
  completedDiagnostics: number
  averageScore: number
  topCategories: Array<{ category: string; averageScore: number }>
}

export interface UserRecord {
  userId: string
  userData: UserData
  answers: ChecklistAnswers | null
  completedAt: string | null
  totalScore: number
}

// Design Patterns: Strategy Pattern para validação
export interface ValidationStrategy {
  validate(value: string): ValidationResult
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Clean Code: Constantes bem definidas
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  WHATSAPP: {
    PATTERN: /^$$\d{2}$$\s\d{4,5}-\d{4}$/,
    MIN_LENGTH: 14,
    MAX_LENGTH: 15,
  },
} as const

export const STORAGE_KEYS = {
  USER_ID: "user_id",
  USER_DATA: "user_data_",
  CHECKLIST_ANSWERS: "checklist_answers_",
  COMPLETION_DATE: "completion_date_",
} as const
