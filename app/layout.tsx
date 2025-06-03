import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Diagnóstico Google Meu Negócio - Prado e Cumuruxatiba",
  description: "Descubra se seu negócio está pronto para atrair turistas em Prado e Cumuruxatiba",
  openGraph: {
    title: "Diagnóstico Google Meu Negócio - Prado e Cumuruxatiba",
    description: "Descubra se seu negócio está pronto para atrair turistas em Prado e Cumuruxatiba",
    images: [
      {
        url: "https://climbergoat-checklist.vercel.app/images/climber-goat-logo-black.png",
        width: 1200,
        height: 630,
        alt: "Climber Goat Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
