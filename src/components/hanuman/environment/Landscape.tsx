import { useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { buildRockGeometry, dawnGroundHeight, fbm, ridgedFbm, hash1, HANUMAN_GROUND } from '../terrain'

const GROUND_WIDTH = 900
const GROUND_NEAR_Z = 160
const GROUND_FAR_Z = -340

const EARTH_DRY = new THREE.Color('#3a2b1f')
const EARTH_DARK = new THREE.Color('#241a12')
const DUST_TAN = new THREE.Color('#5c4a30')
const DRY_GRASS = new THREE.Color('#4a4426')

/** One continuous ground plane — dry dawn earth the whole way, since per
 * direction there's no separate battlefield any more; only Raudra's
 * darkening grade (hanumanPalette.ts) and rising dust (Wind.tsx) mark the
 * storm arriving, not a change in the earth itself.
 *
 * Colored by slope, not just noise — a real ground plane isn't one uniform
 * brown wash: flatter low patches pick up dry-grass fleck, higher/steeper
 * noise picks up dustier tan, all layered under the same patch/shade fbm
 * as before. Slope is read straight from the height field itself (a finite
 * difference against neighboring samples) rather than invented separately,
 * so it can never disagree with the actual displaced geometry. */
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
    const EPS = 1.5
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = dawnGroundHeight(x, z)
      pos.setY(i, y)

      const slope = Math.min(1, (Math.abs(dawnGroundHeight(x + EPS, z) - y) + Math.abs(dawnGroundHeight(x, z + EPS) - y)) / EPS)
      const patch = fbm(x * 0.035, z * 0.035, 3)
      const grassMask = fbm(x * 0.022 + 90, z * 0.022 + 90, 3)

      tmp.copy(EARTH_DRY).lerp(EARTH_DARK, patch * 0.5)
      tmp.lerp(DUST_TAN, THREE.MathUtils.clamp(slope * 1.6, 0, 1) * 0.4)
      tmp.lerp(DRY_GRASS, Math.max(0, grassMask - 0.55) * 1.8 * (1 - slope))
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
  // Higher resolution than before across the board — a peak silhouette
  // this wide (1400 units) needs enough vertices for ridgedFbm's sharp
  // breaks to actually show up on the skyline rather than smoothing back
  // out into the same soft hill shape the old fbm gave it.
  const segments = quality === 'high' ? 160 : quality === 'medium' ? 100 : 56
  const geometry = useMemo(() => {
    const width = 1400
    const depth = 300
    const geo = new THREE.PlaneGeometry(width, depth, segments, 10)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, 40, -650)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const rockLow = new THREE.Color('#3a3128')
    const rockHigh = new THREE.Color('#5c5148')
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Two ridged octaves at different frequencies — one long-wavelength
      // pass for the overall range's shape, one shorter pass so individual
      // peaks along it break up independently instead of rising and
      // falling as one uniform wave.
      const range = ridgedFbm(x * 0.0035, 0, 5) * 150
      const peaks = ridgedFbm(x * 0.014 + 40, 0, 4) * 55
      const ridge = range * 0.75 + peaks * 0.5 - 45
      const falloff = 1 - Math.min(1, Math.abs(z + 650) / 150)
      const y = Math.max(0, ridge * falloff)
      pos.setY(i, y)
      tmp.copy(rockLow).lerp(rockHigh, THREE.MathUtils.clamp(y / 90, 0, 1))
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [segments])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0} fog />
    </mesh>
  )
}

/** A soft vertical gradient wall well behind the ridge — pure atmospheric
 * haze, the layer that sells "this range recedes into miles of humid air"
 * rather than the ridge just stopping against the fog color with a visible
 * edge. Cheap: one plane, one shader-free vertex-colored gradient, no
 * texture. */
function FarHaze() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2000, 320, 1, 12)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const top = new THREE.Color('#6b7a8c')
    const bottom = new THREE.Color('#3a3228')
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const yT = pos.getY(i) / 320 + 0.5
      tmp.copy(bottom).lerp(top, yT)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <mesh geometry={geometry} position={[0, 130, -980]}>
      <meshBasicMaterial vertexColors transparent opacity={0.55} depthWrite={false} fog />
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
  // Noise-displaced boulders, not bare zero-detail dodecahedrons — a
  // Platonic solid at detail 0 has no curvature for light to fall across,
  // which is exactly the flat faceted-silhouette look a screenshot showed
  // these reading as. Detail 1 (not Hanuman.tsx's carried-mountain detail
  // of 3-4) since these are small background/foreground props, not a hero
  // object the camera lingers on.
  const rockGeometries = useMemo(
    () => items.map((it, i) => (it.isTree ? null : buildRockGeometry(it.scale, 1, i, '#3a332c'))),
    [items],
  )

  return (
    <group>
      {items.map((it, i) =>
        it.isTree ? (
          <group key={i} position={[it.x, it.y, it.z]} rotation={[0, it.rot, 0]}>
            <mesh position={[0, it.scale * 0.9, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[it.scale * 0.06, it.scale * 0.1, it.scale * 1.8, 6]} />
              <meshStandardMaterial color="#241a12" roughness={0.9} />
            </mesh>
            {/* Three offset, staggered canopy tiers instead of one cone —
                a single cone reads as a toy-tree silhouette from any
                angle; layering three at different heights/radii breaks
                that up into something closer to an actual crown. */}
            {[0, 1, 2].map((tier) => (
              <mesh key={tier} position={[0, it.scale * (1.55 + tier * 0.42), 0]} castShadow receiveShadow>
                <coneGeometry args={[it.scale * (0.85 - tier * 0.16), it.scale * 0.75, 7]} />
                <meshStandardMaterial color={tier === 1 ? '#33422b' : '#2e2418'} roughness={0.85} />
              </mesh>
            ))}
          </group>
        ) : (
          <mesh
            key={i}
            geometry={rockGeometries[i]!}
            position={[it.x, it.y, it.z]}
            rotation={[it.rot * 0.3, it.rot, it.rot * 0.2]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
          </mesh>
        ),
      )}
    </group>
  )
}

// Real reflections, not a flat blue plane pretending to be water — drei's
// MeshReflectorMaterial actually renders the scene a second time into a
// blurred reflection buffer. Placed off to one side of HANUMAN_GROUND, a
// slow river bend rather than a symmetrical pond, since the brief asks
// repeatedly for a river through the ancient-world stretch specifically.
const RIVER_X = -78
const RIVER_Z = 30

/** A slow river bend in the midground — visible through the early
 * ground-level/wind/shadow beats, off to the side rather than something
 * the main camera path drives straight through. `quality==='low'` skips it
 * entirely (a second scene render per frame for the reflection is real
 * GPU cost, not worth it on weak hardware for a background detail). */
function River({ quality }: { quality: Quality }) {
  if (true) return null // TEMP DEBUG — isolating the pale-wall bug
  if (quality === 'low') return null
  const y = dawnGroundHeight(RIVER_X, RIVER_Z) - 0.35
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.18]} position={[RIVER_X, y, RIVER_Z]}>
      <planeGeometry args={[22, 150]} />
      <MeshReflectorMaterial
        resolution={quality === 'high' ? 512 : 256}
        mixBlur={9}
        mixStrength={1.4}
        roughness={0.55}
        depthScale={0.6}
        minDepthThreshold={0.85}
        maxDepthThreshold={1.2}
        color="#141d20"
        metalness={0.15}
      />
    </mesh>
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
      <FarHaze />
      <DistantRidge quality={quality} />
      <River quality={quality} />
      <ScatterProps quality={quality} />
      <ScaleFigure />
    </group>
  )
}
