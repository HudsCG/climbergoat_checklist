import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  accentColor?: "primary" | "accent"
}

export function FeatureCard({ icon: Icon, title, description, accentColor = "primary" }: FeatureCardProps) {
  const iconColorClasses = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
  }

  return (
    <div className="card-elevated p-6 rounded-xl">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColorClasses[accentColor]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-xl mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
