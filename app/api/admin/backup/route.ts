import { type NextRequest, NextResponse } from "next/server"
import { generateBackup, exportBackupToJSON } from "@/lib/backup-service"
import { verifyAdminAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação do admin
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter email do admin da query string (opcional)
    const url = new URL(request.url)
    const adminEmail = url.searchParams.get("email")

    // Gerar backup
    const backup = await generateBackup("manual", adminEmail || "admin")
    const jsonData = exportBackupToJSON(backup)

    // Retornar como arquivo para download
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup_gmb_${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar backup:", error)
    return NextResponse.json({ error: "Falha ao gerar backup" }, { status: 500 })
  }
}
