import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { battlefieldGroundHeight, hash1, HANUMAN_BATTLEFIELD } from '../terrain'

function useGlowTexture() {
  return useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,180,90,0.9)')
    gradient.addColorStop(0.5, 'rgba(200,90,40,0.4)')
    gradient.addColorStop(1, 'rgba(120,40,20,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/** A broken chariot — a box hull, two wheels (one toppled), a snapped
 * yoke pole. Not decoration for its own sake: per the brief, "do not make
 * it excessively bloody" — the war reads through debris and dust, not
 * bodies. */
function BrokenChariot({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.1, 0]} rotation={[0.15, 0, 0.25]}>
        <boxGeometry args={[2.6, 1.4, 4]} />
        <meshStandardMaterial color="#1c1712" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[1.6, 0.9, -0.5]} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[1.1, 0.14, 6, 16]} />
        <meshStandardMaterial color="#241d16" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-1.5, 0.35, 1.2]} rotation={[0.1, 0.3, 1.3]}>
        <torusGeometry args={[1.1, 0.14, 6, 16]} />
        <meshStandardMaterial color="#241d16" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 3]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
        <meshStandardMaterial color="#171310" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** A torn flag on a broken pole — a thin plane with a soft droop, not a
 * rigid banner. */
function Flag({ position, hue }: { position: [number, number, number]; hue: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.25
  })
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 4.4, 5]} />
        <meshStandardMaterial color="#1a1510" roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[0.7, 3.6, 0]}>
        <planeGeometry args={[1.4, 0.9, 4, 3]} />
        <meshStandardMaterial color={hue} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Restrained smoke/embers rising off the battlefield — soft glow sprites,
 * per the brief's own "do not cover the entire screen with flames"
 * caution. Density tracks `stormIntensity` (the same track the sky's
 * clouds/lightning ride), reading as the same worsening weather rather
 * than a separate effect. */
function SmokeAndEmbers({ quality, stormIntensity }: { quality: Quality; stormIntensity: MotionValue<number> }) {
  const texture = useGlowTexture()
  const count = quality === 'high' ? 22 : quality === 'medium' ? 14 : 7
  const groupRef = useRef<THREE.Group>(null)
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash1(i, 40) - 0.5) * 140 + HANUMAN_BATTLEFIELD[0],
        z: HANUMAN_BATTLEFIELD[2] + (hash1(i, 41) - 0.5) * 160,
        speed: 2 + hash1(i, 42) * 3,
        scale: 3 + hash1(i, 43) * 6,
        phase: hash1(i, 44) * 10,
      })),
    [count],
  )

  useFrame((state) => {
    const storm = stormIntensity.get()
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const it = items[i]
      const y = 1 + ((state.clock.elapsedTime * it.speed + it.phase) % 22)
      child.position.y = battlefieldGroundHeight(it.x, it.z) + y
      const mat = (child as THREE.Sprite).material as THREE.SpriteMaterial
      mat.opacity = Math.max(0, 0.5 - y / 22) * (0.3 + storm * 0.6)
    })
  })

  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <sprite key={i} position={[it.x, 1, it.z]} scale={[it.scale, it.scale, 1]}>
          <spriteMaterial map={texture} color="#e0a15c" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  )
}

export function Battlefield({ quality, stormIntensity }: { quality: Quality; stormIntensity: MotionValue<number> }) {
  const chariots = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const x = (hash1(i, 50) - 0.5) * 120 + HANUMAN_BATTLEFIELD[0]
        const z = HANUMAN_BATTLEFIELD[2] + (hash1(i, 51) - 0.5) * 140
        return { position: [x, battlefieldGroundHeight(x, z), z] as [number, number, number], rotation: hash1(i, 52) * Math.PI * 2 }
      }),
    [],
  )
  const flags = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const x = (hash1(i, 60) - 0.5) * 100 + HANUMAN_BATTLEFIELD[0]
        const z = HANUMAN_BATTLEFIELD[2] + (hash1(i, 61) - 0.5) * 120
        return { position: [x, battlefieldGroundHeight(x, z), z] as [number, number, number], hue: i % 2 === 0 ? '#5c1f1a' : '#3a2b1f' }
      }),
    [],
  )

  return (
    <group>
      {chariots.map((c, i) => (
        <BrokenChariot key={i} {...c} />
      ))}
      {flags.map((f, i) => (
        <Flag key={i} {...f} />
      ))}
      <SmokeAndEmbers quality={quality} stormIntensity={stormIntensity} />
    </group>
  )
}
