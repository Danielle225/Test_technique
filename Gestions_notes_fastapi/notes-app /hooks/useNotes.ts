"use client"

import { useState, useEffect } from "react"
import type { Note, NotesFilters, ApiError } from "@/types"
import { NotesService } from "@/services/notes.service"
import { SharingService } from "@/services/sharing.service"
import { useToast } from "@/contexts/ToastContext"
import { 
  getApiErrorMessage, 
  getApiErrorCode, 
  getApiErrorData, 
  extractApiError,
  isStructuredApiError,
  getApiSuccessMessage
} from "@/lib/utils"

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

  const createNote = async (noteData: Omit<Note, "id" | "date_creation" | "date_modification" | "utilisateur_id">) => {
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
      const response = await SharingService.shareNoteWithUser(noteId, userEmail)
      const successMessage = getApiSuccessMessage(response, "Note partagée avec succès")
      addToast({
        type: "reussi",
        message: successMessage,
      })
    } catch (error: any) {
      console.error('Erreur de partage:', error)
      
      if (isStructuredApiError(error)) {
        const errorCode = getApiErrorCode(error)
        const errorMessage = getApiErrorMessage(error)
        const errorData = getApiErrorData(error)
        
        console.log('Code:', errorCode)
        console.log('Message:', errorMessage)
        console.log('Données:', errorData)
        
        switch (errorCode) {
          case 'ALREADY_SHARED':
            addToast({
              type: "avertissement",
              message: "Cette note est déjà partagée avec cet utilisateur",
            })
            break
            
          case 'USER_NOT_FOUND':
            addToast({
              type: "erreur",
              message: `Aucun utilisateur trouvé avec l'email: ${errorData?.email || userEmail}`,
            })
            break
            
          case 'NOTE_NOT_FOUND':
            addToast({
              type: "erreur",
              message: "Note non trouvée ou vous n'avez pas les droits",
            })
            break
            
          case 'SELF_SHARING_FORBIDDEN':
            addToast({
              type: "avertissement",
              message: "Vous ne pouvez pas partager une note avec vous-même",
            })
            break
            
          case 'SHARE_CREATION_FAILED':
            addToast({
              type: "erreur",
              message: `Erreur lors du partage: ${errorMessage}`,
            })
            break
            
          default:
            addToast({
              type: "erreur",
              message: errorMessage,
            })
        }
      } else {
        const fallbackMessage = getApiErrorMessage(error, "Erreur de connexion")
        addToast({
          type: "erreur",
          message: fallbackMessage,
        })
      }
      throw error
    }
  }

  const unshareNoteWithUser = async (noteId: string, userEmail: string) => {
    try {
      const response = await SharingService.unshareNoteWithUser(noteId, userEmail)
      const successMessage = getApiSuccessMessage(response, "Partage supprimé avec succès")
      addToast({
        type: "reussi",
        message: successMessage,
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
      const successMessage = getApiSuccessMessage(result, "Lien public créé avec succès")
      addToast({
        type: "reussi",
        message: successMessage,
      })
      
      setNotes((prev) => prev.map((note) => 
        note.id === noteId 
          ? { ...note, public_token: result.public_token }
          : note
      ))
      
      return result
    } catch (error: any) {
      const errorCode = getApiErrorCode(error)
      const errorMessage = getApiErrorMessage(error)
      
      switch (errorCode) {
        case 'NOTE_NOT_FOUND':
          addToast({
            type: "erreur",
            message: "Note non trouvée",
          })
          break
        case 'PUBLIC_LINK_CREATION_FAILED':
          addToast({
            type: "erreur",
            message: "Erreur lors de la création du lien public",
          })
          break
        default:
          addToast({
            type: "erreur",
            message: getApiErrorMessage(error, "Erreur lors de la création du lien public"),
          })
      }
      throw error
    }
  }

  const revokePublicLink = async (noteId: string) => {
    try {
      const response = await SharingService.revokePublicLink(noteId)
      const successMessage = getApiSuccessMessage(response, "Lien public révoqué avec succès")
      addToast({
        type: "reussi",
        message: successMessage,
      })
      
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
      console.log("Erreur lors de la récupération des partages:", error)
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
