import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useInView, useMotionValue } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useSectionLoadLock } from '@/hooks/useSectionLoadLock'
import { unlockScroll } from '@/utils/scrollLock'
import { detectInitialQuality, stepDown, type Quality } from '@/utils/quality'
import { CinematicCanvas } from './CinematicCanvas'
import { CinematicText } from './ui/CinematicText'
import { Loader } from './ui/Loader'
import { SHOTS } from './cameraShots'
import type { SceneSignals } from './TimelineController'

const READY_TIMEOUT_MS = 8000

function StillnessStatic() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#241a12] via-[#1a130e] to-[#0c0d0f] px-6 text-center">
      <p className="font-deva text-3xl text-ivory md:text-5xl">श्री हनुमते नमः</p>
      <p className="font-serif text-lg italic text-ivory/60">जय श्री राम</p>
    </section>
  )
}

/**
 * The whole journey, one continuous pinned scroll — dawn, wind, shadow,
 * mountain, leap, sky, battle, devotion, stillness — mounted below a
 * static landing hero (HanumanHero.tsx). Its own opening chapter is still
 * near-black and near-silent (see hanumanPalette.ts's EXPOSURE_KEYS
 * starting near-zero), so the hand-off from hero to canvas doesn't jump
 * from bright to dark.
 */
export function HanumanExperience() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const mountRef = useRef<HTMLDivElement>(null)
  const shouldMount = useInView(mountRef, { once: false, margin: '25% 0px 25% 0px' })
  const [quality, setQuality] = useState<Quality>(() => detectInitialQuality(isMobile))
  const [ready, setReady] = useState(false)

  useSectionLoadLock(shouldMount && !ready)

  useEffect(() => () => unlockScroll(), [])

  useEffect(() => {
    if (!shouldMount || ready) return
    const timer = setTimeout(() => setReady(true), READY_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [shouldMount, ready])

  const worldTime = useMotionValue(0)
  const windIntensity = useMotionValue(0.03)
  const stormIntensity = useMotionValue(0.05)
  const rimIntensity = useMotionValue(0)
  const devotionActive = useMotionValue(0)
  const thunderTrigger = useMotionValue(0)
  const easedProgress = useMotionValue(0)
  const signals: SceneSignals = { worldTime, windIntensity, stormIntensity, rimIntensity, devotionActive, thunderTrigger, easedProgress }

  if (reducedMotion) return <StillnessStatic />

  return (
    <section ref={ref} className="relative h-[1000vh] bg-[#0c0d0f]">
      <div ref={mountRef} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {shouldMount && (
          <Canvas
            dpr={[1, isMobile ? 1.25 : 2]}
            camera={{ position: SHOTS[0].pos as unknown as [number, number, number], fov: SHOTS[0].fov, near: 0.4, far: 1400 }}
            gl={{ antialias: true, alpha: false }}
            shadows={false}
            onCreated={(state) => {
              state.gl.toneMappingExposure = 0.35
            }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <CinematicCanvas
              progress={progress}
              signals={signals}
              quality={quality}
              onReady={() => setReady(true)}
              onQualityDecline={() => setQuality((q) => stepDown(q))}
            />
          </Canvas>
        )}

        {shouldMount && !ready && <Loader />}

        <div className="pointer-events-none absolute inset-0 vignette-soft" />
        <CinematicText progress={progress} />
      </div>
    </section>
  )
}
