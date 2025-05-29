import type { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  background?: "default" | "neutral" | "white"
}

export function Section({ children, className = "", background = "default" }: SectionProps) {
  const backgroundClasses = {
    default: "bg-background",
    neutral: "bg-secondary",
    white: "bg-white",
  }

  return (
    <section className={`section-padding ${backgroundClasses[background]} ${className}`}>
      <div className="container-responsive">{children}</div>
    </section>
  )
}
