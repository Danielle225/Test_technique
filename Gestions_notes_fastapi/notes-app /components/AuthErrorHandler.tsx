"use client"

import { useAuthErrorHandler } from "../hooks/useAuthErrorHandler"

export function AuthErrorHandler() {
  useAuthErrorHandler()
  return null 
}
