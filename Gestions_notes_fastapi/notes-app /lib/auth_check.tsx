'use client'
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const IsAuthenticated = ({ children }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  return children
}
