import { motion, useMotionTemplate, useTransform } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ParticleField } from '@/components/particles/ParticleField'
import { images } from '@/data/images'

function EyesStatic() {
  const portrait = images.kali.primary
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-obsidian">
      <img
        src={portrait.src}
        alt={portrait.alt}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        style={{ objectPosition: portrait.position }}
      />
      <div className="absolute inset-0 bg-obsidian/60" />
      <div className="relative z-10 px-6 text-center">
        <p className="font-display text-3xl tracking-[0.15em] text-ivory md:text-5xl">SEE.</p>
        <p className="mt-4 font-display text-2xl leading-snug text-ivory md:text-4xl">
          THE ONE WHO SEES BEYOND TIME.
        </p>
      </div>
    </section>
  )
}

/**
 * SCENE 02 — THE EYES.
 * Motion language: zoom + glow. A soft circular aperture — built from a
 * scroll-linked CSS mask, not a static crop — slowly widens on her face
 * while the camera eases back. One of the two moments in the site where
 * nothing else is allowed to compete for attention.
 */
export function EyesScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const portrait = images.kali.primary

  const radius = useTransform(progress, [0, 0.5, 1], [7, 24, 58])
  const radiusSoft = useTransform(radius, (v) => v + 18)
  const maskImage = useMotionTemplate`radial-gradient(circle at 50% 28%, black ${radius}%, transparent ${radiusSoft}%)`

  const imageScale = useTransform(progress, [0, 1], [1.85, 1.45])
  const glowOpacity = useTransform(progress, [0, 0.4, 0.7, 1], [0, 0.5, 0.32, 0.12])
  const line1Opacity = useTransform(progress, [0.08, 0.22, 0.36], [0, 1, 0])
  const line2Opacity = useTransform(progress, [0.48, 0.64, 0.86], [0, 1, 0])

  if (reducedMotion) return <EyesStatic />

  return (
    <section ref={ref} className="relative h-[240vh] bg-obsidian">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            scale: imageScale,
            transformOrigin: '50% 28%',
            WebkitMaskImage: maskImage,
            maskImage,
          }}
        >
          <img
            src={portrait.src}
            alt={portrait.alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: portrait.position }}
            loading="eager"
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-screen"
          style={{
            opacity: glowOpacity,
            background: 'radial-gradient(circle at 50% 28%, rgba(227,196,106,0.5), rgba(122,17,24,0.25) 45%, transparent 70%)',
          }}
        />

        <ParticleField
          className="absolute inset-0"
          variant="ember"
          count={36}
          palette={['227,196,106', '122,17,24']}
          opacity={0.55}
        />

        <div className="absolute inset-0 vignette" />

        <motion.p
          style={{ opacity: line1Opacity }}
          className="absolute inset-x-0 top-[68%] px-6 text-center font-display text-3xl tracking-[0.15em] text-ivory md:text-5xl"
        >
          SEE.
        </motion.p>

        <motion.h2
          style={{ opacity: line2Opacity }}
          className="absolute inset-x-0 top-[68%] px-6 text-center font-display text-3xl leading-[1.2] text-ivory md:text-5xl"
        >
          THE ONE
          <br />
          WHO SEES
          <br />
          BEYOND TIME.
        </motion.h2>
      </div>
    </section>
  )
}
