"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Note } from "@/types"
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
  onSave: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void
  onUpdate?: (id: string, updates: Partial<Note>) => void
  note?: Note | null
}

export function NoteModal({ isOpen, onClose, onSave, onUpdate, note }: NoteModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    status: "todo" as Note["status"],
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (note) {
      setFormData({
        titre: note.titre,
        contenu: note.contenu,
        status: note.status,
        tags: note.tags,
      })
    } else {
      setFormData({
        titre: "",
        contenu: "",
        status: "todo",
        tags: [],
      })
    }
  }, [note, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !user) return

    if (note && onUpdate) {
      onUpdate(note.id, formData)
    } else {
      onSave({
        ...formData,
        author: user.name,
      })
    }

    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
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
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de la note"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Note["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
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
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu</Label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
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
