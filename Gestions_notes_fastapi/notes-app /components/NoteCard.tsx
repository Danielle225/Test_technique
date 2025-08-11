"use client"

import { useState } from "react"
import type { Note } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Note["status"]) => void
}

export function NoteCard({ note, onEdit, onDelete, onStatusChange }: NoteCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  const statusColors = {
    todo: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }

  const statusLabels = {
    todo: "À faire",
    "in-progress": "En cours",
    completed: "Terminé",
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{note.title}</h3>
          <Badge className={statusColors[note.status]}>{statusLabels[note.status]}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {showPreview ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-600 line-clamp-3">{note.content}</p>
          )}

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Par {note.author}</span>
            <span>{formatDate(note.createdAt)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(note.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <select
              value={note.status}
              onChange={(e) => onStatusChange(note.id, e.target.value as Note["status"])}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
