import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { PEAK_SUMMIT } from '../terrain'

function useGlowTexture() {
  return useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(214,222,233,0.9)')
    gradient.addColorStop(0.35, 'rgba(214,222,233,0.28)')
    gradient.addColorStop(1, 'rgba(214,222,233,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/** A hard-edged disc with a slightly soft rim — unlike the glow sprite
 * above, this is what actually reads as "the moon" rather than a diffuse
 * haze. Built as a texture (not `<circleGeometry>`) so it can live on a
 * `<sprite>`, which always faces the camera — a flat mesh disc facing a
 * single fixed direction would only actually look round from one side,
 * and could go edge-on-invisible from others as the camera swept past it. */
function useDiscTexture() {
  return useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(238,241,246,1)')
    gradient.addColorStop(0.82, 'rgba(238,241,246,1)')
    gradient.addColorStop(1, 'rgba(238,241,246,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/**
 * A single cold moon, clearly visible for almost the whole journey (not
 * gated behind heavy cloud cover the way a first pass had it — that read
 * as "no moon" more than "an occasionally-clouded one"), plus a scatter of
 * stars. No galaxy, no nebula wash (the old page's CosmicLayer) — per the
 * brief: "keep the environment grounded in Earth". `reveal` (0->1) still
 * governs the clouds properly parting for the brightest, clearest view at
 * the very end (Scene 13), but only pushes an already-visible moon the
 * rest of the way, rather than being the only thing making it visible at
 * all.
 */
export function MoonSky({ quality, reveal }: { quality: Quality; reveal: MotionValue<number> }) {
  const glow = useGlowTexture()
  const disc = useDiscTexture()
  const moonGlowRef = useRef<THREE.Sprite>(null)
  const moonDiscRef = useRef<THREE.Sprite>(null)
  const starsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const r = reveal.get()
    if (moonGlowRef.current) {
      const mat = moonGlowRef.current.material as THREE.SpriteMaterial
      mat.opacity = 0.4 + r * 0.5
    }
    if (moonDiscRef.current) {
      const mat = moonDiscRef.current.material as THREE.SpriteMaterial
      mat.opacity = 0.75 + r * 0.25
    }
    // Sparkles' own material is an internal shader, not something safe to
    // reach into via refs — scale is the one knob exposed indirectly here,
    // so stars still bloom in further at the very end even though they're
    // visible well before that.
    if (starsRef.current) starsRef.current.scale.setScalar(0.55 + r * 0.55)
  })

  // Placed along the opening approach shots' actual sightline (checked
  // against cameraShots.ts's own t=0-0.28 positions/look-targets, which
  // all look roughly this same direction) rather than just "high up
  // somewhere" — a moon positioned without checking what the camera
  // actually points at is liable to sit just outside frame the entire
  // journey, which is indistinguishable from no moon at all.
  const moonPos: [number, number, number] = [40, 140, PEAK_SUMMIT[2] - 180]

  return (
    <group>
      {/* fog={false} on both — SpriteMaterial is fogged by the scene's
          atmosphere by default, and at the distance the moon sits, the
          FogExp2 falloff was tinting it almost entirely toward the dark
          fog color instead of reading as a bright disc: found by testing. */}
      <sprite ref={moonGlowRef} position={moonPos} scale={[60, 60, 1]}>
        <spriteMaterial map={glow} color="#dfe6ee" transparent opacity={0.4} depthWrite={false} fog={false} />
      </sprite>
      <sprite ref={moonDiscRef} position={moonPos} scale={[15, 15, 1]}>
        <spriteMaterial map={disc} color="#f4f6fa" transparent opacity={0.75} depthWrite={false} fog={false} />
      </sprite>
      <group ref={starsRef} position={[PEAK_SUMMIT[0], PEAK_SUMMIT[1] + 60, PEAK_SUMMIT[2] - 60]}>
        <Sparkles count={quality === 'high' ? 200 : quality === 'medium' ? 120 : 60} scale={[320, 140, 200]} size={1.1} speed={0.01} color="#e6ebf3" opacity={0.35} />
      </group>
    </group>
  )
}
