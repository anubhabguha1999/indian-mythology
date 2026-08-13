import { useMemo } from 'react'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { fbm, hash1 } from '../terrain'
import { PATH_POINTS, terrainHeight } from '../terrain'

const VARIANT_COUNT = 6
// The largest tier's count — the full deterministic field is always built
// at this size; quality only changes how many of it get rendered (see
// hash1's own doc comment for why this replaced Math.random()-keyed-on-
// quality, which reshuffled every rock whenever PerformanceMonitor
// stepped quality down mid-scroll).
const MAX_COUNT = 70

/** A handful of distinct irregular-rock geometries (noise-displaced
 * icosahedra) rather than one repeated primitive — repetition is the
 * single fastest way scattered rocks read as "a Three.js demo". Built once
 * and cycled through by scattered instances below. */
function useRockVariants() {
  return useMemo(() => {
    const variants: THREE.BufferGeometry[] = []
    for (let v = 0; v < VARIANT_COUNT; v++) {
      const geo = new THREE.IcosahedronGeometry(1, 1)
      const pos = geo.attributes.position
      const seedX = v * 71.3
      const seedZ = v * 19.7
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const y = pos.getY(i)
        const z = pos.getZ(i)
        const n = fbm(x * 1.6 + seedX, z * 1.6 + seedZ, 3) - 0.5
        const stretch = 1 + n * 0.55
        pos.setXYZ(i, x * stretch, y * (1 + n * 0.3), z * stretch)
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
      variants.push(geo)
    }
    return variants
  }, [])
}

/** Scattered boulders biased toward the approach path (foreground scale
 * reference, per the brief's own instruction), plus a few elongated "ruin"
 * slabs standing at a deliberate lean rather than upright — the closest
 * this world gets to architecture, and even that reads as something the
 * mountain has half-reclaimed rather than a built structure. */
export function RockScatter({ quality }: { quality: Quality }) {
  const variants = useRockVariants()
  const count = quality === 'high' ? MAX_COUNT : quality === 'medium' ? 42 : 20

  // Built once, at the full MAX_COUNT, independent of `quality` — `along`
  // (each rock's position down the path) is keyed to MAX_COUNT rather than
  // to `count`, so rock #10 sits in the same spot whether it's one of 20
  // rendered or one of 70. Quality only slices how many of this one stable
  // field get rendered.
  const allRocks = useMemo(
    () =>
      Array.from({ length: MAX_COUNT }, (_, i) => {
        const along = i / MAX_COUNT
        const seg = Math.min(PATH_POINTS.length - 2, Math.floor(along * (PATH_POINTS.length - 1)))
        const [px, pz] = PATH_POINTS[seg]
        const [qx, qz] = PATH_POINTS[seg + 1]
        const t = along * (PATH_POINTS.length - 1) - seg
        const cx = px + (qx - px) * t
        const cz = pz + (qz - pz) * t
        const side = (i % 2 === 0 ? 1 : -1) * (9 + hash1(i, 1) * 34)
        const jitter = (hash1(i, 2) - 0.5) * 20
        const x = cx + side
        const z = cz + jitter
        const y = terrainHeight(x, z)
        const scale = 0.6 + hash1(i, 3) * 2.4
        return {
          x,
          y: y + scale * 0.3,
          z,
          scale,
          rx: hash1(i, 4) * Math.PI,
          ry: hash1(i, 5) * Math.PI,
          rz: hash1(i, 6) * Math.PI,
          variant: i % VARIANT_COUNT,
        }
      }),
    [],
  )
  const rocks = allRocks.slice(0, count)

  const ruins = useMemo(
    () =>
      [
        { x: 14, z: 128, ry: 0.4, lean: 0.18, h: 3.4 },
        { x: -18, z: 96, ry: -0.7, lean: -0.1, h: 2.6 },
        { x: 9, z: 58, ry: 1.1, lean: 0.24, h: 4.1 },
        { x: -6, z: 22, ry: -0.3, lean: -0.16, h: 2.9 },
      ].map((r) => ({ ...r, y: terrainHeight(r.x, r.z) })),
    [],
  )

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={variants[r.variant]} position={[r.x, r.y, r.z]} rotation={[r.rx, r.ry, r.rz]} scale={r.scale} receiveShadow castShadow>
          <meshStandardMaterial color="#3a3530" roughness={0.92} metalness={0.03} />
        </mesh>
      ))}
      {ruins.map((r, i) => (
        <mesh key={i} position={[r.x, r.y + r.h / 2, r.z]} rotation={[r.lean, r.ry, r.lean * 0.4]} castShadow receiveShadow>
          <boxGeometry args={[1.1, r.h, 0.6]} />
          <meshStandardMaterial color="#2b2925" roughness={0.88} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}
