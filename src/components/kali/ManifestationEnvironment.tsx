import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'

const CRIMSON = '#7a1118'
const GOLD = '#b99345'
const DIVINE = '#e3c46a'
const STONE = '#0a0808'

/**
 * The sacred chamber she's standing in — never fully lit, never fully seen.
 * Split out from ManifestationScene.tsx purely for file size; these pieces
 * don't need to know anything about scroll progress, only `quality`.
 */

/** A vast dark stone floor with a shallow mandala groove — read mostly by
 * perspective as the camera passes over it, not by detail. */
export function Floor() {
  const rings = [2.2, 3.4, 4.6, 6.2, 8]
  return (
    <group position={[0, -3.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow={false}>
        <circleGeometry args={[26, 48]} />
        <meshStandardMaterial color={STONE} roughness={0.97} metalness={0.02} />
      </mesh>
      {rings.map((r) => (
        <mesh key={r}>
          <ringGeometry args={[r, r + 0.03, 64]} />
          <meshStandardMaterial color={GOLD} roughness={0.6} metalness={0.4} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/** A few broad steps rising toward her base — the kind of scale reference
 * that makes "enormous" legible rather than asserted. */
export function Steps() {
  const steps = [
    { r: 9, y: -3.6, h: 0.3 },
    { r: 6.4, y: -3.3, h: 0.3 },
    { r: 4.2, y: -3.0, h: 0.3 },
  ]
  return (
    <group>
      {steps.map((s, i) => (
        <mesh key={i} position={[0, s.y, 0]}>
          <cylinderGeometry args={[s.r, s.r + 0.6, s.h, 40]} />
          <meshStandardMaterial color="#0d0a0a" roughness={0.95} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

const PILLAR_COUNT = { high: 10, medium: 7, low: 5 }

/** Thin, massive stone columns implying a chamber far larger than the
 * screen. Kept within roughly ±8 units of center and behind z=-9 — wide
 * enough to sit inside the camera's frustum at the far/wide opening shots
 * (see SHOTS in ManifestationScene.tsx) without ever crossing the dolly
 * path, fading into fog as the camera pushes in past them. */
export function Pillars({ quality }: { quality: Quality }) {
  const count = PILLAR_COUNT[quality]
  const pillars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1)
        const angle = (t - 0.5) * Math.PI * 0.7
        return { x: Math.sin(angle) * 7.5, z: -5 - Math.cos(angle) * 7, r: 0.55 + Math.random() * 0.2 }
      }),
    [count],
  )
  return (
    <group>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, 4, p.z]}>
          <cylinderGeometry args={[p.r, p.r + 0.2, 18, 10]} />
          <meshStandardMaterial color={STONE} roughness={0.95} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

/** Small practical lights along the chamber — the only "realistic"
 * illumination in the scene, everything else is stage lighting. */
export function Lamps({ quality }: { quality: Quality }) {
  const positions: [number, number, number][] = quality === 'low'
    ? [[-3, -1.2, 6], [3, -1.2, 5]]
    : [[-4.2, -1.4, 9], [4.2, -1.4, 8], [-2.4, -1.6, 3], [2.6, -1.6, 2]]
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          <pointLight color="#e0a94f" intensity={1.1} distance={5} decay={2} />
          <mesh>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color="#f3c98a" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The sacred-geometry motif (see Mandala.tsx) rebuilt as physical, rotating
 * 3D rings behind her instead of a flat overlay. */
export function MandalaRings({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.015
  })
  const radii = quality === 'high' ? [3.6, 4.4, 5.2] : quality === 'medium' ? [3.8, 4.8] : [4.2]
  return (
    <group ref={group} position={[0, 0.6, -7]}>
      {radii.map((r) => (
        <mesh key={r}>
          <torusGeometry args={[r, 0.02, 8, 64]} />
          <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.75} />
        </mesh>
      ))}
    </group>
  )
}

function useSmokeTexture() {
  return useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])
}

/** Drifting smoke/aura sprites and four particle layers at fixed depths —
 * dust, embers, gold motes, and a close/out-of-focus foreground layer that
 * only pays off once real depth-of-field (ManifestationPostFX) is active. */
export function AtmosphereLayers({ quality }: { quality: Quality }) {
  const texture = useSmokeTexture()
  const auraRef = useRef<THREE.Sprite>(null)
  const smokeRefs = useRef<THREE.Sprite[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (auraRef.current) auraRef.current.material.rotation = t * 0.01
    smokeRefs.current.forEach((s, i) => {
      if (!s) return
      s.position.x += Math.sin(t * 0.05 + i) * 0.0015
      s.position.y += Math.cos(t * 0.04 + i) * 0.001
    })
  })

  const smokePuffs = quality === 'high' ? 4 : quality === 'medium' ? 2 : 1

  return (
    <group>
      {/* the crimson aura directly behind her — atmospheric, not a flat neon disc */}
      <sprite ref={auraRef} position={[0, 0.6, -3]} scale={[9, 9, 1]}>
        <spriteMaterial map={texture} color={CRIMSON} transparent opacity={0.35} depthWrite={false} />
      </sprite>

      {Array.from({ length: smokePuffs }).map((_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            if (el) smokeRefs.current[i] = el
          }}
          position={[(i - smokePuffs / 2) * 3.2, -0.5 + i * 0.4, -5 - i * 2]}
          scale={[7, 7, 1]}
        >
          <spriteMaterial map={texture} color="#0b0909" transparent opacity={0.4} depthWrite={false} />
        </sprite>
      ))}

      {/* foreground dust, between camera and her — sells parallax on approach */}
      <Sparkles count={quality === 'high' ? 40 : quality === 'medium' ? 24 : 12} scale={[10, 6, 6]} size={2.2} speed={0.12} color={DIVINE} opacity={0.5} position={[0, 0.5, 5]} />
      {/* atmosphere around her */}
      <Sparkles count={quality === 'high' ? 90 : quality === 'medium' ? 50 : 24} scale={[9, 8, 8]} size={1.6} speed={0.08} color={GOLD} opacity={0.4} />
      {/* far, near-invisible dust marking the distance itself */}
      <Sparkles count={quality === 'high' ? 60 : quality === 'medium' ? 32 : 16} scale={[20, 10, 4]} size={1} speed={0.04} color="#8a7f74" opacity={0.22} position={[0, 1, -12]} />
      {/* embers close to the ground */}
      <Sparkles count={quality === 'high' ? 30 : quality === 'medium' ? 18 : 8} scale={[6, 2, 6]} size={1.8} speed={0.2} color={CRIMSON} opacity={0.45} position={[0, -2.4, 1]} />
      {/* large, soft, very-close motes — meaningless without DoF, gorgeous with it */}
      {quality !== 'low' && (
        <Sparkles count={10} scale={[4, 3, 2]} size={5} speed={0.05} color={GOLD} opacity={0.22} position={[0.8, 0.3, 8.5]} />
      )}
    </group>
  )
}
