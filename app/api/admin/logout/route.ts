import { type NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await logout()

    const response = NextResponse.json({ success: true })
    response.cookies.delete("admin_token")
    return response
  } catch (error) {
    console.error("Erro no logout:", error)
    return NextResponse.json({ success: false, error: "Erro no logout" }, { status: 500 })
  }
}
