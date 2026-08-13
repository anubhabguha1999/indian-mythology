import { useRef, type RefObject } from 'react'
import { useScroll, type MotionValue } from 'framer-motion'

type Edge = 'start' | 'end' | 'center'
type Offset = `${Edge} ${Edge}`

/**
 * Convenience wrapper around Framer Motion's `useScroll`, scoped to a single
 * element. Returns the ref to attach and a 0→1 MotionValue tracking that
 * element's transit through the viewport — the basis for every pinned /
 * scroll-linked sequence in the site (the Void, the Revelation, the Dance…).
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  offset: [Offset, Offset] = ['start end', 'end start'],
): { ref: RefObject<T | null>; progress: MotionValue<number> } {
  const ref = useRef<T>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { ref, progress: scrollYProgress }
}
