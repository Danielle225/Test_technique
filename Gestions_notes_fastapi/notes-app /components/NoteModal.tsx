"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Note, Tag } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MarkdownEditor } from "./MarkdownEditor"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<Note, "id" | "date_creation" | "date_modification" | "utilisateur_id">) => void
  onUpdate?: (id: string, updates: Partial<Note>) => void
  note?: Note | null
}

export function NoteModal({ isOpen, onClose, onSave, onUpdate, note }: NoteModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    visibilite: "prive" as Note["visibilite"],
    tags: [] as Tag[],
  })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (note) {
      setFormData({
        titre: note.titre,
        contenu: note.contenu,
        visibilite: note.visibilite,
        tags: note.tags,
      })
    } else {
      setFormData({
        titre: "",
        contenu: "",
        visibilite: "prive",
        tags: [],
      })
    }
  }, [note, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titre.trim() || !user) return

    if (note && onUpdate) {
      onUpdate(note.id, formData)
    } else {
      onSave({
        ...formData,
      })
    }

    onClose()
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (
      trimmed &&
      !formData.tags.some((tag) => tag.nom === trimmed)
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [
          ...prev.tags,
          { id: Math.random().toString(36).substr(2, 9), nom: trimmed },
        ],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.nom !== tagToRemove),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Modifier la note" : "Créer une nouvelle note"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre de la note"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibilite">Visibilité</Label>
              <Select
                value={formData.visibilite}
                onValueChange={(value: Note["visibilite"]) => setFormData((prev) => ({ ...prev, visibilite: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prive">Privé</SelectItem>
                  <SelectItem value="partage">Partagé</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Ajouter
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    {tag.nom}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag.nom)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenu">Contenu</Label>
            <MarkdownEditor
              value={formData.contenu}
              onChange={(contenu) => setFormData((prev) => ({ ...prev, contenu }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{note ? "Mettre à jour" : "Créer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
