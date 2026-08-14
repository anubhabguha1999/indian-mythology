import { useEffect, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import { CHAPTERS } from '../chapters'
import { uiAccentFor } from '../hanumanPalette'

// CHAPTERS (chapters.ts) repeats "09 THE IMPOSSIBLE" as both the start of
// that beat and the t=1.0 end marker other files need for interpolation —
// collapsed here to one visible row. BLACKNESS is excluded entirely: per
// the brief's own "no UI, no text" opening, the very first stage shows no
// chapter label at all, not even a dim one — the whole indicator fades in
// once THE WIND actually begins (see the wrapper's opacity below).
const VISIBLE_CHAPTERS = CHAPTERS.filter((c, i) => c.label !== 'BLACKNESS' && (i === 0 || c.label !== CHAPTERS[i - 1].label))

/**
 * A persistent editorial timeline down the left edge — every chapter
 * visible the whole time, not just flashing briefly on transition. Only
 * the active one reads at full strength; the rest sit low-opacity, small,
 * present as structure the way a magazine's running folio is always
 * there without demanding attention. Replaces the old "flash for 2.4s
 * then hide" version, which gave a viewer no sense of where they were in
 * the journey outside that brief window.
 */
export function ChapterIndicator() {
  const { scrollYProgress } = useScroll()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      let idx = 0
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (v >= CHAPTERS[i].t) idx = i
      }
      setActiveIndex((prev) => (prev === idx ? prev : idx))
    })
  }, [scrollYProgress])

  const activeLabel = CHAPTERS[activeIndex].label
  const accent = uiAccentFor(CHAPTERS[activeIndex].t)
  const isBlackness = activeLabel === 'BLACKNESS'

  return (
    <motion.div
      animate={{ opacity: isBlackness ? 0 : 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 md:left-12 md:flex"
    >
      {VISIBLE_CHAPTERS.map((c) => {
        const isActive = c.label === activeLabel
        return (
          <div key={c.label} className="flex items-center gap-3">
            <motion.span
              aria-hidden="true"
              animate={{ width: isActive ? 22 : 10, opacity: isActive ? 1 : 0.28 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-px"
              style={{ backgroundColor: isActive ? accent : '#e8e2d8' }}
            />
            <motion.div
              animate={{ opacity: isActive ? 1 : 0.32, x: isActive ? 0 : -2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-baseline gap-2"
            >
              <span className="font-display text-[10px] leading-none tracking-widest text-ivory/45">{c.n}</span>
              <span
                className={`whitespace-nowrap font-sans text-[10px] tracking-[0.32em] ${isActive ? '' : 'text-ivory/50'}`}
                style={{ color: isActive ? accent : undefined }}
              >
                {c.label}
              </span>
            </motion.div>
          </div>
        )
      })}
    </motion.div>
  )
}
