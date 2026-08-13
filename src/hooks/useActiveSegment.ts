import { useState } from 'react'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'

/**
 * Divides a 0→1 scroll-progress value into `count` equal segments and
 * returns which one is currently active — the mechanism behind every
 * "camera moves to the next focal point" sequence (the Form, the
 * Symbolism, the Festival journey).
 */
export function useActiveSegment(progress: MotionValue<number>, count: number): number {
  const [active, setActive] = useState(0)

  useMotionValueEvent(progress, 'change', (v) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(v * count)))
    setActive((prev) => (prev === next ? prev : next))
  })

  return active
}
