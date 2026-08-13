import { motion, useTransform } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CinematicButton } from '@/components/cinematic/CinematicButton'

function FinalStatic() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-6 bg-obsidian px-6 py-24 text-center">
      <div className="h-6 w-6 rounded-full bg-[radial-gradient(circle,rgba(227,196,106,0.95),rgba(122,17,24,0.4)_50%,transparent_75%)]" />
      <p className="font-display text-2xl leading-tight text-ivory md:text-4xl">
        THE STORY DOES NOT END.
        <br />
        THE MOTHER REMAINS.
      </p>
      <p className="font-deva text-3xl text-divine md:text-5xl">माँ काली</p>
      <CinematicButton to="/archive" variant="line">
        Enter The Archive
      </CinematicButton>
    </section>
  )
}

/**
 * FINAL SCENE.
 * Motion language: fade + light expansion — the Void's mirror image. The
 * same ember that opened the site returns, floods gold once, and settles
 * into darkness with a single line to the Archive. No button, no banner.
 */
export function FinalScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])

  const emberScale = useTransform(progress, [0, 0.6, 0.85, 1], [0.5, 1, 14, 22])
  const emberOpacity = useTransform(progress, [0, 0.2, 0.85, 0.95], [0.25, 0.6, 1, 0.5])

  const text1Opacity = useTransform(progress, [0.08, 0.18, 0.3], [0, 1, 0])
  const text2Opacity = useTransform(progress, [0.38, 0.5, 0.62], [0, 1, 0])
  const text3Opacity = useTransform(progress, [0.64, 0.74, 0.82], [0, 1, 0])

  const blackout = useTransform(progress, [0.85, 0.97], [0, 1])
  const ctaOpacity = useTransform(progress, [0.93, 1], [0, 1])
  const ctaPointer = useTransform(progress, (v) => (v > 0.92 ? 'auto' : 'none'))

  if (reducedMotion) return <FinalStatic />

  return (
    <section ref={ref} className="relative h-[260vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(227,196,106,0.95),rgba(122,17,24,0.4)_50%,transparent_75%)] blur-md"
          style={{ scale: emberScale, opacity: emberOpacity }}
        />

        <motion.p
          style={{ opacity: text1Opacity }}
          className="absolute px-6 text-center font-display text-3xl leading-tight text-ivory md:text-5xl"
        >
          THE STORY
          <br />
          DOES NOT END.
        </motion.p>
        <motion.p
          style={{ opacity: text2Opacity }}
          className="absolute px-6 text-center font-display text-3xl leading-tight text-ivory md:text-5xl"
        >
          THE MOTHER
          <br />
          REMAINS.
        </motion.p>
        <motion.p
          style={{ opacity: text3Opacity }}
          className="absolute px-6 text-center font-deva text-4xl text-divine md:text-6xl"
        >
          माँ काली
        </motion.p>

        <motion.div aria-hidden="true" className="absolute inset-0 bg-obsidian" style={{ opacity: blackout }} />

        <motion.div style={{ opacity: ctaOpacity, pointerEvents: ctaPointer }} className="absolute">
          <CinematicButton to="/archive" variant="line">
            Enter The Archive
          </CinematicButton>
        </motion.div>
      </div>
    </section>
  )
}
