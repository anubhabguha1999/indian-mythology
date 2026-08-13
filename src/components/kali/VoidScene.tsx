import { motion, useTransform } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ParticleField } from '@/components/particles/ParticleField'

function VoidStatic() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center gap-8 bg-obsidian px-6 py-24 text-center">
      <div className="h-16 w-16 rounded-full bg-radial-ember opacity-60 blur-md" aria-hidden="true" />
      <p className="font-sans text-xs tracking-[0.5em] text-ivory/70">BEFORE THE LIGHT</p>
      <h2 className="font-display text-4xl leading-tight text-ivory md:text-6xl">
        THERE WAS
        <br />
        THE MOTHER.
      </h2>
    </section>
  )
}

/**
 * SCENE 01 — THE VOID.
 * Motion language: pure opacity + drifting particles. Nothing scales,
 * nothing masks — the only thing that happens here is that a point of
 * light very slowly decides to exist.
 */
export function VoidScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])

  const emberScale = useTransform(progress, [0, 0.5, 1], [0.3, 1, 2.6])
  const emberOpacity = useTransform(progress, [0, 0.15, 0.6, 1], [0.12, 0.5, 0.8, 0.25])
  const line1Opacity = useTransform(progress, [0.06, 0.2, 0.34], [0, 1, 0])
  const line2Opacity = useTransform(progress, [0.44, 0.6, 0.78], [0, 1, 0])
  const blackout = useTransform(progress, [0, 1], [0, 0.5])

  // Hooks above must run unconditionally (reducedMotion can flip live) —
  // the branch happens only here, at render output.
  if (reducedMotion) return <VoidStatic />

  return (
    <section ref={ref} className="relative h-[260vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <ParticleField className="absolute inset-0" variant="dust" count={64} opacity={0.5} />

        <motion.div
          aria-hidden="true"
          className="absolute h-[26rem] w-[26rem] rounded-full bg-radial-ember blur-3xl"
          style={{ scale: emberScale, opacity: emberOpacity }}
        />

        <motion.p
          style={{ opacity: line1Opacity }}
          className="absolute px-6 text-center font-sans text-xs tracking-[0.5em] text-ivory/70 md:text-sm"
        >
          BEFORE THE LIGHT
        </motion.p>

        <motion.h2
          style={{ opacity: line2Opacity }}
          className="absolute px-6 text-center font-display text-4xl leading-[1.15] text-ivory md:text-6xl"
        >
          THERE WAS
          <br />
          THE MOTHER.
        </motion.h2>

        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-obsidian"
          style={{ opacity: blackout }}
        />
      </div>
    </section>
  )
}
