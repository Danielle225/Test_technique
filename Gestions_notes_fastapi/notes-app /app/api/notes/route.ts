import { type NextRequest, NextResponse } from "next/server"
import type { Note } from "@/types"

// Simulation d'une base de données de notes
const notes: Note[] = [
  {
    id: "1",
    title: "Ma première note",
    content: "# Bienvenue\n\nCeci est un exemple de note en **Markdown**.\n\n- Point 1\n- Point 2\n- Point 3",
    status: "todo",
    tags: ["exemple", "markdown"],
    author: "Utilisateur Demo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Tâches du jour",
    content:
      "## À faire aujourd'hui\n\n- [x] Réviser le code\n- [ ] Écrire la documentation\n- [ ] Tester l'application",
    status: "in-progress",
    tags: ["tâches", "quotidien"],
    author: "Utilisateur Demo",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const noteData = await request.json()

    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    notes.unshift(newNote)

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
