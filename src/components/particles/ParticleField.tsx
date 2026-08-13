import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'

interface Particle {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  alpha: number
  colorIndex: number
  flicker: number
}

interface ParticleFieldProps {
  className?: string
  /** Base particle count on desktop; halved (roughly) on mobile. */
  count?: number
  /** RGB triples, no alpha — e.g. "227,196,106" for divine gold. */
  palette?: string[]
  /** "dust" drifts slowly and evenly; "ember" rises faster, like ash off a flame. */
  variant?: 'dust' | 'ember'
  opacity?: number
}

/**
 * A cheap canvas-2D particle field standing in for cosmic dust / rising ash.
 * Deliberately not Three.js — a few dozen animated circles cost nothing on
 * a 2D canvas and read identically at this scale, keeping every scene at
 * 60fps on modest hardware.
 */
export function ParticleField({
  className,
  count,
  palette = ['227,196,106', '237,227,208'],
  variant = 'dust',
  opacity = 1,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let particles: Particle[] = []
    const total = count ?? (isMobile ? 34 : 100)

    function resize() {
      width = canvas!.clientWidth
      height = canvas!.clientHeight
      canvas!.width = Math.max(1, width * dpr)
      canvas!.height = Math.max(1, height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function seed() {
      particles = Array.from({ length: total }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: variant === 'ember' ? Math.random() * 1.6 + 0.5 : Math.random() * 1.3 + 0.3,
        speed: variant === 'ember' ? Math.random() * 0.4 + 0.12 : Math.random() * 0.1 + 0.015,
        drift: (Math.random() - 0.5) * (variant === 'ember' ? 0.4 : 0.12),
        alpha: Math.random() * 0.5 + 0.12,
        colorIndex: Math.floor(Math.random() * palette.length),
        flicker: Math.random() * Math.PI * 2,
      }))
    }

    resize()
    seed()

    let raf = 0
    function tick() {
      ctx!.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.y -= p.speed
        p.x += p.drift
        p.flicker += 0.02
        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        }
        if (p.x < -8) p.x = width + 8
        if (p.x > width + 8) p.x = -8

        const flick = variant === 'ember' ? (Math.sin(p.flicker) + 1) / 2 : 1
        ctx!.beginPath()
        ctx!.fillStyle = `rgba(${palette[p.colorIndex]},${p.alpha * flick})`
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      resize()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reducedMotion, isMobile, count, variant, palette])

  if (reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('block h-full w-full', className)}
      style={{ opacity }}
    />
  )
}
