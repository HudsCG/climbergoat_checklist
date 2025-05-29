import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const isValid = await verifyToken(token)
    return NextResponse.json({ authenticated: isValid })
  } catch (error) {
    console.error("Erro na verificação:", error)
    return NextResponse.json({ authenticated: false })
  }
}
