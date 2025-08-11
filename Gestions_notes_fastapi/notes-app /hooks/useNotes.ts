"use client"

import { useState, useEffect } from "react"
import type { Note, NotesFilters, ApiError } from "@/types"
import { NotesService } from "@/services/notes.service"
import { useToast } from "@/contexts/ToastContext"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NotesFilters>({
    search: "",
    status: "all",
    tags: [],
  })
  const { addToast } = useToast()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const data = await NotesService.getAllNotes()
      setNotes(data)
    } catch (error) {
      const apiError = error as ApiError
      addToast({
        type: "error",
        message: apiError.message || "Erreur lors du chargement des notes",
      })
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newNote = await NotesService.createNote(noteData)
      setNotes((prev) => [newNote, ...prev])
      addToast({
        type: "success",
        message: "Note créée avec succès",
      })
      return newNote
    } catch (error) {
      const apiError = error as ApiError
      addToast({
        type: "error",
        message: apiError.message || "Erreur lors de la création de la note",
      })
      throw error
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await NotesService.updateNote(id, updates)
      setNotes((prev) => prev.map((note) => (note.id === id ? updatedNote : note)))
      addToast({
        type: "success",
        message: "Note mise à jour avec succès",
      })
      return updatedNote
    } catch (error) {
      const apiError = error as ApiError
      addToast({
        type: "error",
        message: apiError.message || "Erreur lors de la mise à jour de la note",
      })
      throw error
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await NotesService.deleteNote(id)
      setNotes((prev) => prev.filter((note) => note.id !== id))
      addToast({
        type: "success",
        message: "Note supprimée avec succès",
      })
    } catch (error) {
      const apiError = error as ApiError
      addToast({
        type: "error",
        message: apiError.message || "Erreur lors de la suppression de la note",
      })
      throw error
    }
  }

  // Filtrage côté client (ou vous pouvez implémenter le filtrage côté serveur)
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      note.content.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === "all" || note.status === filters.status
    const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => note.tags.includes(tag))

    return matchesSearch && matchesStatus && matchesTags
  })

  return {
    notes: filteredNotes,
    loading,
    filters,
    setFilters,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  }
}
