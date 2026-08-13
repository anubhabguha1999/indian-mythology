import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { fbm } from '../terrain'
import {
  LINGAM_MARK_WORLD,
  LINGAM_POSITION,
  LINGAM_TOTAL_HEIGHT,
  PEDESTAL_BASE_RADIUS,
  PEDESTAL_HEIGHT,
  PEDESTAL_TOP_RADIUS,
  lingamRadiusAt,
} from '../terrain'
import { SACRED_GOLD } from '../mahadevPalette'

/**
 * The Shivling — an aniconic column, not a body. The previous build put a
 * sculpted humanoid figure here; per direction, that's replaced with the
 * form Shiva is actually worshipped as in most temples: a smooth stone
 * column on a yoni pedestal. It also happens to solve the "photorealistic
 * skin/anatomy" problem the brief's own text can't fully have from
 * procedural geometry — a lingam only has to be convincing as *stone*,
 * which noise-displaced, vertex-shaded geometry genuinely can be.
 *
 * Built as one continuous lathe profile (pedestal through shaft through
 * the rounded dome tip), sampled directly from `lingamRadiusAt` (terrain.ts)
 * so the geometry the visitor sees and the radius the camera shots clear
 * against can never drift apart — the exact family of bug that put the old
 * page's camera through the river tube, and this build's own camera
 * through the first draft of this same lingam before this was shared.
 */
function useLingamGeometry(quality: Quality) {
  const segments = quality === 'high' ? 72 : quality === 'medium' ? 44 : 26
  return useMemo(() => {
    const steps = 56
    const points: THREE.Vector2[] = []
    for (let i = 0; i <= steps; i++) {
      const worldY = LINGAM_POSITION[1] + (LINGAM_TOTAL_HEIGHT * i) / steps
      const r = lingamRadiusAt(worldY)
      points.push(new THREE.Vector2(Math.max(0.05, r), worldY - LINGAM_POSITION[1]))
    }
    const geo = new THREE.LatheGeometry(points, segments)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const angle = Math.atan2(z, x)
      const r = Math.hypot(x, z) || 1
      // A lingam is traditionally smooth and polished, not rough-hewn like
      // the surrounding cave rock — displacement here is a fraction of
      // what Trishula's hammered-metal or the terrain's jagged rock use.
      const n = fbm(angle * 1.6, y * 0.09, 3) - 0.5
      const scale = 1 + n * 0.018
      pos.setX(i, (x / r) * r * scale)
      pos.setZ(i, (z / r) * r * scale)
      const shade = 0.5 + n * 0.55
      tmp.setRGB(shade * 0.2, shade * 0.19, shade * 0.185)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [segments])
}

/** The pitha/yoni base — a wide tapered platform with a spout (jalahari)
 * draining to one side, the channel that ritual water poured over a
 * lingam traditionally runs off through. */
function Pedestal() {
  const geometry = useMemo(() => new THREE.CylinderGeometry(PEDESTAL_TOP_RADIUS, PEDESTAL_BASE_RADIUS, PEDESTAL_HEIGHT, 28), [])
  return (
    <group position={LINGAM_POSITION}>
      <mesh geometry={geometry} position={[0, PEDESTAL_HEIGHT / 2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#232019" roughness={0.82} metalness={0.03} />
      </mesh>
      <mesh position={[PEDESTAL_BASE_RADIUS * 0.7, PEDESTAL_HEIGHT * 0.35, 0]} rotation={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[9, PEDESTAL_HEIGHT * 0.6, 4]} />
        <meshStandardMaterial color="#201d17" roughness={0.85} metalness={0.02} />
      </mesh>
    </group>
  )
}

/** A single naga (serpent) coiled loosely partway up the shaft — a
 * traditional, easy-to-miss detail rather than an accessory the whole
 * form is built around. */
function Naga({ quality }: { quality: Quality }) {
  const geometry = useMemo(() => {
    const coilTurns = 2.1
    const startY = 6
    const endY = 22
    const pts: THREE.Vector3[] = []
    const samples = quality === 'low' ? 40 : 64
    for (let i = 0; i <= samples; i++) {
      const t = i / samples
      const y = startY + (endY - startY) * t
      const angle = t * Math.PI * 2 * coilTurns
      const r = lingamRadiusAt(LINGAM_POSITION[1] + y) + 0.35
      pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    return new THREE.TubeGeometry(curve, quality === 'low' ? 60 : 100, 0.42, 8, false)
  }, [quality])

  return (
    <mesh geometry={geometry} position={[LINGAM_POSITION[0], LINGAM_POSITION[1] + PEDESTAL_HEIGHT, LINGAM_POSITION[2]]} castShadow>
      <meshStandardMaterial color="#171a15" roughness={0.55} metalness={0.15} />
    </mesh>
  )
}

/**
 * The mark — a thin vertical seam on the shaft's front face standing in
 * for the third eye. Closed and near-invisible through the whole journey;
 * `thirdEyeOpen` (0->1) widens it and lets a soft gold light through, per
 * the brief's own "no beam, no laser — the lighting changes" instruction.
 * The real environmental lighting shift lives in TimelineController's
 * grade; this is the one small, local event that goes with it.
 */
function Mark({ thirdEyeOpen }: { thirdEyeOpen: MotionValue<number> }) {
  const markRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const open = thirdEyeOpen.get()
    if (markRef.current) {
      markRef.current.scale.x = 0.15 + open * 0.85
      const mat = markRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = open * 1.6
    }
    if (lightRef.current) lightRef.current.intensity = open * 4
  })

  return (
    <group position={LINGAM_MARK_WORLD}>
      <mesh ref={markRef} scale={[0.15, 1, 1]}>
        <boxGeometry args={[0.16, 5.2, 0.05]} />
        <meshStandardMaterial color="#141210" emissive={SACRED_GOLD} emissiveIntensity={0} roughness={0.4} metalness={0.2} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0.6]} color={SACRED_GOLD} intensity={0} distance={10} decay={2} />
    </group>
  )
}

