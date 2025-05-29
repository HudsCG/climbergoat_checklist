import { NextResponse } from "next/server"
import { sendBackupByEmail } from "@/lib/backup-service"

// Esta rota será chamada por um cron job semanal
export async function GET(request: Request) {
  try {
    // Verificar se a requisição vem de um cron job autorizado
    // Na Vercel, você pode configurar um cron job com um token secreto
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    // Verificar token (em produção, use uma comparação segura)
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Email para enviar o backup (configurado como variável de ambiente)
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return NextResponse.json({ error: "Email de admin não configurado" }, { status: 500 })
    }

    // Enviar backup por email
    const success = await sendBackupByEmail(adminEmail)

    if (success) {
      return NextResponse.json({ message: "Backup semanal enviado com sucesso" })
    } else {
      return NextResponse.json({ error: "Falha ao enviar backup semanal" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro no backup semanal:", error)
    return NextResponse.json({ error: "Falha ao processar backup semanal" }, { status: 500 })
  }
}
