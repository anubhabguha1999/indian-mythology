import { motion, useTransform } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Mandala } from './Mandala'
import { images } from '@/data/images'

const ORBIT_DOTS = 12

function DanceStatic() {
  const portrait = images.kali.secondary
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center gap-10 overflow-hidden bg-obsidian py-24">
      <div className="relative h-64 w-64 overflow-hidden rounded-full border border-divine/20">
        <img
          src={portrait.src}
          alt={portrait.alt}
          className="h-full w-full object-cover"
          style={{ objectPosition: portrait.position }}
        />
      </div>
      <p className="px-6 text-center font-display text-3xl tracking-wide text-ivory md:text-5xl">TIME DEVOURS ALL.</p>
      <p className="px-6 text-center font-display text-3xl tracking-wide text-divine md:text-5xl">
        EXCEPT THE ETERNAL.
      </p>
    </section>
  )
}

/**
 * SCENE 07 — THE DANCE OF TIME.
 * Motion language: orbit + rotation + a single gold flood. She stays
 * still and dignified at the centre; everything else — the mandala, the
 * light, twelve orbiting embers — moves around her.
 */
export function DanceScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const portrait = images.kali.secondary

  const ringRotate = useTransform(progress, [0, 1], [0, 220])
  const ringRotateReverse = useTransform(progress, [0, 1], [0, -140])
  const bgRotate = useTransform(progress, [0, 1], [0, 90])
  const portraitOpacity = useTransform(progress, [0, 0.08, 0.6, 0.92], [0, 1, 1, 0.85])
  const portraitScale = useTransform(progress, [0, 0.6, 1], [0.92, 1, 1.04])

  const floodOpacity = useTransform(progress, [0.6, 0.72, 0.79, 0.86], [0, 1, 1, 0])
  const darken = useTransform(progress, [0.78, 0.88], [0, 0.92])
  const text1Opacity = useTransform(progress, [0.83, 0.89, 0.94], [0, 1, 0])
  const text2Opacity = useTransform(progress, [0.94, 0.99, 1], [0, 1, 1])

  if (reducedMotion) return <DanceStatic />

  return (
    <section ref={ref} className="relative h-[320vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute h-[60rem] w-[60rem] rounded-full bg-[radial-gradient(circle,rgba(122,17,24,0.35),transparent_60%)]"
          style={{ rotate: bgRotate }}
        />

        <Mandala size={560} opacity={0.28} rotate={ringRotate} className="absolute" />
        <Mandala size={760} opacity={0.14} color="#7A1118" rotate={ringRotateReverse} className="absolute" />

        <motion.div className="absolute" style={{ rotate: ringRotate }}>
          {Array.from({ length: ORBIT_DOTS }).map((_, i) => {
            const angle = (360 / ORBIT_DOTS) * i * (Math.PI / 180)
            const radius = 230
            return (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-divine shadow-[0_0_10px_2px_rgba(227,196,106,0.7)]"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                }}
              />
            )
          })}
        </motion.div>

        <motion.div
          className="relative h-[62vh] w-[62vh] max-w-[92vw] overflow-hidden rounded-full border border-divine/20 shadow-[0_0_120px_20px_rgba(122,17,24,0.35)]"
          style={{ opacity: portraitOpacity, scale: portraitScale }}
        >
          <img
            src={portrait.src}
            alt={portrait.alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: portrait.position }}
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-screen"
          style={{
            opacity: floodOpacity,
            background: 'radial-gradient(circle, rgba(227,196,106,0.95), rgba(184,90,20,0.5) 55%, transparent 80%)',
          }}
        />
        <motion.div aria-hidden="true" className="absolute inset-0 bg-obsidian" style={{ opacity: darken }} />

        <motion.p
          style={{ opacity: text1Opacity }}
          className="absolute px-6 text-center font-display text-4xl tracking-wide text-ivory md:text-6xl"
        >
          TIME DEVOURS ALL.
        </motion.p>
        <motion.p
          style={{ opacity: text2Opacity }}
          className="absolute px-6 text-center font-display text-4xl tracking-wide text-divine md:text-6xl"
        >
          EXCEPT THE ETERNAL.
        </motion.p>
      </div>
    </section>
  )
}
