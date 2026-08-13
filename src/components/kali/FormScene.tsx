import { AnimatePresence, motion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useActiveSegment } from '@/hooks/useActiveSegment'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RevealText } from '@/components/typography/RevealText'
import { images } from '@/data/images'
import { iconography } from '@/data/kali'

/** Full readable listing — the reduced-motion fallback, and reused as the /kali/symbolism recap. */
export function FormStatic() {
  return (
    <section className="bg-obsidian px-6 py-24 md:px-16">
      <h2 className="font-display text-3xl tracking-[0.2em] text-ivory md:text-4xl">THE FORM</h2>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {iconography.map((item) => (
          <div key={item.id} className="border-l border-ivory/10 pl-6">
            <span className="font-sans text-xs tracking-[0.3em] text-ivory/30">{item.index}</span>
            <p className="mt-2 font-deva text-xl text-divine/90">{item.sanskrit}</p>
            <h3 className="mt-1 font-display text-3xl tracking-wide text-ivory">{item.name}</h3>
            <p className="mt-2 font-serif text-lg italic text-gold/90">{item.meaning}</p>
            <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ivory/60">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Hand-tuned "camera" presets, one per element, mapped against the actual
 * portrait's layout. `transformOrigin` is set to match `position` on
 * purpose: object-fit: cover already re-centers a tall portrait inside a
 * wide viewport, so a plain `scale()` zooms from the *viewport's* centre,
 * not the focal point — pinning the origin to the same coordinate keeps
 * the zoom anchored on the element it's meant to be approaching.
 */
const FRAMING = [
  { scale: 1.7, position: '50% 8%' }, // crown
  { scale: 2.6, position: '50% 19%' }, // eyes
  { scale: 2.8, position: '49% 22%' }, // tongue
  { scale: 1.15, position: '50% 17%' }, // arms
  { scale: 2.2, position: '22% 12%' }, // sword
  { scale: 1.5, position: '50% 35%' }, // garland
  { scale: 1.8, position: '50% 78%' }, // feet
]

/**
 * SCENE 04 — THE FORM.
 * Motion language: camera movement + focus. One portrait, seven framings —
 * the camera moves to each element in turn while the last one dissolves.
 */
export function FormScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const active = useActiveSegment(progress, iconography.length)
  const portrait = images.kali.primary
  const frame = FRAMING[active] ?? FRAMING[0]
  const item = iconography[active]

  if (reducedMotion) return <FormStatic />

  return (
    <section ref={ref} className="relative h-[320vh] bg-obsidian">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.img
          src={portrait.src}
          alt={portrait.alt}
          className="absolute inset-0 h-full w-full object-cover"
          animate={{ scale: frame.scale, objectPosition: frame.position }}
          style={{ transformOrigin: frame.position }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/25 to-obsidian/50" />
        <div className="absolute inset-0 vignette" />

        <div className="absolute inset-x-0 top-10 flex justify-center md:top-14">
          <RevealText
            text="THE FORM"
            as="h2"
            splitBy="word"
            className="font-display text-2xl tracking-[0.3em] text-ivory/80 md:text-3xl"
          />
        </div>

        <span
          aria-hidden="true"
          className="absolute bottom-4 left-4 select-none font-display text-[9rem] leading-none text-ivory/[0.05] md:bottom-0 md:left-10 md:text-[16rem]"
        >
          {item.index}
        </span>

        <div className="absolute bottom-14 left-6 max-w-md md:bottom-20 md:left-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-deva text-2xl text-divine/90">{item.sanskrit}</p>
              <h3 className="mt-2 font-display text-4xl tracking-wide text-ivory md:text-5xl">{item.name}</h3>
              <p className="mt-3 font-serif text-lg italic text-gold/90 md:text-xl">{item.meaning}</p>
              <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-ivory/60">{item.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 right-6 flex gap-1.5 md:right-16">
          {iconography.map((el, i) => (
            <span
              key={el.id}
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
