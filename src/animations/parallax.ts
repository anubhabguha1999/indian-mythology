import { useTransform, type MotionValue } from 'framer-motion'

/**
 * Maps a 0→1 scroll-progress value to a vertical pixel offset, centered on 0.
 * `distance` is the total travel in px; layers further "back" get larger
 * values so they appear to move slower/faster than the foreground — genuine
 * depth rather than a single global parallax multiplier.
 */
export function useParallaxY(progress: MotionValue<number>, distance: number) {
  return useTransform(progress, [0, 1], [distance, -distance])
}

export function useParallaxX(progress: MotionValue<number>, distance: number) {
  return useTransform(progress, [0, 1], [distance, -distance])
}

/** Scale that breathes slightly as a section enters/leaves — subtle camera drift. */
export function useBreathingScale(progress: MotionValue<number>, from = 1.08, to = 1) {
  return useTransform(progress, [0, 0.5, 1], [from, to, from])
}
