import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * A tiny gold dot that expands into a labeled ring over anything carrying
 * `data-cursor="EXPLORE" | "VIEW" | "OPEN"`. Desktop, fine-pointer only —
 * disabled entirely on touch devices and under reduced motion.
 */
export function CustomCursor() {
  const hasFinePointer = useHasFinePointer()
  const reducedMotion = useReducedMotion()
  const cursorEnabled = hasFinePointer && !reducedMotion

  const [label, setLabel] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { damping: 32, stiffness: 420, mass: 0.4 })
  const springY = useSpring(y, { damping: 32, stiffness: 420, mass: 0.4 })

  useEffect(() => {
    document.documentElement.classList.toggle('custom-cursor', cursorEnabled)
    return () => document.documentElement.classList.remove('custom-cursor')
  }, [cursorEnabled])

  useEffect(() => {
    if (!cursorEnabled) return

    function handleMove(e: MouseEvent) {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    function handleOver(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null
      if (target) {
        setLabel(target.dataset.cursor ?? null)
        setHovering(true)
      }
    }
    function handleOut(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest?.('[data-cursor]')
      if (target) {
        setHovering(false)
        setLabel(null)
      }
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [cursorEnabled, x, y])

  if (!cursorEnabled) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full border bg-obsidian/30 backdrop-blur-[1px]"
        animate={{
          width: hovering ? 72 : 8,
          height: hovering ? 72 : 8,
          borderColor: hovering ? 'rgba(227,196,106,0.85)' : 'rgba(227,196,106,0.6)',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {!hovering && <span className="block h-1.5 w-1.5 rounded-full bg-divine" />}
        {hovering && label && (
          <span className="font-sans text-[9px] font-medium tracking-[0.25em] text-divine">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}
