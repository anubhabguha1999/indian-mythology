import { motion, useScroll, useTransform } from 'framer-motion'
import { UI_COOL } from '../mahadevPalette'

/**
 * Bottom-right, per the brief: a very thin vertical line and the word
 * SCROLL — nothing else. The line's fill progresses with the whole
 * cinematic timeline; no chapter numbers here (that's ChapterIndicator's
 * job, kept deliberately separate on the opposite edge of the screen).
 */
export function ScrollIndicator() {
  const { scrollYProgress } = useScroll()
  const fillPercent = useTransform(scrollYProgress, [0, 0.97], ['0%', '100%'])
  const labelOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0])

  return (
    <div className="pointer-events-none fixed bottom-9 right-6 z-30 hidden flex-col items-center gap-3 md:right-10 md:flex">
      <div className="relative h-24 w-px bg-ivory/12">
        <motion.div aria-hidden="true" className="absolute inset-x-0 top-0" style={{ height: fillPercent, backgroundColor: UI_COOL }} />
      </div>
      <motion.span
        style={{ opacity: labelOpacity, writingMode: 'vertical-rl' }}
        className="rotate-180 font-sans text-[9px] tracking-[0.4em] text-ivory/35"
      >
        SCROLL
      </motion.span>
    </div>
  )
}
