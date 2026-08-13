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
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#1A2027] via-[#111418] to-[#08090A] px-6 text-center">
      <p className="font-display text-3xl tracking-wide text-ivory md:text-5xl">THE STORM IS NOT THE POWER.</p>
      <p className="font-serif text-lg italic text-ivory/60">THE STILLNESS IS.</p>
    </section>
  )
}

/**
 * The whole journey, one continuous pinned scroll — darkness, mountain,
 * path, cave, Trishula, footprints, presence, Shiva, the third eye,
 * Raudra, stillness. One scene rather than mount/unmount sections per
 * beat: the brief is explicit that this should never look like it "cuts".
 */
export function MahadevExperience() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const mountRef = useRef<HTMLDivElement>(null)
  const shouldMount = useInView(mountRef, { once: false, margin: '25% 0px 25% 0px' })
  const [quality, setQuality] = useState<Quality>(() => detectInitialQuality(isMobile))
  const [ready, setReady] = useState(false)

  useSectionLoadLock(shouldMount && !ready)

  // The third-eye freeze in TimelineController locks scroll imperatively
  // for a fixed real-time window, independent of useSectionLoadLock's own
  // bookkeeping — if this scene ever unmounts mid-freeze, unlock
  // unconditionally so scroll can't stay stuck.
  useEffect(() => () => unlockScroll(), [])

  useEffect(() => {
    if (!shouldMount || ready) return
    const timer = setTimeout(() => setReady(true), READY_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [shouldMount, ready])

  const worldTime = useMotionValue(0)
  const stormIntensity = useMotionValue(0.02)
  const skyReveal = useMotionValue(0.05)
  const rimIntensity = useMotionValue(0)
  const thirdEyeOpen = useMotionValue(0)
  const signals: SceneSignals = { worldTime, stormIntensity, skyReveal, rimIntensity, thirdEyeOpen }

  if (reducedMotion) return <StillnessStatic />

  return (
    <section ref={ref} className="relative h-[1000vh] bg-[#08090A]">
      <div ref={mountRef} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {shouldMount && (
          <Canvas
            dpr={[1, isMobile ? 1.25 : 2]}
            camera={{ position: SHOTS[0].pos as unknown as [number, number, number], fov: SHOTS[0].fov, near: 0.4, far: 900 }}
            gl={{ antialias: true, alpha: false }}
            shadows={false}
            onCreated={(state) => {
              // Matches EXPOSURE_KEYS[0] — avoids a one-frame flash at the
              // renderer's default exposure before TimelineController's
              // own first frame sets the real value.
              state.gl.toneMappingExposure = 0.9
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

