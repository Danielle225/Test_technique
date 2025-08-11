"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Note } from "@/types"

interface StatusTabsProps {
  notes: Note[]
  activeStatus: string
  onStatusChange: (status: string) => void
}

export function StatusTabs({ notes, activeStatus, onStatusChange }: StatusTabsProps) {
  const statusCounts = {
    all: notes.length,
    todo: notes.filter((note) => note.status === "todo").length,
    "in-progress": notes.filter((note) => note.status === "in-progress").length,
    completed: notes.filter((note) => note.status === "completed").length,
  }

  const statusLabels = {
    all: "Toutes",
    todo: "À faire",
    "in-progress": "En cours",
    completed: "Terminées",
  }

  return (
    <Tabs value={activeStatus} onValueChange={onStatusChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusLabels).map(([status, label]) => (
          <TabsTrigger key={status} value={status} className="flex items-center gap-2">
            {label}
            <Badge variant="secondary" className="text-xs">
              {statusCounts[status as keyof typeof statusCounts]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
