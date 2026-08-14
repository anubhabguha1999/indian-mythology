import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { buildRockGeometry, dawnGroundHeight, hash1, HANUMAN_GROUND } from '../terrain'

function useSoftTexture() {
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
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/** Dry grass, in loose clumps rather than one dense field — each clump a
 * handful of thin blades that bend together on the wind, cheap enough to
 * animate every frame without instancing machinery. */
function GrassClumps({ quality, windIntensity }: { quality: Quality; windIntensity: MotionValue<number> }) {
  const count = quality === 'high' ? 40 : quality === 'medium' ? 24 : 10
  const refs = useRef<(THREE.Group | null)[]>([])

  const clumps = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const x = (hash1(i, 10) - 0.5) * 140
        const z = 90 - hash1(i, 11) * 200
        const y = dawnGroundHeight(x, z)
        const blades = 3 + Math.floor(hash1(i, 12) * 3)
        return { x, y, z, blades, seed: hash1(i, 13) * 10 }
      }),
    [count],
  )

  useFrame((state) => {
    const wind = windIntensity.get()
    const t = state.clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const seed = clumps[i].seed
      g.rotation.z = Math.sin(t * (1.6 + wind * 2.2) + seed) * (0.08 + wind * 0.5)
    })
  })

  return (
    <group>
      {clumps.map((c, i) => (
        <group
          key={i}
          position={[c.x, c.y, c.z]}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          {Array.from({ length: c.blades }).map((_, b) => (
            <mesh key={b} position={[(b - c.blades / 2) * 0.18, 0.5, 0]} rotation={[0, 0, (b - c.blades / 2) * 0.15]}>
              <planeGeometry args={[0.06, 1 + hash1(i * 7 + b, 14) * 0.6]} />
              <meshStandardMaterial color="#4a3d26" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Dust — sparse, warm-lit motes drifting with the wind rather than a
 * dense fantasy haze; density and drift speed both track windIntensity. */
function Dust({ quality, windIntensity }: { quality: Quality; windIntensity: MotionValue<number> }) {
  const texture = useSoftTexture()
  const count = quality === 'high' ? 90 : quality === 'medium' ? 50 : 24
  const ref = useRef<THREE.Group>(null)
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash1(i, 20) - 0.5) * 160,
        y: hash1(i, 21) * 18 + 0.5,
        z: 90 - hash1(i, 22) * 260,
        speed: 4 + hash1(i, 23) * 6,
        scale: 0.3 + hash1(i, 24) * 0.7,
      })),
    [count],
  )
  const positions = useRef(motes.map((m) => ({ ...m })))

  useFrame((_, delta) => {
    const wind = windIntensity.get()
    if (!ref.current) return
    positions.current.forEach((m, i) => {
      m.x += m.speed * (0.3 + wind * 1.4) * delta
      if (m.x > 90) m.x = -90
      const child = ref.current!.children[i]
      if (child) child.position.set(m.x, m.y, m.z)
    })
  })

  return (
    <group ref={ref}>
      {motes.map((m, i) => (
        <sprite key={i} position={[m.x, m.y, m.z]} scale={[m.scale, m.scale, 1]}>
          <spriteMaterial map={texture} color="#c9a877" transparent opacity={0.22} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

// THE SHADOW is chapters.ts's own 0.18-0.28 window — the sweep starts a
// touch before it (building as THE WIND ends) and finishes just as THE
// FOOTSTEP begins, so the shadow crossing overhead hands off directly into
// the foot landing rather than the two beats fighting for the same moment.
const SHADOW_SWEEP_START = 0.15
const SHADOW_SWEEP_END = 0.29

/**
 * The giant shadow crossing the landscape (Scene 03) — a soft dark oval
 * sweeping across the ground ahead of the actual reveal, timed to
 * `easedProgress` directly rather than a separate keyframe track: it only
 * needs to exist across the shadow/mountain-reveal stretch, sweeping from
 * far to near as the progress crosses it.
 */
function ShadowSweep({ easedProgress }: { easedProgress: MotionValue<number> }) {
  const texture = useSoftTexture()
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const p = easedProgress.get()
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshBasicMaterial
    if (p < SHADOW_SWEEP_START || p > SHADOW_SWEEP_END) {
      mat.opacity = 0
      return
    }
    const local = (p - SHADOW_SWEEP_START) / (SHADOW_SWEEP_END - SHADOW_SWEEP_START)
    // Pushed darker and wider per direction ("make this part more
    // dramatic") — 0.55 read as a soft grey pass-over; 0.78 actually
    // reads as a shadow swallowing the ground ahead of him.
    mat.opacity = Math.sin(local * Math.PI) * 0.78
    const z = THREE.MathUtils.lerp(80, -20, local)
    ref.current.position.set(0, dawnGroundHeight(0, z) + 0.15, z)
  })

  // A flat, ground-hugging plane rather than a sprite — a sprite always
  // billboards to face the camera, which reads as a floating disc, not a
  // shadow actually cast across the terrain. Widened alongside the
  // opacity bump so the darker pass also feels bigger, not just blacker.
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[92, 40]} />
      <meshBasicMaterial map={texture} color="#050403" transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

const REVEAL_ROCKS = [
  { x: 18, z: -18, y: 3, s: 7 },
  { x: 12, z: -25, y: 5, s: 5.5 },
  { x: 23, z: -13, y: 2, s: 4.5 },
] as const

/** Real geometry, not a scripted opacity trick — placed directly in the
 * REVEAL camera's own path (cameraShots.ts's t=0.5-0.62 window cranes from
 * low/close up to face height) so the crane genuinely passes behind and
 * around them. This is what gives "natural occlusion" its honesty: a rock
 * blocks him because it is physically between the lens and him at that
 * exact camera height, the same reason a real foreground element would. */
function RevealRocks() {
  const geometries = useMemo(() => REVEAL_ROCKS.map((r, i) => buildRockGeometry(r.s, 2, i + 30, '#2a221a')), [])
  return (
    <group>
      {REVEAL_ROCKS.map((r, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          position={[r.x, r.y, r.z]}
          rotation={[hash1(i, 70) * 0.6, hash1(i, 71) * Math.PI * 2, hash1(i, 72) * 0.6]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial vertexColors roughness={0.94} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

/** A thin veil of mist sitting between the camera and Hanuman through the
 * reveal — present (not zero) at the start of the window and thinning to
 * nothing by the time his face is in frame, so the reveal itself feels like
 * atmosphere clearing rather than a hard cut from hidden to visible. */
function RevealMist({ easedProgress }: { easedProgress: MotionValue<number> }) {
  const texture = useSoftTexture()
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    const p = easedProgress.get()
    const local = THREE.MathUtils.clamp((p - 0.48) / (0.62 - 0.48), 0, 1)
    const opacity = (1 - local) * 0.4
    if (!ref.current) return
    ref.current.children.forEach((child) => {
      const mat = (child as THREE.Sprite).material as THREE.SpriteMaterial
      mat.opacity = opacity
    })
  })

  return (
    <group ref={ref} position={[HANUMAN_GROUND[0], 14, HANUMAN_GROUND[2] + 22]}>
      {[0, 1, 2].map((i) => (
        <sprite key={i} position={[(i - 1) * 14, (i % 2) * 6 - 3, i * 3]} scale={[40, 22, 1]}>
          <spriteMaterial map={texture} color="#cfd6de" transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

export function Wind({
  quality,
  windIntensity,
  easedProgress,
}: {
  quality: Quality
  windIntensity: MotionValue<number>
  easedProgress: MotionValue<number>
}) {
  return (
    <group>
      <GrassClumps quality={quality} windIntensity={windIntensity} />
      <Dust quality={quality} windIntensity={windIntensity} />
      <ShadowSweep easedProgress={easedProgress} />
      <RevealRocks />
      <RevealMist easedProgress={easedProgress} />
    </group>
  )
}
