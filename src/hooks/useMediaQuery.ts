import { useEffect, useState } from 'react'

function getInitial(query: string) {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

/** Generic live media-query hook — used for breakpoints and pointer/hover capability checks. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getInitial(query))

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Coarse "is this a touch-first, small-viewport device" check used to simplify heavy scenes. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/** True only when the pointer can hover with fine precision — gates the custom cursor. */
export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}
