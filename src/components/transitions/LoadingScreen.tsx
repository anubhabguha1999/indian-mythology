import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Step = 'ember' | 'devanagari' | 'roman' | 'entering' | 'done'

/**
 * The first thing anyone sees. A point becomes a glowing circle, names
 * itself twice (देवनागरी, then Roman), announces entry, and dissolves —
 * under ~2s on desktop, faster still under reduced motion. Part of the
 * experience, not a spinner to wait out.
 *
 * Defaults to Kali's own naming/colour, but this fires on the very first
 * app mount regardless of which route the visitor actually landed on —
 * hardcoding "KALI"/"काली" here meant it announced the wrong deity in
 * front of every other page on the site, /shiva included. App.tsx passes
 * the right name/colour in per route; these defaults only cover routes
 * that don't override them.
 */
export function LoadingScreen({
  onComplete,
  devanagari = 'काली',
  roman = 'KALI',
  gradient = 'radial-gradient(circle, rgba(227,196,106,0.95) 0%, rgba(122,17,24,0.4) 52%, transparent 76%)',
}: {
  onComplete: () => void
  devanagari?: string
  roman?: string
  gradient?: string
}) {
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState<Step>('ember')

  useEffect(() => {
    const t = reducedMotion ? [140, 280, 420, 600] : [520, 980, 1420, 1900]
    const timers = [
      setTimeout(() => setStep('devanagari'), t[0]),
      setTimeout(() => setStep('roman'), t[1]),
      setTimeout(() => setStep('entering'), t[2]),
      setTimeout(() => setStep('done'), t[3]),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reducedMotion])

  useEffect(() => {
    if (step !== 'done') return
    const t = setTimeout(onComplete, reducedMotion ? 150 : 560)
    return () => clearTimeout(t)
  }, [step, onComplete, reducedMotion])

  return (
    <AnimatePresence>
      {step !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-obsidian"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
        >
          <motion.div
            className="relative flex items-center justify-center rounded-full"
            initial={{ width: 6, height: 6, opacity: 0 }}
            animate={{ width: step === 'ember' ? 6 : 210, height: step === 'ember' ? 6 : 210, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: gradient }}
          >
            <AnimatePresence mode="wait">
              {step === 'devanagari' && (
                <motion.span
                  key="d"
                  className="font-deva text-3xl text-ivory"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {devanagari}
                </motion.span>
              )}
              {step === 'roman' && (
                <motion.span
                  key="r"
                  className="font-display text-sm tracking-[0.45em] text-ivory"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {roman}
                </motion.span>
              )}
              {step === 'entering' && (
                <motion.span
                  key="e"
                  className="font-sans text-[10px] tracking-[0.4em] text-gold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ENTERING
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
