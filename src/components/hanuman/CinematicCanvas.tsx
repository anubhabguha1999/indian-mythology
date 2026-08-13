import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import type { MotionValue } from 'framer-motion'
import type { Quality } from '@/utils/quality'
import { TimelineController, type SceneSignals } from './TimelineController'
import { Landscape } from './environment/Landscape'
import { Wind } from './environment/Wind'
import { Clouds, Lightning } from './environment/SkyAtmosphere'
import { Battlefield } from './environment/Battlefield'
import { Hanuman } from './Hanuman'

const SETTLE_FRAMES = 14

function FirstFrameSignal({ onReady }: { onReady: () => void }) {
  const count = useRef(0)
  useFrame(() => {
    if (count.current > SETTLE_FRAMES) return
    count.current += 1
    if (count.current > SETTLE_FRAMES) onReady()
  })
  return null
}

function PostFX({ quality }: { quality: Quality }) {
  if (quality === 'low') return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.2} luminanceThreshold={0.68} luminanceSmoothing={0.25} mipmapBlur radius={0.4} />
      <DepthOfField focusDistance={0.02} focalLength={0.03} bokehScale={quality === 'high' ? 2.4 : 1.3} />
      <Vignette eskil={false} offset={0.3} darkness={0.5} />
      <Noise opacity={0.02} />
    </EffectComposer>
  )
}

/**
 * Everything inside the WebGL canvas — the director, the landscape, the
 * atmosphere, the battlefield, Hanuman himself, and post-processing. One
 * component rather than split further, same reasoning as mahadev/
 * CinematicCanvas.tsx: everything here reads off the same `signals` and
 * `quality`.
 */
export function CinematicCanvas({
  progress,
  signals,
  quality,
  onReady,
  onQualityDecline,
}: {
  progress: MotionValue<number>
  signals: SceneSignals
  quality: Quality
  onReady: () => void
  onQualityDecline: () => void
}) {
  return (
    <>
      <PerformanceMonitor onDecline={onQualityDecline} />
      <TimelineController progress={progress} signals={signals} />

      {/* The model's jewelry/gada carry real metalness — PBR metal has no
          diffuse response, it only reads by reflecting something, so
          without any environment map those parts (and the whole model,
          to a lesser degree) render flat and dark no matter how strong
          the direct key/ambient lights are. A dim, warm environment map
          gives them something to reflect without relighting the rest of
          the graded scene — kept low-intensity and background={false} so
          it stays a lighting contribution, not a visible sky dome. */}
      <Environment preset="sunset" background={false} environmentIntensity={0.35} resolution={256} />

      <Landscape quality={quality} />
      <Wind quality={quality} windIntensity={signals.windIntensity} easedProgress={signals.easedProgress} />
      <Clouds quality={quality} stormIntensity={signals.stormIntensity} />
      <Lightning worldTime={signals.worldTime} stormIntensity={signals.stormIntensity} />
      <Battlefield quality={quality} stormIntensity={signals.stormIntensity} />

      {/* useGLTF suspends while the model downloads — FirstFrameSignal
          below only counts frames once mounted, so this doesn't race the
          "ready" signal the way an un-suspended late-arriving mesh would. */}
      <Suspense fallback={null}>
        <Hanuman quality={quality} easedProgress={signals.easedProgress} />
      </Suspense>

      <PostFX quality={quality} />
      <FirstFrameSignal onReady={onReady} />
    </>
  )
}
