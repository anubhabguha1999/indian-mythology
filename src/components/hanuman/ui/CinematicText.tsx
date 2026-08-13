import { motion, useTransform, type MotionValue } from 'framer-motion'
import { STORY_WINDOWS } from '../chapters'
import { hanumanOrigin } from '@/data/hanumanStory'
import { UI_WARM, WARM_GOLD } from '../hanumanPalette'

/**
 * One story beat at a time, low on the frame, never centered and never
 * over Hanuman's own face — same placement discipline as mahadev/ui/
 * CinematicText.tsx's StoryBeat. This *is* the story (data/hanumanStory.ts,
 * eight chapters) told during the scroll rather than in a separate section
 * read afterward — an earlier draft here only had brief atmospheric one-
 * liners with no actual narrative, which is what this replaces.
 */
function StoryBeat({ opacity, index, heading, body }: { opacity: MotionValue<number>; index: string; heading: string; body: string }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-x-0 bottom-[13%] px-6 md:bottom-[15%] md:px-16">
      <div className="max-w-md md:max-w-lg">
        <p className="font-sans text-[10px] tracking-[0.4em]" style={{ color: UI_WARM }}>
          {index} — HANUMAN
        </p>
        <p className="mt-2 font-display text-2xl leading-tight text-ivory md:text-3xl">{heading}</p>
        <p className="mt-3 font-serif text-base italic leading-relaxed text-ivory/75 md:text-lg">{body}</p>
      </div>
    </motion.div>
  )
}

/** STORY_WINDOWS/hanumanOrigin are both fixed-length (eight), known at
 * authoring time — each gets its own explicit useTransform call rather
 * than one built inside a `.map` (which would call a hook from a loop). */
export function CinematicText({ progress }: { progress: MotionValue<number> }) {
  const [w0, w1, w2, w3, w4, w5, w6, w7] = STORY_WINDOWS
  const opacity0 = useTransform(progress, [w0.show, w0.peak, w0.hide], [0, 1, 0])
  const opacity1 = useTransform(progress, [w1.show, w1.peak, w1.hide], [0, 1, 0])
  const opacity2 = useTransform(progress, [w2.show, w2.peak, w2.hide], [0, 1, 0])
  const opacity3 = useTransform(progress, [w3.show, w3.peak, w3.hide], [0, 1, 0])
  const opacity4 = useTransform(progress, [w4.show, w4.peak, w4.hide], [0, 1, 0])
  const opacity5 = useTransform(progress, [w5.show, w5.peak, w5.hide], [0, 1, 0])
  const opacity6 = useTransform(progress, [w6.show, w6.peak, w6.hide], [0, 1, 0])
  const opacity7 = useTransform(progress, [w7.show, w7.peak, w7.hide], [0, 1, 0])
  const opacities = [opacity0, opacity1, opacity2, opacity3, opacity4, opacity5, opacity6, opacity7]

  const finalGlyph = useTransform(progress, [0.975, 0.985, 1], [0, 1, 1])
  const finalMantra = useTransform(progress, [0.99, 1], [0, 1])

  return (
    <div className="pointer-events-none absolute inset-0">
      {hanumanOrigin.map((chapter, i) => (
        <StoryBeat key={chapter.id} opacity={opacities[i]} index={chapter.index} heading={chapter.heading} body={chapter.body} />
      ))}

      <motion.div style={{ opacity: finalGlyph }} className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
        <p className="font-deva text-4xl text-ivory md:text-6xl" style={{ textShadow: `0 0 70px ${WARM_GOLD}44` }}>
          श्री हनुमते नमः
        </p>
        <motion.p style={{ opacity: finalMantra }} className="mt-5 font-serif text-lg italic text-ivory/70 md:text-2xl">
          जय श्री राम
        </motion.p>
      </motion.div>
    </div>
  )
}
