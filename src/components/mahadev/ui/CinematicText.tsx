import { motion, useTransform, type MotionValue } from 'framer-motion'
import { STORY_WINDOWS } from '../chapters'
import { shivaOrigin } from '@/data/shivaStory'
import { PARCHMENT, UI_GOLD } from '../mahadevPalette'

/**
 * One story beat, on screen only while its window is open — low on the
 * frame, never centered and never near the lingam's own screen position
 * (it sits center-frame through most of the reveal; every beat here
 * anchors to the bottom-left instead). This is the story itself
 * (data/shivaStory.ts), told *during* the scroll rather than in a
 * separate section read afterward — each beat timed to land near
 * whatever part of the journey it's actually about.
 */
function StoryBeat({ opacity, index, heading, body }: { opacity: MotionValue<number>; index: string; heading: string; body: string }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-x-0 bottom-[13%] px-6 md:bottom-[15%] md:px-16">
      <div className="max-w-md md:max-w-lg">
        <p className="font-sans text-[10px] tracking-[0.4em]" style={{ color: UI_GOLD }}>
          {index} — MAHADEV
        </p>
        <p className="mt-2 font-display text-2xl leading-tight text-ivory md:text-3xl">{heading}</p>
        <p className="mt-3 font-serif text-base italic leading-relaxed text-ivory/75 md:text-lg">{body}</p>
      </div>
    </motion.div>
  )
}

/** STORY_WINDOWS/shivaOrigin are both fixed-length, known at authoring
 * time (seven chapters) — each gets its own explicit useTransform call
 * rather than one built inside a `.map`, which would call a hook from
 * within a loop. */
export function CinematicText({ progress }: { progress: MotionValue<number> }) {
  const [w0, w1, w2, w3, w4, w5, w6] = STORY_WINDOWS
  const opacity0 = useTransform(progress, [w0.show, w0.peak, w0.hide], [0, 1, 0])
  const opacity1 = useTransform(progress, [w1.show, w1.peak, w1.hide], [0, 1, 0])
  const opacity2 = useTransform(progress, [w2.show, w2.peak, w2.hide], [0, 1, 0])
  const opacity3 = useTransform(progress, [w3.show, w3.peak, w3.hide], [0, 1, 0])
  const opacity4 = useTransform(progress, [w4.show, w4.peak, w4.hide], [0, 1, 0])
  const opacity5 = useTransform(progress, [w5.show, w5.peak, w5.hide], [0, 1, 0])
  const opacity6 = useTransform(progress, [w6.show, w6.peak, w6.hide], [0, 1, 0])
  const opacities = [opacity0, opacity1, opacity2, opacity3, opacity4, opacity5, opacity6]
  const finalGlyph = useTransform(progress, [0.985, 0.995, 1], [0, 1, 1])
  const finalMantra = useTransform(progress, [0.995, 1], [0, 1])

  return (
    <div className="pointer-events-none absolute inset-0">
      {shivaOrigin.map((chapter, i) => (
        <StoryBeat key={chapter.id} opacity={opacities[i]} index={chapter.index} heading={chapter.heading} body={chapter.body} />
      ))}
      <motion.div style={{ opacity: finalGlyph }} className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
        <p className="font-deva text-5xl text-ivory md:text-7xl" style={{ textShadow: `0 0 70px ${PARCHMENT}44` }}>
          महादेव
        </p>
        <motion.p style={{ opacity: finalMantra }} className="mt-5 font-serif text-lg italic text-ivory/70 md:text-2xl">
          ॐ नमः शिवाय
        </motion.p>
      </motion.div>
    </div>
  )
}
