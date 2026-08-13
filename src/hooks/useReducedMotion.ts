import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitial() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(QUERY).matches
}

/**
 * Tracks the user's OS-level reduced-motion preference, live.
 * Every scene checks this before enabling parallax, particles or
 * scroll-linked transforms — see individual scene components.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitial)

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
