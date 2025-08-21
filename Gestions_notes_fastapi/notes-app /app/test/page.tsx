"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { SearchBar } from "@/components/SearchBar"
import { StatusTabs } from "@/components/StatusTabs"
import { NoteCard } from "@/components/NoteCard"
import { NoteModal } from "@/components/NoteModal"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"
import type { Note } from "@/types"

export default function DashboardPage() {
  const { notes, loading, filters, setFilters, createNote, updateNote, deleteNote, refetch } = useNotes()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleCreateNote = async (noteData: Omit<Note, "id" | "created_at" | "updated_at" | "utilisateur_id">) => {
    await createNote(noteData)
    setIsModalOpen(false)
  }

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    await updateNote(id, updates)
    setEditingNote(null)
    setIsModalOpen(false)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleVisibilityChange = async (id: string, visibilite: Note["visibilite"]) => {
    await updateNote(id, { visibilite })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const openCreateModal = () => {
    setEditingNote(null)
    setIsModalOpen(true)
  }
console.log('notes', notes)


  return (
    // <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* En-tête avec boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Notes</h1>
                <p className="text-gray-600 mt-1">Gérez et organisez vos notes efficacement</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle note
                </Button>
              </div>
            </div>

            {/* Barre de recherche */}
            <SearchBar filters={filters} onFiltersChange={setFilters} />

            {/* Onglets de visibilité */}
            <StatusTabs
              notes={notes}
              activeVisibility={filters.visibilite}
              onVisibilityChange={(visibilite) => setFilters({ ...filters, visibilite })}
            />

            {/* Grille des notes */}
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {filters.search || filters.visibilite !== "all" || filters.tags.length > 0
                    ? "Aucune note ne correspond à vos critères de recherche."
                    : "Vous n'avez pas encore de notes. Créez votre première note !"}
                </p>
                {filters.search || filters.visibilite !== "all" || filters.tags.length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ search: "", visibilite: "all", tags: [] })}
                    className="mt-4"
                  >
                    Effacer les filtres
                  </Button>
                ) : (
                  <Button onClick={openCreateModal} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer ma première note
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={deleteNote}
                    onVisibilityChange={handleVisibilityChange}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Modal de création/édition */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingNote(null)
          }}
          onSave={handleCreateNote}
          onUpdate={handleUpdateNote}
          note={editingNote}
        />
      </div>
    // </ProtectedRoute>
  )
}
