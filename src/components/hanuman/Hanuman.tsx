import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { fbm, hanumanHeadingAt, hanumanPositionAt, HANUMAN_GROUND, HANUMAN_HEIGHT } from './terrain'
import { STONE_GREY, WARM_GOLD } from './hanumanPalette'

/**
 * Rijul Tekriwal's "Hanuman Ji" (Sketchfab, CC-BY-4.0 — attribution lives
 * in the page Footer, per the license's own requirement) replaces an
 * earlier from-scratch primitive rig once this real, textured model was
 * supplied. It's a static devotional-statue mesh (no skeleton/animation),
 * which is exactly what this scene needs it to be: the position/rotation
 * driven each frame off `hanumanPositionAt`/`hanumanHeadingAt` moves it as
 * one rigid body, the same way the primitive rig was already being moved.
 */
const MODEL_URL = '/hanuman_ji/scene.gltf'
useGLTF.preload(MODEL_URL)

function HanumanModel() {
  const { scene } = useGLTF(MODEL_URL)

  const wrapper = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!(mesh as THREE.Mesh).isMesh) return
      // The model's flat halo disc (material "MATHalo") exports as a fully-
      // opaque, non-alpha texture — checked directly, no transparency
      // channel, no gradient — so it doesn't read as a soft radiance, it
      // reads as a gold coin floating disconnected behind his head at
      // certain angles. Filtering by material name rather than the node's
      // own name (an earlier attempt at `getObjectByName('Halo')` didn't
      // reliably catch it — GLTF node naming isn't always what the asset's
      // own material list suggests) so it's actually gone regardless of
      // how the exporter structured the node. A proper "presence" instead
      // comes from the warm point light below, not a floating shape.
      const material = mesh.material as THREE.Material | THREE.Material[]
      const materials = Array.isArray(material) ? material : [material]
      if (materials.some((m) => m.name === 'MATHalo')) {
        mesh.visible = false
        return
      }
      mesh.castShadow = true
      mesh.receiveShadow = true
    })
    // Re-center on X/Z and drop feet to y=0, then scale so the model's own
    // authored height matches HANUMAN_HEIGHT regardless of what units it
    // was exported in — the same "read the real geometry, don't guess a
    // number" discipline terrain.ts's own lingamRadiusAt-style helpers use
    // elsewhere in this codebase.
    const box = new THREE.Box3().setFromObject(cloned)
    const height = box.max.y - box.min.y || 1
    cloned.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2)
    const group = new THREE.Group()
    group.add(cloned)
    group.scale.setScalar(HANUMAN_HEIGHT / height)
    return group
  }, [scene])

  return <primitive object={wrapper} />
}

/** A mountain standing beside him at ground level, not literally gripped
 * in one hand — the supplied model is a fixed statue pose, not rigged for
 * "holding something aloft", so a floating boulder attached to an
 * arbitrary point on it would read as obviously wrong. Placed instead as
 * the scale-and-story object the "mountain" chapter needs, the same
 * broken-rock/tree/waterfall detail the brief asked for, just beside him
 * rather than in his hand. */
