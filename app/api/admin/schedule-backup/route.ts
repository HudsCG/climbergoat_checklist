import { type NextRequest, NextResponse } from "next/server"
import { sendBackupByEmail } from "@/lib/backup-service"
import { verifyAdminAuth } from "@/lib/auth"
import { InputValidator } from "@/lib/validators"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do admin
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter email do corpo da requisição
    const body = await request.json()
    const { email } = body

    // Validar email
    const emailValidation = InputValidator.validateEmail(email || "")
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    // Enviar backup por email
    const success = await sendBackupByEmail(emailValidation.sanitizedValue)

    if (success) {
      return NextResponse.json({ message: "Backup enviado com sucesso" })
    } else {
      return NextResponse.json({ error: "Falha ao enviar backup por email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao agendar backup:", error)
    return NextResponse.json({ error: "Falha ao processar solicitação" }, { status: 500 })
  }
}
