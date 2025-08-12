"use client"

import { useState, useEffect } from "react"
import type { Note, NotesFilters, ApiError } from "@/types"
import { NotesService } from "@/services/notes.service"
import { SharingService } from "@/services/sharing.service"
import { useToast } from "@/contexts/ToastContext"
import { getApiErrorMessage } from "@/lib/utils"
import { Tag } from "lucide-react"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NotesFilters>({
    search: "",
    visibilite: "all",
    tags: [] ,
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
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors du chargement des notes"),
      })
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (noteData: Omit<Note, "id" | "created_at" | "updated_at" | "utilisateur_id">) => {
    try {
      const newNote = await NotesService.createNote(noteData)
      setNotes((prev) => [newNote, ...prev])
      addToast({
        type: "reussi",
        message: "Note créée avec succès",
      })
      return newNote
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la création de la note"),
      })
      throw error
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await NotesService.updateNote(id, updates)
      setNotes((prev) => prev.map((note) => (note.id === id ? updatedNote : note)))
      addToast({
        type: "reussi",
        message: "Note mise à jour avec succès",
      })
      return updatedNote
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la mise à jour de la note"),
      })
      throw error
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await NotesService.deleteNote(id)
      setNotes((prev) => prev.filter((note) => note.id !== id))
      addToast({
        type: "reussi",
        message: "Note supprimée avec succès",
      })
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la suppression de la note"),
      })
      throw error
    }
  }
  const shareNoteWithUser = async (noteId: string, userEmail: string) => {
    try {
      await SharingService.shareNoteWithUser(noteId, userEmail)
      addToast({
        type: "reussi",
        message: "Note partagée avec succès",
      })
    } catch (error: any) {
      console.log('error', error)
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors du partage de la note"),
      })
      throw error
    }
  }

  const unshareNoteWithUser = async (noteId: string, userEmail: string) => {
    try {
      await SharingService.unshareNoteWithUser(noteId, userEmail)
      addToast({
        type: "reussi",
        message: "Partage supprimé avec succès",
      })
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la suppression du partage"),
      })
      throw error
    }
  }

  const createPublicLink = async (noteId: string) => {
    try {
      const result = await SharingService.createPublicLink(noteId)
      addToast({
        type: "reussi",
        message: "Lien public créé avec succès",
      })
      
      // Mettre à jour la note dans l'état local si possible
      setNotes((prev) => prev.map((note) => 
        note.id === noteId 
          ? { ...note, public_token: result.public_token }
          : note
      ))
      
      return result
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la création du lien public"),
      })
      throw error
    }
  }

  const revokePublicLink = async (noteId: string) => {
    try {
      await SharingService.revokePublicLink(noteId)
      addToast({
        type: "reussi",
        message: "Lien public révoqué avec succès",
      })
      
      // Mettre à jour la note dans l'état local
      setNotes((prev) => prev.map((note) => 
        note.id === noteId 
          ? { ...note, public_token: undefined }
          : note
      ))
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la révocation du lien public"),
      })
      throw error
    }
  }

  const getSharedWithMe = async () => {
    try {
      const sharedNotes = await SharingService.getSharedWithMe()
      addToast({
        type: "reussi",
        message: "Notes partagées récupérées",
      })
      return sharedNotes
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la récupération des notes partagées"),
      })
      throw error
    }
  }

  const getNoteShares = async (noteId: string) => {
    try {
      const shares = await SharingService.getNoteShares(noteId)
      return shares
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la récupération des partages"),
      })
      throw error
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.titre.toLowerCase().includes(filters.search.toLowerCase()) ||
      note.contenu.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.visibilite === "all" || note.visibilite === filters.visibilite
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
    // Fonctions de partage
    shareNoteWithUser,
    unshareNoteWithUser,
    createPublicLink,
    revokePublicLink,
    getSharedWithMe,
    getNoteShares,
  }
}
