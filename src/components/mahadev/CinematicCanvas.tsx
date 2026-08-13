import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import type { MotionValue } from 'framer-motion'
import type { Quality } from '@/utils/quality'
import { TimelineController, type SceneSignals } from './TimelineController'
import { Terrain } from './environment/Terrain'
import { RockScatter } from './environment/RockScatter'
import { CaveTunnel } from './environment/CaveTunnel'
import { WaterStream, StillPool } from './environment/Water'
import { Snowfall, Footprints } from './environment/Snow'
import { Clouds, Lightning } from './environment/Clouds'
import { MoonSky } from './environment/MoonSky'
import { Trishula } from './sacred/Trishula'
import { Rudraksha } from './sacred/Rudraksha'
import { Damaru } from './sacred/Damaru'
import { Lingam } from './shiva/Lingam'

/** Fires once the canvas has rendered a real frame. Waits a handful of
 * frames rather than just the first one — WebGL shader compilation for a
 * scene this size (the lingam's mark, the tunnel walls, the terrain) can
 * still be settling in on the frame that technically "rendered" first,
 * which is exactly what made small lit details (the mark's glow among
 * them) sometimes pop in a beat after the loader had already hidden
 * instead of being there from the start: found by testing. */
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
      <Bloom intensity={0.24} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur radius={0.45} />
      <DepthOfField focusDistance={0.018} focalLength={0.028} bokehScale={quality === 'high' ? 2.6 : 1.4} />
      <Vignette eskil={false} offset={0.32} darkness={0.45} />
      <Noise opacity={0.018} />
    </EffectComposer>
  )
}

/**
 * Everything that lives inside the WebGL canvas — the director, the
 * environment, the sacred objects, Shiva himself, and post-processing.
 * Kept as one component (rather than one per brief's diagram box) since
 * they all read from the exact same `signals` and `quality`, and splitting
 * them further would just mean threading the same six props through six
 * more files for no real separation of concern.
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

      <Terrain quality={quality} />
      <RockScatter quality={quality} />
      <CaveTunnel quality={quality} />
      <WaterStream worldTime={signals.worldTime} />
      <StillPool />
      <Snowfall quality={quality} variant="exterior" />
      <Snowfall quality={quality} variant="skylight" />
      <Footprints />
      <Clouds quality={quality} stormIntensity={signals.stormIntensity} />
      <Lightning worldTime={signals.worldTime} stormIntensity={signals.stormIntensity} />
      <MoonSky quality={quality} reveal={signals.skyReveal} />

      <Trishula quality={quality} />
      <Rudraksha />
      <Damaru worldTime={signals.worldTime} />

      <Lingam quality={quality} worldTime={signals.worldTime} thirdEyeOpen={signals.thirdEyeOpen} rimIntensity={signals.rimIntensity} />

      <PostFX quality={quality} />
      <FirstFrameSignal onReady={onReady} />
    </>
  )
}
