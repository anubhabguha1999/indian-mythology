import { useMemo } from 'react'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { fbm } from '../terrain'
import { TRISHULA_POSITION } from '../terrain'

const SHAFT_HEIGHT = 6.2
const METAL_DARK = new THREE.Color('#232324')
const METAL_WORN = new THREE.Color('#4a4d50')

/** A hammered, pitted surface rather than a smooth CAD cylinder — small
 * per-vertex radius noise standing in for centuries of dents and forge
 * marks, plus a vertex-color patina so it reads as worked metal rather
 * than plastic even before any light touches it. */
function useWornMetalGeometry(radiusTop: number, radiusBottom: number, height: number, segments: number) {
  return useMemo(() => {
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 10)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const angle = Math.atan2(z, x)
      const n = fbm(angle * 2.4, y * 1.3, 3) - 0.5
      const r = Math.hypot(x, z) || 1
      const scale = 1 + n * 0.045
      pos.setX(i, (x / r) * r * scale)
      pos.setZ(i, (z / r) * r * scale)
      tmp.copy(METAL_DARK).lerp(METAL_WORN, Math.max(0, n) * 1.6)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [radiusTop, radiusBottom, height, segments])
}

/**
 * Planted at the tunnel's Trishula alcove — never a constant glow (the
 * brief is explicit: the metal only briefly catches whatever light is
 * already moving through the scene, TimelineController's moonlight grade).
 * Slightly asymmetric prongs — a real forged object, not three identical
 * instances of one cone.
 */
export function Trishula({ quality }: { quality: Quality }) {
  const segments = quality === 'low' ? 10 : 16
  const shaftGeo = useWornMetalGeometry(0.16, 0.24, SHAFT_HEIGHT, segments)
  const metalMat = <meshStandardMaterial vertexColors roughness={0.42} metalness={0.85} />

  const prongs = useMemo(
    () => [
      { side: -1, lean: 0.22, length: 1.85, twist: -0.12 },
      { side: 0, lean: 0.03, length: 2.05, twist: 0.02 },
      { side: 1, lean: -0.19, length: 1.75, twist: 0.1 },
    ],
    [],
  )

  return (
    <group position={TRISHULA_POSITION} rotation={[0.02, 0.4, -0.015]}>
      <mesh geometry={shaftGeo} position={[0, SHAFT_HEIGHT / 2, 0]} castShadow receiveShadow>
        {metalMat}
      </mesh>
      {prongs.map((p, i) => (
        <group key={i} position={[p.side * 0.34, SHAFT_HEIGHT + 0.35, p.side === 0 ? 0.1 : 0]} rotation={[p.twist, 0, p.side * 0.5 + p.lean]}>
          <mesh position={[0, p.length / 2, 0]} castShadow>
            <coneGeometry args={[0.11, p.length, 8]} />
            {metalMat}
          </mesh>
        </group>
      ))}
      <mesh position={[0, SHAFT_HEIGHT + 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.05, 8, 18]} />
        {metalMat}
      </mesh>
    </group>
  )
}
