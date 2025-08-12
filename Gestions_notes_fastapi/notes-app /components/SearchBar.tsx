"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { NotesFilters, Tag } from "@/types"
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

  const handleStatusChange = (visibilite: "all" | "prive" | "partage" | "public") => {
  onFiltersChange({ ...filters, visibilite })
}

const addTag = () => {
  if (tagInput.trim() && !filters.tags.includes(tagInput.trim() as unknown as Tag)) {
    onFiltersChange({
      ...filters,
      tags: [...filters.tags, tagInput.trim() as unknown as Tag],
    })
    setTagInput("")
  }
}

  const removeTag = (tagToRemove: Tag) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      visibilite: "all",
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
              {(filters.tags.length > 0 || filters.visibilite !== "all") && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length + (filters.visibilite !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label htmlFor="visibilite">Visibilité</Label>
                <Select value={filters.visibilite} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une visibilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{filters.visibilite === "public" ? "✓" : ""} Public</SelectItem>
                    <SelectItem value="prive">{filters.visibilite === "prive" ? "✓" : ""} Privé</SelectItem>
                    <SelectItem value="partage">{filters.visibilite === "partage" ? "✓" : ""} Partagé</SelectItem>
                    <SelectItem value="all">{filters.visibilite === "all" ? "✓" : ""} Tous</SelectItem>
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
                    <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                      {tag.nom}
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
