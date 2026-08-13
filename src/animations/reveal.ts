import type { Variants } from 'framer-motion'
import { EASE_CINEMATIC, EASE_VEIL } from './transitions'

/** Text rising out of darkness with a blur-to-focus resolve. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 46, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: EASE_CINEMATIC },
  },
}

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE_CINEMATIC },
  },
}

/** A vertical curtain lifting — used for section headlines. */
export const maskReveal: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 1.3, ease: EASE_VEIL },
  },
}

/** Images breathing inward from a slight overscale as they resolve into focus. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 1.12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.8, ease: EASE_CINEMATIC },
  },
}

/** Stagger container for word/line choreography. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

export const staggerLine: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: '0%', transition: { duration: 1, ease: EASE_CINEMATIC } },
}

/** A faint point of light blooming outward — the void's first gesture. */
export const emberBloom: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 2.2, ease: EASE_CINEMATIC },
  },
}
