"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { NotesFilters } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchBarProps {
  filters: NotesFilters
  onFiltersChange: (filters: NotesFilters) => void
}

export function SearchBar({ filters, onFiltersChange }: SearchBarProps) {
  const [tagInput, setTagInput] = useState("")

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status })
  }

  const addTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      onFiltersChange({
        ...filters,
        tags: [...filters.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      tags: [],
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher dans les notes..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filtres
              {(filters.tags.length > 0 || filters.status !== "all") && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length + (filters.status !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="todo">À faire</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Ajouter un tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    Ajouter
                  </Button>
                </div>
              </div>

              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                Effacer les filtres
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
