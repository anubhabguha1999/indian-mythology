import { AnimatePresence, motion, useMotionTemplate, useTransform } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useActiveSegment } from '@/hooks/useActiveSegment'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Mandala } from './Mandala'
import { images } from '@/data/images'

const STAGES = ['THE CROWN', 'THE HAIR', 'THE FACE', 'THE EYES', 'THE ARMS', 'THE ORNAMENTS', 'THE SILHOUETTE', 'THE AURA']

function RevelationStatic() {
  const portrait = images.kali.primary
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-obsidian py-24">
      <img
        src={portrait.src}
        alt={portrait.alt}
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        style={{ objectPosition: portrait.position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-obsidian/60" />
      <ul className="relative z-10 flex flex-wrap justify-center gap-x-6 gap-y-2 px-6">
        {STAGES.map((s) => (
          <li key={s} className="font-sans text-[11px] tracking-[0.3em] text-ivory/70">
            {s}
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * SCENE 03 — THE REVELATION.
 * Motion language: mask + clip-path + scale. She emerges top-down out of
 * total darkness in one continuous wipe, sharpening as she goes, while
 * eight small captions name what's surfacing — not eight separate images,
 * one deity, arriving in stages.
 */
export function RevelationScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const portrait = images.kali.primary
  const stage = useActiveSegment(progress, STAGES.length)

  const revealTop = useTransform(progress, [0.05, 0.88], [100, 0])
  const clipPath = useMotionTemplate`inset(${revealTop}% 0% 0% 0%)`

  const blurAmt = useTransform(progress, [0.05, 0.5], [20, 0])
  const brightness = useTransform(progress, [0.05, 0.55], [0.25, 1])
  const filter = useMotionTemplate`blur(${blurAmt}px) brightness(${brightness})`

  const imageScale = useTransform(progress, [0.05, 1], [1.24, 1.02])
  const auraOpacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 0.28, 0.55, 0.8])
  const auraScale = useTransform(progress, [0, 1], [0.7, 1.35])
  const mandalaRotate = useTransform(progress, [0, 1], [0, 60])
  const captionOpacity = useTransform(progress, [0, 0.04, 0.9, 1], [0, 1, 1, 0])

  if (reducedMotion) return <RevelationStatic />

  return (
    <section ref={ref} className="relative h-[300vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: auraOpacity }}
        >
          <motion.div
            className="h-[36rem] w-[36rem] rounded-full bg-radial-ember blur-3xl md:h-[46rem] md:w-[46rem]"
            style={{ scale: auraScale }}
          />
        </motion.div>

        <Mandala
          size={640}
          opacity={0.22}
          color="#B99345"
          rotate={mandalaRotate}
          className="absolute"
        />

        <motion.div className="absolute inset-0" style={{ clipPath, WebkitClipPath: clipPath }}>
          <motion.img
            src={portrait.src}
            alt={portrait.alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: portrait.position, scale: imageScale, filter }}
            loading="eager"
          />
        </motion.div>

        <div className="absolute inset-0 vignette" />

        <motion.div
          style={{ opacity: captionOpacity }}
          className="absolute bottom-14 left-6 flex items-center gap-3 md:bottom-16 md:left-16"
        >
          <span className="h-px w-8 bg-divine/70" />
          <AnimatePresence mode="wait">
            <motion.span
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-[11px] tracking-[0.35em] text-ivory/70"
            >
              {STAGES[stage]}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
