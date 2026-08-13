import { AnimatePresence, motion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useActiveSegment } from '@/hooks/useActiveSegment'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RevealText } from '@/components/typography/RevealText'
import { ParticleField } from '@/components/particles/ParticleField'
import { storyBeatsCondensed } from '@/data/kali'

function StoryStatic() {
  return (
    <section className="flex flex-col items-center gap-6 bg-obsidian px-6 py-24 text-center">
      <p className="font-sans text-[11px] tracking-[0.4em] text-ivory/50">WHEN CHAOS THREATENED THE WORLD</p>
      {storyBeatsCondensed.map((beat, i) => (
        <p key={i} className="whitespace-pre-line font-display text-2xl leading-snug text-ivory md:text-4xl">
          {beat.line}
        </p>
      ))}
      <p className="mt-4 max-w-md font-serif text-sm italic leading-relaxed text-ivory/35">
        According to the Devī Māhātmya tradition — regional and textual accounts of this story vary.
      </p>
    </section>
  )
}

/**
 * SCENE 06 — THE STORY.
 * Motion language: smoke + short cinematic statements, one at a time.
 * A condensed telling — the full account lives at /kali/story.
 */
export function StoryScene() {
  const reducedMotion = useReducedMotion()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const active = useActiveSegment(progress, storyBeatsCondensed.length)
  const beat = storyBeatsCondensed[active]

  if (reducedMotion) return <StoryStatic />

  return (
    <section ref={ref} className="relative h-[250vh] bg-obsidian">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -inset-24 animate-[smoke-drift_18s_ease-in-out_infinite] bg-radial-ember opacity-30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -inset-24 animate-[smoke-drift_24s_ease-in-out_infinite_reverse] bg-[radial-gradient(circle_at_70%_60%,rgba(48,7,8,0.9),transparent_60%)] blur-3xl"
        />
        <ParticleField className="absolute inset-0" variant="ember" count={54} opacity={0.5} />
        <div className="absolute inset-0 bg-obsidian/30" />

        <div className="absolute inset-x-0 top-10 px-6 text-center md:top-14">
          <RevealText
            text="WHEN CHAOS THREATENED THE WORLD"
            splitBy="word"
            className="font-sans text-[11px] tracking-[0.4em] text-ivory/50 md:text-xs"
          />
        </div>

        <div className="relative z-10 max-w-3xl px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="whitespace-pre-line font-display text-3xl leading-[1.3] text-ivory sm:text-4xl md:text-6xl"
            >
              {beat.line}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="absolute bottom-10 max-w-md px-6 text-center font-serif text-xs italic leading-relaxed text-ivory/35 md:text-sm">
          According to the Devī Māhātmya tradition — regional and textual accounts of this story vary.
        </p>
      </div>
    </section>
  )
}
