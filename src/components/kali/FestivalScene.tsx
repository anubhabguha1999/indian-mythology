import { useMemo } from 'react'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useActiveSegment } from '@/hooks/useActiveSegment'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RevealText } from '@/components/typography/RevealText'
import { images } from '@/data/images'
import { festivalJourney } from '@/data/kali'

const MAX_LAMPS = 44

function FestivalStatic() {
  return (
    <section className="flex flex-col items-center gap-8 bg-[#1a1108] px-6 py-24 text-center">
      <h2 className="font-display text-3xl leading-tight text-ivory md:text-5xl">
        WHEN THE NIGHT
        <br />
        BECOMES LIGHT
      </h2>
      <ul className="flex flex-col gap-3">
        {festivalJourney.map((step) => (
          <li key={step.id}>
            <span className="font-sans text-[11px] tracking-[0.3em] text-divine">{step.label}</span>
            <p className="mt-1 font-serif text-lg italic text-gold/90">{step.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * SCENE 10 — FESTIVALS.
 * Motion language: accumulation. Darkness gives way not to a wipe or a
 * mask but to more and more points of light appearing, exactly as Kali
 * Pūjā night does.
 */
export function FestivalScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const active = useActiveSegment(progress, festivalJourney.length)
  const step = festivalJourney[active]
  const silhouette = images.kali.primary

  const warmth = useTransform(progress, [0, 0.7, 1], [0, 0.55, 0.85])
  const lampCount = Math.min(MAX_LAMPS, (active + 1) * Math.ceil(MAX_LAMPS / festivalJourney.length))

  const lamps = useMemo(
    () =>
      Array.from({ length: MAX_LAMPS }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${20 + ((i * 53) % 60)}%`,
        delay: (i % 7) * 0.05,
        size: 2 + (i % 3),
      })),
    [],
  )

  if (reducedMotion) return <FestivalStatic />

  return (
    <section ref={ref} className="relative h-[220vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            opacity: warmth,
            background: 'radial-gradient(circle at 50% 60%, rgba(227,196,106,0.35), transparent 65%)',
          }}
        />

        {active === festivalJourney.length - 1 && (
          <motion.img
            src={silhouette.src}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 h-full w-full object-cover contrast-125 brightness-[0.4] saturate-0"
            style={{ objectPosition: silhouette.position }}
          />
        )}

        <div className="absolute inset-0">
          <AnimatePresence>
            {lamps.slice(0, lampCount).map((lamp, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-divine"
                style={{
                  left: lamp.left,
                  top: lamp.top,
                  width: lamp.size,
                  height: lamp.size,
                  boxShadow: '0 0 12px 3px rgba(227,196,106,0.8)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: lamp.delay, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="relative z-10 px-6 text-center">
          <RevealText
            text={'WHEN THE NIGHT\nBECOMES LIGHT'}
            as="h2"
            className="font-display text-4xl leading-tight text-ivory md:text-6xl"
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mt-6 max-w-md font-serif text-lg italic text-gold/90 md:text-xl"
            >
              {step.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
