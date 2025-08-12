"use client"

import { useEffect } from 'react'

export function DebugComponent() {
  useEffect(() => {
    console.log("=== NETTOYAGE COMPLET ===")
    
    if (typeof window !== 'undefined') {
      const keysToRemove = []
      
      Object.keys(localStorage).forEach(key => {
        try {
          const value = localStorage.getItem(key)
          if (value && value.startsWith('{')) {
            const parsed = JSON.parse(value)
            
            if (parsed && typeof parsed === 'object') {
              const hasUserKeys = ('id' in parsed && ('nom' in parsed || 'email' in parsed))
              if (hasUserKeys) {
                console.log(`🧹 Removing user-like object from ${key}:`, parsed)
                keysToRemove.push(key)
              }
            }
          }
        } catch (e) {
          console.log(`Error parsing ${key}:`, e)
        }
      })
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }, [])

  return null
}