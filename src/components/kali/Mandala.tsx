import { motion, type MotionValue } from 'framer-motion'
import { cn } from '@/utils/cn'

interface MandalaProps {
  size?: number
  className?: string
  color?: string
  opacity?: number
  /** Bind to a scroll-linked MotionValue for scroll-driven rotation. */
  rotate?: MotionValue<number>
  /** Or spin continuously via CSS — mutually exclusive with `rotate` in practice. */
  spin?: boolean
}

const PETALS = 24

/**
 * A single reusable sacred-geometry motif — concentric rings, radiating
 * ticks, a ring of petals. Reused (at different sizes/opacities) behind
 * the Revelation's aura, the Symbolism sequence and the Dance.
 */
export function Mandala({ size = 480, className, color = '#B99345', opacity = 0.35, rotate, spin }: MandalaProps) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn('pointer-events-none', spin && 'animate-[spin_90s_linear_infinite]', className)}
      style={rotate ? { rotate, opacity } : { opacity }}
      aria-hidden="true"
    >
      <g stroke={color} fill="none" strokeWidth={0.5}>
        {[92, 76, 60, 44, 28].map((r) => (
          <circle key={r} cx={100} cy={100} r={r} />
        ))}
        {Array.from({ length: PETALS }).map((_, i) => (
          <line key={i} x1={100} y1={8} x2={100} y2={30} transform={`rotate(${(360 / PETALS) * i} 100 100)`} />
        ))}
        {Array.from({ length: PETALS / 2 }).map((_, i) => (
          <circle
            key={`petal-${i}`}
            cx={100}
            cy={40}
            r={10}
            transform={`rotate(${(360 / (PETALS / 2)) * i} 100 100)`}
          />
        ))}
      </g>
    </motion.svg>
  )
}
