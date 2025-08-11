import { type NextRequest, NextResponse } from "next/server"

// Simulation d'une base de données utilisateur
const users = [
  {
    id: "1",
    email: "demo@example.com",
    password: "password123",
    name: "Utilisateur Demo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simulation de la vérification des identifiants
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 })
    }

    // En production, vous utiliseriez JWT ou une session sécurisée
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json(userWithoutPassword)

    // Simulation d'un cookie de session
    response.cookies.set("auth-token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
