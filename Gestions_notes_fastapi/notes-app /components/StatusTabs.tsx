"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Note } from "@/types"

interface StatusTabsProps {
  notes: Note[]
  activeVisibility: string
  onVisibilityChange: (visibility: "all" | "prive" | "partage" | "public") => void
}

export function StatusTabs({ notes, activeVisibility, onVisibilityChange }: StatusTabsProps) {
  const visibilityCounts = {
    all: notes.length,
    prive: notes.filter((note) => note.visibilite === "prive").length,
    partage: notes.filter((note) => note.visibilite === "partage").length,
    public: notes.filter((note) => note.visibilite === "public").length,
  }

  const visibilityLabels = {
    all: "Toutes",
    prive: "Privées",
    partage: "Partagées",
    public: "Publiques",
  }

  return (
    <Tabs value={activeVisibility} onValueChange={onVisibilityChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        {Object.entries(visibilityLabels).map(([visibility, label]) => (
          <TabsTrigger key={visibility} value={visibility} className="flex items-center gap-2">
            {label}
            <Badge variant="secondary" className="text-xs">
              {visibilityCounts[visibility as keyof typeof visibilityCounts]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
