import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Supprimer le cookie de session
  response.cookies.delete("auth-token")

  return response
}
