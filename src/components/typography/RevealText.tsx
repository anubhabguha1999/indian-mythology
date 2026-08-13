import { motion, type Variants } from 'framer-motion'
import type { ElementType } from 'react'
import { EASE_CINEMATIC } from '@/animations/transitions'
import { cn } from '@/utils/cn'

interface RevealTextProps {
  text: string
  as?: ElementType
  className?: string
  unitClassName?: string
  /** "line" respects literal \n breaks; "word" staggers word-by-word. */
  splitBy?: 'line' | 'word'
  delay?: number
  stagger?: number
  once?: boolean
  amount?: number
}

const unitVariants: Variants = {
  hidden: { opacity: 0, y: '100%', filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: '0%',
    filter: 'blur(0px)',
    transition: { duration: 1, ease: EASE_CINEMATIC },
  },
}

/**
 * Splits text into lines or words and reveals them with an independent,
 * masked rise — the choreography every headline in the site uses instead
 * of a flat fade-in.
 */
export function RevealText({
  text,
  as: Tag = 'span',
  className,
  unitClassName,
  splitBy = 'line',
  delay = 0,
  stagger = 0.09,
  once = true,
  amount = 0.4,
}: RevealTextProps) {
  const units = splitBy === 'line' ? text.split('\n') : text.split(' ')
  // Cast to a concrete intrinsic tag: with @react-three/fiber in the program,
  // JSX.IntrinsicElements grows to include dozens of three.js elements whose
  // `children` types don't unify, which collapses a generic `ElementType`
  // render's children to `never`. The runtime tag is still whatever `as`
  // actually is — this only narrows what TS checks the props against.
  const Component = Tag as 'div'

  return (
    <Component className={className}>
      <motion.span
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {units.map((unit, i) => (
          <span
            key={i}
            className={cn('overflow-hidden', splitBy === 'line' ? 'block' : 'inline-block')}
          >
            <motion.span
              className={cn(splitBy === 'line' ? 'block' : 'inline-block', unitClassName)}
              variants={unitVariants}
            >
              {unit === '' ? ' ' : unit}
              {splitBy === 'word' && i < units.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  )
}
