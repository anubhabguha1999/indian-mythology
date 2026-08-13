import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Drives inertia-based smooth scrolling for the whole app. Lenis nudges the
 * native scroll position each frame, so IntersectionObserver and Framer
 * Motion's `useScroll` (window-based) keep working without any extra glue.
 * Disabled outright under reduced-motion — scroll then jumps natively.
 */
export function useLenis(enabled: boolean, onInstance?: (lenis: Lenis | null) => void) {
  useEffect(() => {
    if (!enabled) {
      onInstance?.(null)
      return
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    onInstance?.(lenis)

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      onInstance?.(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
