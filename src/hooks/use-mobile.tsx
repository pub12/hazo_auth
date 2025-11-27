// file_description: hydration-safe hook to detect mobile viewport
// This hook prevents hydration mismatches by returning a consistent value
// during SSR and initial client render, only updating after hydration completes.
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Track whether component has mounted (hydration complete)
  const [isMounted, setIsMounted] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Mark as mounted after hydration
    setIsMounted(true)

    // Now safe to read window dimensions
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return false during SSR and initial hydration to prevent mismatch
  // Only return actual mobile state after component has mounted
  if (!isMounted) {
    return false
  }

  return isMobile
}
