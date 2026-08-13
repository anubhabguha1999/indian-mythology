/** Shared easing curves and page-transition variants — the film's grammar. */

export const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const
export const EASE_VEIL = [0.65, 0, 0.35, 1] as const
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const

export const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_CINEMATIC },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5, ease: EASE_VEIL },
  },
}

/** A gold light sweeping across the frame between routes. */
export const veilVariants = {
  initial: { scaleX: 0, opacity: 0.9 },
  animate: {
    scaleX: [0, 1, 1, 0],
    opacity: [0.9, 1, 1, 0],
    transition: { duration: 0.9, times: [0, 0.4, 0.6, 1], ease: EASE_VEIL },
  },
}
