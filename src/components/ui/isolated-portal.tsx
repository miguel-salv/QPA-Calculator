"use client"

import * as React from "react"
import { createPortal } from "react-dom"

interface IsolatedPortalProps {
  children: React.ReactNode
}

/**
 * A Portal component that isolates its children in the document body
 * to prevent them from affecting the layout of the main page
 */
export function IsolatedPortal({ children }: IsolatedPortalProps) {
  const [mounted, setMounted] = React.useState(false)
  const portalRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    // Create the portal container if it doesn't exist
    if (!document.getElementById("isolated-portal-root")) {
      const portalRoot = document.createElement("div")
      portalRoot.id = "isolated-portal-root"
      portalRoot.style.position = "fixed"
      portalRoot.style.top = "0"
      portalRoot.style.left = "0"
      portalRoot.style.width = "100vw"
      portalRoot.style.height = "100vh"
      portalRoot.style.pointerEvents = "none"
      portalRoot.style.zIndex = "9999"
      document.body.appendChild(portalRoot)
    }

    // Create a new div for this specific portal instance
    const portalDiv = document.createElement("div")
    portalDiv.style.position = "absolute"
    portalDiv.style.top = "0"
    portalDiv.style.left = "0"
    portalDiv.style.width = "100%"
    portalDiv.style.height = "100%"
    portalDiv.style.pointerEvents = "none"
    
    // Append the div to the portal root
    document.getElementById("isolated-portal-root")?.appendChild(portalDiv)
    portalRef.current = portalDiv
    
    // Mark as mounted
    setMounted(true)

    // Cleanup on unmount
    return () => {
      if (portalRef.current) {
        document.getElementById("isolated-portal-root")?.removeChild(portalRef.current)
      }
    }
  }, [])

  // Only render children once mounted on the client
  if (!mounted || !portalRef.current) {
    return null
  }

  return createPortal(
    <div 
      style={{ 
        position: "absolute", 
        pointerEvents: "auto" 
      }}
    >
      {children}
    </div>,
    portalRef.current
  )
}