/** Ash colour for the tripundra — a devotional white/grey, not the sacred
 * gold reserved for the mark's own light-event. */
const ASH_PAINT = '#d9d2bf'
const KUMKUM_RED = '#9c231c'

/**
 * The tilak — three horizontal ash bands (tripundra) wrapping the shaft
 * plus a small vermillion dot, the actual mark devotees apply to a
 * Shivling. Distinct from `Mark` above (which stands in for the third eye
 * and stays dark until the freeze event triggers): this is always
 * present, full brightness, from the very first frame — it isn't part of
 * the story the scroll tells, it's just what the lingam looks like.
 */
function Tilak() {
  const bandYs = [15, 17, 19]
  const dotY = 13
  const dotRadius = lingamRadiusAt(dotY)

  return (
    <group>
      {bandYs.map((y) => (
        <mesh key={y} position={[LINGAM_POSITION[0], y, LINGAM_POSITION[2]]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[lingamRadiusAt(y) + 0.06, 0.16, 8, 48]} />
          <meshStandardMaterial color={ASH_PAINT} roughness={0.85} metalness={0.02} />
        </mesh>
      ))}
      <mesh position={[LINGAM_POSITION[0], dotY, LINGAM_POSITION[2] + dotRadius + 0.04]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial color={KUMKUM_RED} roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  )
}

export function Lingam({
  quality,
  worldTime,
  thirdEyeOpen,
  rimIntensity,
}: {
  quality: Quality
  worldTime: MotionValue<number>
  thirdEyeOpen: MotionValue<number>
  rimIntensity: MotionValue<number>
}) {
  const geometry = useLingamGeometry(quality)
  const rimLightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (rimLightRef.current) rimLightRef.current.intensity = rimIntensity.get() * (quality === 'low' ? 3 : 5.5)
    void worldTime
  })

  return (
    <group>
      <Pedestal />
      <mesh geometry={geometry} position={LINGAM_POSITION} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.42} metalness={0.08} />
      </mesh>
      <Naga quality={quality} />
      <Tilak />
      <Mark thirdEyeOpen={thirdEyeOpen} />
      <pointLight
        ref={rimLightRef}
        position={[LINGAM_POSITION[0], LINGAM_POSITION[1] + 30, LINGAM_POSITION[2] - 8]}
        color="#9fb0bc"
        intensity={0}
        distance={40}
        decay={1.6}
      />
    </group>
  )
}
