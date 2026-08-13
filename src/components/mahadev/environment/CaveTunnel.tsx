import { useMemo } from 'react'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { AMPHITHEATER_CENTER, AMPHITHEATER_RADIUS, CAVE_CURVE_POINTS, CAVE_FLOOR_Y, fbm, hash1 } from '../terrain'
import { buildSpline } from '../timelineMath'

// Lightened well past what "dark wet cave rock" first suggested — at the
// original near-black values, even strong key/ambient light had almost no
// albedo to reflect, so the tunnel read as barely-there regardless of how
// it was lit: found by testing.
const WALL_COLOR = new THREE.Color('#3c342a')
const WET_COLOR = new THREE.Color('#48555a')

function radiusAt(u: number): number {
  const shrink = THREE.MathUtils.lerp(11.5, 7.2, Math.min(1, u / 0.82))
  const flare = u > 0.82 ? (u - 0.82) * 26 : 0
  return shrink + flare
}

/**
 * The tunnel walls — a TubeGeometry along CAVE_CURVE_POINTS, but with its
 * radius perturbed per-vertex by noise rather than left as the perfect,
 * mechanical cylinder TubeGeometry produces by default (which is exactly
 * the "primitive Three.js object" look the brief forbids). Rendered
 * `side={THREE.BackSide}` so the camera travelling along the curve's
 * interior sees the inside surface without needing to hand-flip winding.
 */
function TunnelWalls({ quality }: { quality: Quality }) {
  const tubularSegments = quality === 'high' ? 160 : quality === 'medium' ? 110 : 70
  const radialSegments = quality === 'high' ? 20 : quality === 'medium' ? 14 : 9

  const geometry = useMemo(() => {
    const curve = buildSpline(CAVE_CURVE_POINTS)
    const geo = new THREE.TubeGeometry(curve, tubularSegments, 1, radialSegments, false)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const center = new THREE.Vector3()
    const dir = new THREE.Vector3()
    const tmpColor = new THREE.Color()
    const radialCount = radialSegments + 1

    for (let i = 0; i < pos.count; i++) {
      const ring = Math.floor(i / radialCount)
      const seg = i % radialCount
      const u = Math.min(1, ring / tubularSegments)
      curve.getPointAt(u, center)
      dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(center).normalize()

      const isFloor = dir.y < -0.55
      const n = fbm(u * 22, seg * 0.85, 3) - 0.5
      // The floor branch used to bulge outward by the same radius formula
      // as the walls/ceiling — which, at this tube's actual radius
      // (~7-11 units), put the wall geometry's own floor 7+ units below
      // TunnelFloor's ribbon (built independently, always ~0.4 below the
      // centerline). Two unrelated "floor" surfaces that far apart either
      // left a visible gap or crossed and z-fought depending on where the
      // noise pushed the wall's floor that frame — exactly what read as
      // the cave "flickering": found by testing. Solving for the radius
      // that actually lands on the ribbon's own height (plus a little
      // noise for texture, not for divergence) keeps them one surface.
      let wallR: number
      if (isFloor) {
        const desiredY = center.y - 0.4 + n * 0.3
        wallR = Math.max(0.3, (desiredY - center.y) / dir.y)
      } else {
        const bulge = 0.3 + n * 0.85
        wallR = radiusAt(u) * (1 + bulge * 0.5)
      }

      const next = center.clone().addScaledVector(dir, wallR)
      pos.setXYZ(i, next.x, next.y, next.z)

      tmpColor.copy(WALL_COLOR).lerp(WET_COLOR, isFloor ? 0.7 : Math.max(0, -dir.y) * 0.4)
      const shade = 1 + n * 0.35
      tmpColor.multiplyScalar(shade)
      colors[i * 3] = tmpColor.r
      colors[i * 3 + 1] = tmpColor.g
      colors[i * 3 + 2] = tmpColor.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [tubularSegments, radialSegments])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.8} metalness={0.05} side={THREE.BackSide} />
    </mesh>
  )
}

/** A flat-ish ground ribbon following the same curve, sitting just inside
 * the lumpy walls' floor — avoids relying on the tube's own (frenet-frame-
 * dependent, and therefore unreliable on a bending curve) notion of "down"
 * for anything the camera and water need to read as a walkable floor. */
