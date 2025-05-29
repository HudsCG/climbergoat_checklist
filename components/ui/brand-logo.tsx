import { BRAND } from "@/lib/constants"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function BrandLogo({ size = "md", showText = true, className = "" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img src={BRAND.logo || "/placeholder.svg"} alt={BRAND.name} className={`w-auto ${sizeClasses[size]}`} />
      {showText && <span className="font-semibold text-foreground">{BRAND.tagline}</span>}
    </div>
  )
}
