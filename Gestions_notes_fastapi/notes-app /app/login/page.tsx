"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { getApiErrorMessage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  // 🔧 Plus de redirection ici, c'est géré dans AuthContext
  // useEffect(() => {
  //   if (user && !loading) {
  //     console.log("🚀 Utilisateur connecté détecté, redirection FORCÉE vers /dashboard")
  //     console.log("👤 Utilisateur:", user)
  //     console.log("📍 URL actuelle:", window.location.pathname)
      
  //     // 🔧 Redirection immédiate et forcée
  //     window.location.href = '/dashboard'
  //   }
  // }, [user, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const loggedUser = await login(email, password)
      console.log("✅ Utilisateur connecté:", loggedUser)
      
      addToast({
        type: "reussi",
        message: "Connexion réussie ! Redirection en cours...",
      })
      
    } catch (error) {
      console.error("❌ Erreur de connexion:", error)
      addToast({
        type: "erreur",
        message: getApiErrorMessage(error as any, "Erreur de connexion"),
      })
    } finally {
      setLoading(false)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    addToast({
      type: "info",
      message: "Stockage vidé, page rechargée.",
    })
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <p className="text-center text-gray-600">Connectez-vous à votre compte</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* 🔧 Bouton de redirection manuelle si bloqué */}
          {user && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 text-sm mb-2">
                ✅ Connexion réussie ! Si la redirection ne fonctionne pas :
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="w-full"
                variant="outline"
              >
                🚀 Aller au Dashboard
              </Button>
            </div>
          )}

          {/* 🔧 Bouton de debug optionnel */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={clearStorage} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                🔧 Vider le cache (Debug)
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}