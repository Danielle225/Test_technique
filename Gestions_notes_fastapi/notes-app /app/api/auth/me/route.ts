import { type NextRequest, NextResponse } from "next/server"

const users = [
  {
    id: "1",
    email: "demo@example.com",
    name: "Utilisateur Demo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Simulation de la récupération de l'utilisateur
    const user = users.find((u) => u.id === authToken)

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
