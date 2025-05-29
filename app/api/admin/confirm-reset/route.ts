import { type NextRequest, NextResponse } from "next/server"
import { confirmPasswordReset } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, code, password, newPassword } = body

    // Usar token (Supabase) ou code (fallback)
    const codeOrToken = token || code
    const finalPassword = password || newPassword

    if (!codeOrToken || !finalPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Código/token e nova senha são obrigatórios",
        },
        { status: 400 },
      )
    }

    const result = await confirmPasswordReset(codeOrToken, finalPassword)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Erro na API de confirmação de reset:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
