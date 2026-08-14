import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import type { Quality } from '@/utils/quality'
import { TimelineController, type SceneSignals } from './TimelineController'
import { Landscape } from './environment/Landscape'
import { Wind } from './environment/Wind'
import { Clouds, DynamicSky, HeroClouds, Lightning } from './environment/SkyAtmosphere'
import { StormAtmosphere } from './environment/Battlefield'
import { Hanuman } from './Hanuman'
import { WARM_GOLD } from './hanumanPalette'

const SETTLE_FRAMES = 14

/**
 * A hand-built environment map, rendered live from these three primitives
 * into a cubemap (drei's `<Environment>` does this whenever it's given
 * children instead of a `preset`/`files` prop) — no network request at
 * all. `preset="sunset"` previously fetched its HDR from pmndrs's asset
 * CDN at runtime; when that fetch failed (offline, or a browser sandbox
 * with no route to it), the resulting unhandled error crashed and
 * repeatedly remounted the whole Canvas, which is what was actually behind
 * the "too many renders"/"WebGLRenderer: Context Lost" spam — each
 * remount tears down and recreates the GL context. A warm hemisphere plus
 * one bright "sun" sphere is a coarse stand-in for a real sky, but it's
 * enough for the gold ornaments' metalness to have something plausible to
 * reflect, and it can never fail to load. */
function ProceduralSky() {
  return (
    <>
      <mesh scale={80}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#5c6a7d" side={THREE.BackSide} fog={false} />
      </mesh>
      <mesh position={[40, 25, -10]}>
        <sphereGeometry args={[6, 16, 12]} />
        <meshBasicMaterial color={WARM_GOLD} fog={false} />
      </mesh>
      <mesh position={[-30, 10, 20]}>
        <sphereGeometry args={[10, 16, 12]} />
        <meshBasicMaterial color="#2a2018" fog={false} />
      </mesh>
    </>
  )
}

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
 * atmosphere, Hanuman himself, and post-processing. One component rather
 * than split further, same reasoning as mahadev/CinematicCanvas.tsx:
 * everything here reads off the same `signals` and `quality`.
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
          the direct key/ambient lights are. A dim environment map gives
          them something to reflect without relighting the rest of the
          graded scene — kept low-intensity and background={false} so it
          stays a lighting contribution, not a visible sky dome. Built from
          ProceduralSky's own local primitives, not a `preset`/`files` HDR
          fetch — see that component's own comment for why. */}
      <Environment background={false} environmentIntensity={0.35} resolution={256}>
        <ProceduralSky />
      </Environment>

      {/* The actual visible sky — a real Rayleigh/Mie scattering dome, not
          the flat fog-color clear the scene had before. See DynamicSky's
          own comment for the sun arc/storm-turbidity logic. */}
      <DynamicSky easedProgress={signals.easedProgress} />

      <Landscape quality={quality} />
      <Wind quality={quality} windIntensity={signals.windIntensity} easedProgress={signals.easedProgress} />
      {quality !== 'low' && <HeroClouds stormIntensity={signals.stormIntensity} />}
      <Clouds quality={quality} stormIntensity={signals.stormIntensity} />
      <Lightning worldTime={signals.worldTime} stormIntensity={signals.stormIntensity} />
      <StormAtmosphere quality={quality} stormIntensity={signals.stormIntensity} />

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
