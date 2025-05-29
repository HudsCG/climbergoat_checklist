// Design System Constants - Single Source of Truth
export const BRAND = {
  name: "Climber Goat",
  tagline: "Diagnóstico Google Meu Negócio",
  logo: "/images/climber-goat-logo.png",
} as const

export const COLORS = {
  primary: "hsl(var(--color-primary))",
  accent: "hsl(var(--color-accent))",
  neutral: {
    50: "hsl(var(--color-neutral-50))",
    100: "hsl(var(--color-neutral-100))",
    900: "hsl(var(--color-neutral-900))",
  },
} as const

export const ROUTES = {
  home: "/",
  checklist: "/checklist",
  results: "/results",
} as const
