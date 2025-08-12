"use client"

import React from 'react'

const originalCreateElement = React.createElement

React.createElement = function(type, props, ...children) {
  children.forEach((child, index) => {
    if (child && typeof child === 'object' && !React.isValidElement(child)) {
      if ('nom' in child || ('id' in child && 'nom' in child)) {
        console.error('🚨 OBJET PROBLÉMATIQUE DÉTECTÉ dans createElement:', child)
        console.trace('Stack trace de l\'erreur:')
        throw new Error(`OBJET TROUVÉ: ${JSON.stringify(child)} dans le composant ${type}`)
      }
    }
  })
  
  return originalCreateElement.apply(this, [type, props, ...children])
}

export function ReactDebugger() {
  return null
}