function TunnelFloor() {
  const geometry = useMemo(() => {
    const curve = buildSpline(CAVE_CURVE_POINTS)
    const samples = 140
    const points = curve.getSpacedPoints(samples)
    const positions: number[] = []
    const uvs: number[] = []
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= samples; i++) {
      const p = points[i]
      const u = i / samples
      const tangent = curve.getTangentAt(Math.min(1, Math.max(0, u)))
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize()
      const width = radiusAt(u) * 0.82
      const left = p.clone().addScaledVector(right, -width)
      const rightP = p.clone().addScaledVector(right, width)
      positions.push(left.x, left.y - 0.4, left.z, rightP.x, rightP.y - 0.4, rightP.z)
      uvs.push(0, u, 1, u)
    }
    const indices: number[] = []
    for (let i = 0; i < samples; i++) {
      const a = i * 2
      const b = i * 2 + 1
      const c = i * 2 + 2
      const d = i * 2 + 3
      indices.push(a, c, b, b, c, d)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#3a352b" roughness={0.55} metalness={0.08} />
    </mesh>
  )
}

// The largest tier's count — see RockScatter's identical MAX_COUNT/hash1
// pattern; the same Math.random()-keyed-on-quality bug (a full reshuffle
// every time PerformanceMonitor stepped quality down, most likely to
// happen in exactly this geometry-dense stretch) applied here too.
const MAX_STALACTITES = 26

/** Hanging rock, not decoration — sparse, irregular lengths, biased to the
 * tunnel's narrower midsection where a camera passing through reads them
 * against the darkness beyond. */
function Stalactites({ quality }: { quality: Quality }) {
  const count = quality === 'high' ? MAX_STALACTITES : quality === 'medium' ? 16 : 8
  const curve = useMemo(() => buildSpline(CAVE_CURVE_POINTS), [])
  const allItems = useMemo(
    () =>
      Array.from({ length: MAX_STALACTITES }, (_, i) => {
        const u = 0.08 + (i / MAX_STALACTITES) * 0.86
        const p = curve.getPointAt(u)
        const r = radiusAt(u)
        const angle = (hash1(i, 1) - 0.5) * 1.4
        const len = 1.4 + hash1(i, 2) * 3.6
        return {
          x: p.x + Math.sin(angle) * r * 0.35,
          y: p.y + r * 0.62,
          z: p.z + Math.cos(angle) * 1.5,
          len,
          rad: 0.25 + hash1(i, 3) * 0.35,
          rz: (hash1(i, 4) - 0.5) * 0.3,
        }
      }),
    [curve],
  )
  const items = allItems.slice(0, count)
  return (
    <group>
      {items.map((s, i) => (
        <mesh key={i} position={[s.x, s.y - s.len / 2, s.z]} rotation={[Math.PI, s.rz, 0]}>
          <coneGeometry args={[s.rad, s.len, 7]} />
          <meshStandardMaterial color="#443c30" roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The amphitheater — a wide bowl the tunnel opens into, built from a
 * partial, noise-displaced sphere rendered from the inside (again
 * `BackSide`). `thetaStart` is offset just past the pole so the very top
 * stays open: a ragged skylight the moonlight (and later the storm) reaches
 * the amphitheater floor through, per Scene 06/11's "opening in the rock
 * ceiling" and "clouds visible above him".
 */
function AmphitheaterDome({ quality }: { quality: Quality }) {
  const detail = quality === 'high' ? 64 : quality === 'medium' ? 44 : 28
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(AMPHITHEATER_RADIUS, detail, Math.floor(detail * 0.6), 0, Math.PI * 2, 0.22, 2.1)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const n = fbm(x * 0.09, z * 0.09, 4) - 0.5
      const len = Math.hypot(x, y, z) || 1
      const scale = 1 + n * 0.09
      pos.setXYZ(i, (x / len) * len * scale, (y / len) * len * scale, (z / len) * len * scale)
      tmp.set('#332c22').lerp(new THREE.Color('#4f4636'), Math.max(0, n))
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [detail])

  return (
    <mesh geometry={geometry} position={[AMPHITHEATER_CENTER[0], CAVE_FLOOR_Y + AMPHITHEATER_RADIUS * 0.72, AMPHITHEATER_CENTER[1]]}>
      <meshStandardMaterial vertexColors roughness={0.88} metalness={0.03} side={THREE.BackSide} />
    </mesh>
  )
}

/**
 * The amphitheater floor — snow, not bare rock (Scene 06's "large snowy
 * chamber", fed by the skylight above), with a vertex-noise surface so it
 * catches moonlight unevenly rather than reading as a flat disc. Footprints
 * (see Snow.tsx) sit as decals on top of this same surface.
 */
function AmphitheaterFloor() {
  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(AMPHITHEATER_RADIUS * 0.98, 80)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const n = fbm(x * 0.06, y * 0.06, 3) - 0.5
      pos.setZ(i, n * 0.9)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[AMPHITHEATER_CENTER[0], CAVE_FLOOR_Y, AMPHITHEATER_CENTER[1]]} receiveShadow>
      <meshStandardMaterial color="#c9d0d6" roughness={0.85} metalness={0.02} />
    </mesh>
  )
}

export function CaveTunnel({ quality }: { quality: Quality }) {
  return (
    <group>
      <TunnelWalls quality={quality} />
      <TunnelFloor />
      <Stalactites quality={quality} />
      <AmphitheaterDome quality={quality} />
      <AmphitheaterFloor />
    </group>
  )
}
