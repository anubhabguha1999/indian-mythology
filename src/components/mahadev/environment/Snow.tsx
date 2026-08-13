import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { AMPHITHEATER_CENTER, CAVE_FLOOR_Y, FOOTPRINT_TRAIL } from '../terrain'

/**
 * Falling snow — sparse and slow, restricted to two places it's actually
 * motivated (the exterior approach, and the amphitheater's skylight
 * column) rather than blanketing the whole journey, per the brief's own
 * "no excessive particles" instruction.
 */
export function Snowfall({ quality, variant }: { quality: Quality; variant: 'exterior' | 'skylight' }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.position.y -= delta * (variant === 'skylight' ? 0.35 : 0.55)
    if (groupRef.current && groupRef.current.position.y < -18) groupRef.current.position.y = 18
  })

  if (variant === 'skylight') {
    const count = quality === 'low' ? 20 : quality === 'medium' ? 34 : 50
    return (
      <group ref={groupRef} position={[AMPHITHEATER_CENTER[0], CAVE_FLOOR_Y + 30, AMPHITHEATER_CENTER[1]]}>
        <Sparkles count={count} scale={[16, 34, 16]} size={1.3} speed={0.12} color="#eef2f6" opacity={0.5} />
      </group>
    )
  }

  if (quality === 'low') {
    return <Sparkles count={26} scale={[70, 30, 70]} size={1.3} speed={0.14} color="#eef2f6" opacity={0.45} position={[0, 8, 90]} />
  }
  return (
    <group ref={groupRef}>
      <Sparkles count={quality === 'high' ? 80 : 50} scale={[110, 40, 130]} size={1.5} speed={0.18} color="#eef2f6" opacity={0.5} position={[0, 12, 90]} />
      <Sparkles count={quality === 'high' ? 46 : 28} scale={[70, 26, 50]} size={1.1} speed={0.13} color="#dfe6ee" opacity={0.38} position={[-14, 20, 40]} />
    </group>
  )
}

/** A soft radial-gradient alpha decal, reused for every footprint — a dark
 * depression, not a flat sticker: `depthWrite={false}` plus a slight
 * negative polygon offset keeps it from z-fighting the snow surface below. */
function useFootprintTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(20,22,26,0.55)')
    gradient.addColorStop(0.6, 'rgba(20,22,26,0.3)')
    gradient.addColorStop(1, 'rgba(20,22,26,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])
}

/**
 * Enormous prints in the snow, alternating left/right down the trail
 * toward Shiva — deliberately unexplained (the brief is explicit: "do not
 * explain them, do not show Shiva"). Two overlapping ellipses per print
 * (heel + ball of the foot) rather than one oval, so up close they read as
 * a footprint rather than an ambiguous dark smudge.
 */
export function Footprints() {
  const texture = useFootprintTexture()
  const prints = useMemo(
    () =>
      FOOTPRINT_TRAIL.map(([x, z], i) => ({
        x,
        z,
        side: i % 2 === 0 ? 1 : -1,
        rotation: Math.atan2(
          (FOOTPRINT_TRAIL[Math.min(FOOTPRINT_TRAIL.length - 1, i + 1)][0] ?? x) - x,
          (FOOTPRINT_TRAIL[Math.min(FOOTPRINT_TRAIL.length - 1, i + 1)][1] ?? z) - z,
        ),
      })),
    [],
  )

  return (
    <group>
      {prints.map((p, i) => (
        <group key={i} position={[p.x + p.side * 0.9, CAVE_FLOOR_Y + 0.05, p.z]} rotation={[-Math.PI / 2, 0, p.rotation]}>
          <mesh position={[0, 0.55, 0]} renderOrder={1}>
            <planeGeometry args={[1.5, 1.9]} />
            <meshBasicMaterial map={texture} transparent depthWrite={false} />
          </mesh>
          <mesh position={[0, -0.85, 0]} scale={[0.8, 0.8, 1]} renderOrder={1}>
            <planeGeometry args={[1.5, 1.9]} />
            <meshBasicMaterial map={texture} transparent depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
