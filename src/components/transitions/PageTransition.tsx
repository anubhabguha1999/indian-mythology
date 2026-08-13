import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageVariants, veilVariants } from '@/animations/transitions'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Wraps each route. A gold veil sweeps left-to-right while the outgoing
 * page darkens and the incoming one resolves beneath it — a single ~900ms
 * beat standing in for a hard cut.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[150] origin-left bg-gradient-to-r from-transparent via-divine/60 to-transparent"
          variants={veilVariants}
          initial="initial"
          animate="animate"
        />
      )}
      {children}
    </motion.div>
  )
}
