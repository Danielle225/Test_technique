"use client"

import { useState } from "react"
import type { Note } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Share2, Globe, Users } from "lucide-react"
import { SharingService } from "@/services/sharing.service"
import { useToast } from "@/contexts/ToastContext"
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/utils"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  note: Note | null
}

export function ShareModal({ isOpen, onClose, note }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("lecture")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedPublicLink, setCopiedPublicLink] = useState(false)
  const [isCreatingPublicLink, setIsCreatingPublicLink] = useState(false)
  const { addToast } = useToast()

  if (!note) return null

  const handleShareWithUser = async () => {
    if (!email.trim()) {
      addToast({
        type: "erreur",
        message: "Veuillez saisir une adresse email",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await SharingService.shareNoteWithUser(note.id, email.trim())
      addToast({
        type: "reussi",
        message: getApiSuccessMessage(result, "Note partagée avec succès"),
      })
      setEmail("")
      onClose()
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors du partage"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPublicLink = async () => {
    if (note.public_token) {
      const publicUrl = `${window.location.origin}/public/${note.public_token}`
      try {
        await navigator.clipboard.writeText(publicUrl)
        setCopiedPublicLink(true)
        addToast({
          type: "reussi",
          message: "Lien copié dans le presse-papier",
        })
        setTimeout(() => setCopiedPublicLink(false), 2000)
      } catch (error) {
        addToast({
          type: "erreur",
          message: "Erreur lors de la copie du lien",
        })
      }
    }
  }

  const handleCreatePublicLink = async () => {
    setIsCreatingPublicLink(true)
    try {
      const result = await SharingService.createPublicLink(note.id)
      addToast({
        type: "reussi",
        message: getApiSuccessMessage(result, "Lien public créé avec succès"),
      })
      // Ici vous devriez mettre à jour la note avec le nouveau token
      // Cela dépend de votre gestion d'état globale
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la création du lien public"),
      })
    } finally {
      setIsCreatingPublicLink(false)
    }
  }

  const handleRevokePublicLink = async () => {
    try {
      const result = await SharingService.revokePublicLink(note.id)
      addToast({
        type: "reussi",
        message: getApiSuccessMessage(result, "Lien public révoqué"),
      })
      // Ici vous devriez mettre à jour la note pour retirer le token
    } catch (error: any) {
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error, "Erreur lors de la révocation du lien"),
      })
    }
  }

  const getVisibilityInfo = () => {
    switch (note.visibilite) {
      case "prive":
        return {
          icon: <Users className="h-4 w-4" />,
          label: "Privé",
          description: "Seul vous pouvez voir cette note",
          color: "bg-gray-100 text-gray-800"
        }
      case "partage":
        return {
          icon: <Share2 className="h-4 w-4" />,
          label: "Partagé",
          description: "Note partagée avec des utilisateurs spécifiques",
          color: "bg-blue-100 text-blue-800"
        }
      case "public":
        return {
          icon: <Globe className="h-4 w-4" />,
          label: "Public",
          description: "Accessible à tous via un lien public",
          color: "bg-green-100 text-green-800"
        }
    }
  }

  const visibilityInfo = getVisibilityInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Partager la note
          </DialogTitle>
          <DialogDescription>
            Partagez "{note.titre}" avec d'autres utilisateurs ou générez un lien public.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statut actuel de visibilité */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Visibilité actuelle :</span>
            <Badge className={visibilityInfo.color}>
              {visibilityInfo.icon}
              {visibilityInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{visibilityInfo.description}</p>

          {/* Lien public (si disponible) */}
          {note.visibilite === "public" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lien public</Label>
              {note.public_token ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/public/${note.public_token}`}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPublicLink}
                      className="px-3"
                    >
                      {copiedPublicLink ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevokePublicLink}
                    className="text-red-600 hover:text-red-700"
                  >
                    Révoquer le lien public
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleCreatePublicLink}
                  disabled={isCreatingPublicLink}
                  className="w-full"
                >
                  {isCreatingPublicLink ? "Création..." : "Créer un lien public"}
                </Button>
              )}
            </div>
          )}

          {/* Partage avec un utilisateur */}
          {note.visibilite !== "prive" && (
            <div className="space-y-3">
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Partager avec un utilisateur</Label>
                <div className="mt-2 space-y-3">
                  <div>
                    <Label htmlFor="email" className="text-sm">
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Permission</Label>
                    <Select value={permission} onValueChange={setPermission}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lecture">Lecture seule</SelectItem>
                        <SelectItem value="ecriture">Lecture et écriture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {note.visibilite === "prive" && (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              Cette note est privée. Changez la visibilité vers "Partagé" ou "Public" pour pouvoir la partager.
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {note.visibilite !== "prive" && (
            <Button onClick={handleShareWithUser} disabled={isLoading}>
              {isLoading ? "Partage..." : "Partager"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