function Mountain({ quality }: { quality: Quality }) {
  const detail = quality === 'high' ? 3 : quality === 'medium' ? 2 : 1
  const rock = useMemo(() => new THREE.Color(STONE_GREY), [])
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(26, detail)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const len = Math.hypot(x, y, z) || 1
      const n = fbm(x * 0.06, z * 0.06, 4) - 0.5
      const scale = 1 + n * 0.45 + Math.max(0, y / len) * 0.1
      pos.setXYZ(i, (x / len) * len * scale, (y / len) * len * scale, (z / len) * len * scale)
      tmp.copy(rock).multiplyScalar(1 + n * 0.35)
      const greenT = Math.max(0, y / len - 0.15)
      tmp.lerp(new THREE.Color('#3a4530'), greenT * 0.45)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [detail, rock])

  const trees = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2
        const r = 15 + (i % 3) * 4
        return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, y: 17 + Math.sin(angle * 2) * 3, s: 2.4 + (i % 3) * 0.7 }
      }),
    [],
  )

  return (
    <group position={[HANUMAN_GROUND[0] - 55, 3, HANUMAN_GROUND[2] - 24]}>
      <mesh geometry={geometry} position={[0, 22, 0]} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.9} metalness={0.03} />
      </mesh>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, tr.y, tr.z]}>
          <mesh position={[0, tr.s * 0.6, 0]}>
            <cylinderGeometry args={[tr.s * 0.08, tr.s * 0.12, tr.s * 1.2, 5]} />
            <meshStandardMaterial color="#241a12" roughness={0.9} />
          </mesh>
          <mesh position={[0, tr.s * 1.3, 0]}>
            <coneGeometry args={[tr.s * 0.7, tr.s * 1.4, 6]} />
            <meshStandardMaterial color="#33422b" roughness={0.85} />
          </mesh>
        </group>
      ))}
      <mesh position={[16, 16, 8]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[2.4, 26]} />
        <meshStandardMaterial color="#cfe0e6" transparent opacity={0.55} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/**
 * Position/heading read each frame from `hanumanPositionAt`/
 * `hanumanHeadingAt` (terrain.ts), off the same eased progress the camera
 * curve itself rides — see TimelineController.tsx's own comment on why
 * that specific value, not the raw scroll fraction, is what everything
 * here has to agree on.
 *
 * The tilt during the leap went through three attempts before landing
 * here — the model has no skeleton, so the only lever available is
 * rotating the whole rigid body, and that has a hard ceiling: a fixed pose
 * (arms, legs, everything static) laid out flat and horizontal reads as a
 * mannequin no matter the angle, and a comet-tail/wobble bolted on top to
 * compensate read as a separate visual bug rather than motion (a stray
 * cone stuck to his foot, confirmed directly from the actual screenshots
 * rather than assumed). Removed both. What's left is a modest, capped
 * lean — present enough that he's clearly not standing bolt upright
 * mid-air, restrained enough that it never reaches the "lying flat" angle
 * that read as broken. This is the ceiling of what a static, unrigged
 * model can sell; an actually convincing leap pose needs a rigged/animated
 * source model, which this asset isn't.
 */
export function Hanuman({ quality, easedProgress }: { quality: Quality; easedProgress: MotionValue<number> }) {
  const rootRef = useRef<THREE.Group>(null)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const aheadPos = useMemo(() => new THREE.Vector3(), [])
  const behindPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const p = easedProgress.get()
    hanumanPositionAt(p, pos)
    const heading = hanumanHeadingAt(p)
    if (rootRef.current) {
      rootRef.current.position.copy(pos)
      rootRef.current.rotation.y = heading

      const EPS = 0.004
      hanumanPositionAt(Math.min(1, p + EPS), aheadPos)
      hanumanPositionAt(Math.max(0, p - EPS), behindPos)
      const forwardSpeed = Math.hypot(aheadPos.x - behindPos.x, aheadPos.z - behindPos.z)
      const isMoving = forwardSpeed > 1e-6
      // A constant forward lean while he's actually covering ground (see
      // terrain.ts's own comment: no more aerial arc, so there's no climb
      // angle left to derive a pitch from — this is a fixed sprint-lean
      // instead). Negative here, not positive: rotation.x is applied
      // before the heading yaw, and heading is already PI (180°) for this
      // entire window (hanumanHeadingAt), which flips which sign reads as
      // "forward" in world space — confirmed directly against a
      // screenshot showing the positive sign leaning him backward while
      // he moved forward.
      const LEAN = 0.22
      rootRef.current.rotation.x = isMoving ? -LEAN : 0
      rootRef.current.rotation.z = 0
    }
  })

  return (
    <>
      <group ref={rootRef}>
        <HanumanModel />
        {/* The "god feeling" per direction — not the floating halo disc,
            which read as a disconnected gold coin rather than radiance. A
            soft warm point light at head height instead: it lights the
            fur/jewelry from just above and slightly behind, close enough
            to read as presence, without ever being a shape on screen you
            can point at and call wrong. */}
        <pointLight position={[0, HANUMAN_HEIGHT * 0.95, -HANUMAN_HEIGHT * 0.12]} color={WARM_GOLD} intensity={3.2} distance={HANUMAN_HEIGHT * 1.8} decay={2} />
      </group>
      <Mountain quality={quality} />
    </>
  )
}
