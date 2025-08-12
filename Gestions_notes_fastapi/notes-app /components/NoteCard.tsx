"use client"

import { useState } from "react"
import type { Note } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { ShareModal } from "@/components/ShareModal"
import { NoteViewModal } from "@/components/NoteViewModal"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onVisibilityChange: (id: string, visibilite: Note["visibilite"]) => void
}

export function NoteCard({ note, onEdit, onDelete, onVisibilityChange }: NoteCardProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const visibiliteColors = {
    prive: "bg-gray-100 text-gray-800",
    partage: "bg-blue-100 text-blue-800",
    public: "bg-green-100 text-green-800",
  }

  const visibiliteLabels = {
    prive: "Privé",
    partage: "Partagé",
    public: "Public",
  }
console.log('note++', note)
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{note.titre}</h3>
          <Badge className={visibiliteColors[note.visibilite]}>{visibiliteLabels[note.visibilite]}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <p className="text-gray-600 line-clamp-3">{note.contenu}</p>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.nom}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Créé le</span>
            <span>{formatDate(note.date_creation)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(true)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="h-4 w-4" />
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
              value={note.visibilite}
              onChange={(e) => onVisibilityChange(note.id, e.target.value as Note["visibilite"])}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="prive">Privé</option>
              <option value="partage">Partagé</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
      </CardFooter>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        note={note}
      />
      
      <NoteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        note_id={note.id}
        onEdit={onEdit}
        onDelete={onDelete}
        onShare={(note) => {
          setIsViewModalOpen(false)
          setIsShareModalOpen(true)
        }}
      />
    </Card>
  )
}
