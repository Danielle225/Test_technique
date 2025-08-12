"use client"

import { useState, useEffect } from "react"
import type { Note } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Share2, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { NotesService } from "@/services/notes.service"
import { useToast } from "@/contexts/ToastContext"

interface NoteViewModalProps {
  isOpen: boolean
  onClose: () => void
  note_id: string | null
  onEdit?: (note: Note) => void
  onDelete?: (id: string) => void
  onShare?: (note: Note) => void
}

export function NoteViewModal({ 
  isOpen, 
  onClose, 
  note_id, 
  onEdit, 
  onDelete, 
  onShare 
}: NoteViewModalProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

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

  useEffect(() => {
    const fetchNote = async () => {
      if (!note_id || !isOpen) return

      setIsLoading(true)
      try {
        const fetchedNote = await NotesService.getNoteById(note_id)
        setNote(fetchedNote)
      } catch (error) {
        addToast({
          type: "erreur",
          message: "Impossible de charger la note",
        })
        onClose()
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [note_id, isOpen, onClose])

  const handleEdit = () => {
    if (note && onEdit) {
      onEdit(note)
      onClose()
    }
  }

  const handleShare = () => {
    if (note && onShare) {
      onShare(note)
      onClose()
    }
  }

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex-1 space-y-2">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : note ? (
              <>
                <DialogTitle className="text-xl font-semibold pr-8">
                  {note.titre}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={visibiliteColors[note.visibilite]}>
                    {visibiliteLabels[note.visibilite]}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Créé le {formatDate(note.date_creation)}
                  </span>
                  {note.date_modification !== note.date_creation && (
                    <span className="text-sm text-gray-500">
                      • Modifié le {formatDate(note.date_modification)}
                    </span>
                  )}
                </div>
              </>
            ) : null}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : note ? (
          <div className="space-y-6">
            {/* Contenu de la note */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{note.contenu}</ReactMarkdown>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Tags :</h4>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.nom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
                {onShare && (
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                )}
              </div>
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Note introuvable
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
