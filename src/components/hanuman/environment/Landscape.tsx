import { useMemo } from 'react'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { battlefieldGroundHeight, dawnGroundHeight, fbm, hash1, HANUMAN_BATTLEFIELD, HANUMAN_GROUND } from '../terrain'

const GROUND_WIDTH = 900
const GROUND_NEAR_Z = 110
const GROUND_FAR_Z = -340

const EARTH_DRY = new THREE.Color('#3a2b1f')
const EARTH_DARK = new THREE.Color('#241a12')
const EARTH_SCORCHED = new THREE.Color('#1c1310')

/** One continuous ground strip — dry dawn earth blending into the more
 * churned, cracked battlefield further along, rather than two unrelated
 * planes that would seam visibly where the camera crosses between them. */
function Ground({ quality }: { quality: Quality }) {
  const segX = quality === 'high' ? 180 : quality === 'medium' ? 120 : 70
  const segZ = quality === 'high' ? 260 : quality === 'medium' ? 170 : 100

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(GROUND_WIDTH, GROUND_NEAR_Z - GROUND_FAR_Z, segX, segZ)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, 0, GROUND_FAR_Z + (GROUND_NEAR_Z - GROUND_FAR_Z) / 2)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Blend zone around the midpoint between the dawn ground and the
      // battlefield's own churned earth, rather than a hard cut.
      const battleT = THREE.MathUtils.smoothstep(-z, 120, 220)
      const y = THREE.MathUtils.lerp(dawnGroundHeight(x, z), battlefieldGroundHeight(x, z), battleT)
      pos.setY(i, y)

      const scorch = THREE.MathUtils.smoothstep(-z, 200, 280)
      tmp.copy(EARTH_DRY).lerp(EARTH_DARK, battleT * 0.7).lerp(EARTH_SCORCHED, scorch)
      const shade = 1 + (fbm(x * 0.05, z * 0.05, 3) - 0.5) * 0.4
      tmp.multiplyScalar(shade)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [segX, segZ])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.02} />
    </mesh>
  )
}

/** A distant ridge of low mountains — the "ancient landscape" backdrop the
 * dawn/wind/shadow beats read against, and what makes the mountain
 * Hanuman later carries actually register as impossibly large by
 * comparison rather than just another hill. */
function DistantRidge({ quality }: { quality: Quality }) {
  const segments = quality === 'high' ? 96 : quality === 'medium' ? 64 : 36
  const geometry = useMemo(() => {
    const width = 1400
    const depth = 300
    const geo = new THREE.PlaneGeometry(width, depth, segments, 8)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, 40, -650)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const ridge = (fbm(x * 0.006, 0, 5) - 0.3) * 120
      const falloff = 1 - Math.min(1, Math.abs(z + 650) / 150)
      pos.setY(i, Math.max(0, ridge * falloff))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [segments])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#332a24" roughness={0.9} metalness={0.02} fog />
    </mesh>
  )
}

/** Sparse rocks and dry, low trees scattered near the ground-level beats —
 * scale references, per the brief's own instruction, not decoration for
 * its own sake. Deterministic layout (hash1) so quality changes only add
 * or remove instances rather than reshuffling the whole field. */
function ScatterProps({ quality }: { quality: Quality }) {
  const count = quality === 'high' ? 46 : quality === 'medium' ? 28 : 14
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const isTree = hash1(i, 5) > 0.55
        const z = GROUND_NEAR_Z - hash1(i, 0) * 260
        const x = (hash1(i, 1) - 0.5) * 220
        const y = isTree ? dawnGroundHeight(x, z) : dawnGroundHeight(x, z) - 0.3
        const scale = isTree ? 3 + hash1(i, 2) * 4 : 0.8 + hash1(i, 2) * 2.2
        return { x, y, z, scale, isTree, rot: hash1(i, 3) * Math.PI * 2 }
      }),
    [count],
  )

  return (
    <group>
      {items.map((it, i) =>
        it.isTree ? (
          <group key={i} position={[it.x, it.y, it.z]} rotation={[0, it.rot, 0]}>
            <mesh position={[0, it.scale * 0.9, 0]}>
              <cylinderGeometry args={[it.scale * 0.06, it.scale * 0.1, it.scale * 1.8, 6]} />
              <meshStandardMaterial color="#241a12" roughness={0.9} />
            </mesh>
            <mesh position={[0, it.scale * 1.9, 0]}>
              <coneGeometry args={[it.scale * 0.8, it.scale * 1.6, 7]} />
              <meshStandardMaterial color="#2e2418" roughness={0.85} />
            </mesh>
          </group>
        ) : (
          <mesh key={i} position={[it.x, it.y, it.z]} rotation={[it.rot * 0.3, it.rot, it.rot * 0.2]}>
            <dodecahedronGeometry args={[it.scale, 0]} />
            <meshStandardMaterial color="#3a332c" roughness={0.95} metalness={0.03} />
          </mesh>
        ),
      )}
    </group>
  )
}

/** A single distant figure, standing where HANUMAN_GROUND is — the human-
 * scale reference the mountain reveal (Scene 05) needs to actually land:
 * without something recognizably person-sized in frame, "impossibly
 * large" has nothing to be impossible *relative to*. */
function ScaleFigure() {
  const pos = HANUMAN_GROUND
  return (
    <group position={[pos[0] + 34, dawnGroundHeight(pos[0] + 34, pos[2] + 18), pos[2] + 18]}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.22, 1.1, 4, 8]} />
        <meshStandardMaterial color="#0c0d0f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#0c0d0f" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Landscape({ quality }: { quality: Quality }) {
  return (
    <group>
      <Ground quality={quality} />
      <DistantRidge quality={quality} />
      <ScatterProps quality={quality} />
      <ScaleFigure />
      {/* A second, sparser scatter around the battlefield end — broken
          ground, not a forest; Battlefield.tsx supplies the war debris. */}
      <group position={[0, 0, 0]}>
        {[0, 1, 2, 3].map((i) => {
          const x = (hash1(i + 200, 1) - 0.5) * 160
          const z = HANUMAN_BATTLEFIELD[2] + (hash1(i + 200, 2) - 0.5) * 120
          const scale = 1.4 + hash1(i + 200, 3) * 2.4
          return (
            <mesh key={i} position={[x, battlefieldGroundHeight(x, z), z]}>
              <dodecahedronGeometry args={[scale, 0]} />
              <meshStandardMaterial color="#2a251f" roughness={0.95} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
