import { useEffect, useRef, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import { CHAPTERS } from '../chapters'
import { uiAccentFor } from '../hanumanPalette'

/**
 * A tiny, left-edge indicator — one chapter visible at a time, briefly, on
 * transitions, per the brief's own "should appear briefly during
 * transitions" instruction. Same mechanism as mahadev/ui/ChapterIndicator.tsx.
 */
export function ChapterIndicator() {
  const { scrollYProgress } = useScroll()
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const hideTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      let idx = 0
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (v >= CHAPTERS[i].t) idx = i
      }
      setActiveIndex((prev) => {
        if (prev === idx) return prev
        setVisible(true)
        window.clearTimeout(hideTimer.current)
        hideTimer.current = window.setTimeout(() => setVisible(false), 2400)
        return idx
      })
    })
  }, [scrollYProgress])

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const active = CHAPTERS[activeIndex]
  const accent = uiAccentFor(active.t)

  return (
    <div className="pointer-events-none fixed left-6 top-28 z-30 hidden flex-col items-start gap-3 md:left-10 md:flex">
      <motion.span
        aria-hidden="true"
        animate={{ scaleY: visible ? 1 : 0.3, opacity: visible ? 1 : 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="h-10 w-px origin-top"
        style={{ backgroundColor: accent }}
      />
      <motion.div
        animate={{ opacity: visible ? 1 : 0.32, x: visible ? 0 : -4 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-1"
      >
        <span className="font-display text-sm leading-none tracking-widest text-ivory/50">{active.n}</span>
        <span className="whitespace-nowrap font-sans text-[10px] tracking-[0.35em]" style={{ color: accent }}>
          {active.label}
        </span>
      </motion.div>
    </div>
  )
}
