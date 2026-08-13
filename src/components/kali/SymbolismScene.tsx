import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useActiveSegment } from '@/hooks/useActiveSegment'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RevealText } from '@/components/typography/RevealText'
import { images } from '@/data/images'
import { symbolism, type SymbolismConcept } from '@/data/kali'

function SymbolismStatic() {
  return (
    <section className="bg-obsidian px-6 py-24 md:px-16">
      <p className="font-serif text-lg italic text-ivory/50 md:text-xl">Nothing here is without meaning.</p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {symbolism.map((s) => (
          <div key={s.id} className="border-l border-ivory/10 pl-6">
            <h3 className="font-display text-3xl tracking-wide text-ivory">
              {s.word}
              {s.morphsInto && <span className="text-divine"> → {s.morphsInto}</span>}
            </h3>
            <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ivory/60">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ConceptWord({ concept }: { concept: SymbolismConcept }) {
  const [morphed, setMorphed] = useState(false)

  useEffect(() => {
    setMorphed(false)
    if (!concept.morphsInto) return
    const t = setTimeout(() => setMorphed(true), 1500)
    return () => clearTimeout(t)
  }, [concept.id, concept.morphsInto])

  const word = morphed && concept.morphsInto ? concept.morphsInto : concept.word

  return (
    <AnimatePresence mode="wait">
      <motion.h3
        key={word}
        initial={{ opacity: 0, letterSpacing: '0.02em', filter: 'blur(10px)' }}
        animate={{ opacity: 1, letterSpacing: '0.08em', filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[16vw] leading-none text-ivory md:text-[10vw]"
      >
        {word}
      </motion.h3>
    </AnimatePresence>
  )
}

/**
 * SCENE 05 — THE SYMBOLISM.
 * Motion language: giant type + morph. Each concept fills the screen as a
 * single word; "transformation" quietly resolves into "liberation" before
 * the scene moves on.
 */
export function SymbolismScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const active = useActiveSegment(progress, symbolism.length)
  const concept = symbolism[active]
  const bg = images.kali.seated

  if (reducedMotion) return <SymbolismStatic />

  return (
    <section ref={ref} className="relative h-[330vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <img
          src={bg.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12] blur-2xl saturate-50"
          style={{ objectPosition: bg.position }}
        />
        <div className="absolute inset-0 bg-obsidian/60" />

        <div className="absolute inset-x-0 top-10 flex justify-center px-6 text-center md:top-14">
          <RevealText
            text={'NOTHING HERE\nIS WITHOUT MEANING.'}
            as="p"
            className="font-serif text-lg italic text-ivory/50 md:text-xl"
          />
        </div>

        <div className="relative z-10 text-center">
          <ConceptWord key={concept.id} concept={concept} />
          <AnimatePresence mode="wait">
            <motion.p
              key={concept.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-lg px-6 font-sans text-sm leading-relaxed text-ivory/60 md:text-base"
            >
              {concept.description}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 flex gap-1.5">
          {symbolism.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 w-5 rounded-full transition-colors duration-500 ${
                i === active ? 'bg-divine' : 'bg-ivory/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
