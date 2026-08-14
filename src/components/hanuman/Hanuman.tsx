import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { fbm, ridgedFbm, hanumanHeadingAt, hanumanPositionAt, HANUMAN_GROUND, HANUMAN_HEIGHT } from './terrain'
import { STONE_GREY, WARM_GOLD } from './hanumanPalette'

// The GLTF's own gold-ornament materials read plastic/neon out of the box
// (high metalness paired with low roughness gives a mirror-chrome look
// under a single key light) — matched by name substring, same technique
// the halo-hiding logic below already uses, and pulled toward a duller,
// scratched-metal response instead of a showroom one. The Gada specifically
// is also singled out here: the brief's own complaint is that it dominates
// the frame, and a big glossy highlight down its whole length is what makes
// a large object read as *even larger* — killing that highlight (not its
// size; the asset's proportions stay real) is most of the fix.
const GOLD_MATERIAL_HINTS = ['gold', 'ornament', 'crown', 'armlet', 'bracelet']
const GADA_MESH_HINTS = ['gada', 'mace', 'club', 'weapon']

function tameMaterial(mesh: THREE.Mesh) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  for (const m of materials) {
    // Forced opaque unconditionally, regardless of material class — the
    // first attempt at this gated the fix behind `'roughness' in std`
    // (i.e. MeshStandardMaterial only), and the ghost/see-through dhoti
    // with a stray star-pattern bleeding through it was still there in
    // a follow-up screenshot, meaning that specific material is some
    // other class (MeshBasicMaterial/MeshPhysicalMaterial's own alpha
    // path, etc.) that the roughness gate skipped entirely. Every
    // THREE.Material has `transparent`/`opacity`, so this no longer
    // needs to guess which subclass it's touching. The one legitimately
    // transparent piece (the halo disc) is filtered out and hidden
    // entirely before tameMaterial ever runs, so everything reaching
    // this point is meant to be solid fabric/fur/skin/metal.
    m.transparent = false
    m.opacity = 1
    m.depthWrite = true
    m.alphaTest = 0

    const std = m as THREE.MeshStandardMaterial
    if (!('roughness' in std)) continue
    const name = (m.name || '').toLowerCase()
    const isGold = GOLD_MATERIAL_HINTS.some((h) => name.includes(h))
    if (isGold) {
      // Aged metal, not a mirror: less metalness than an exporter default,
      // more roughness so it only catches real highlights from the key/rim
      // lights rather than glowing uniformly.
      std.metalness = Math.min(std.metalness, 0.75)
      std.roughness = Math.max(std.roughness, 0.42)
    } else {
      // Fur/skin/cloth — knock down whatever uniform gloss the exporter
      // shipped with so it absorbs light instead of reading wet/plastic.
      std.metalness = Math.min(std.metalness, 0.08)
      std.roughness = Math.max(std.roughness, 0.75)
    }
  }
}

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
      tameMaterial(mesh)
      // The Gada, per direction, reads as dominating the frame — its own
      // node/mesh name is the only lever available on a static, unrigged
      // import (no separate prop to re-parent or re-scale independently).
      // A modest scale-down around the mesh's own local origin rather than
      // a global rescale of the whole figure: it's authored small enough
      // to stay attached at the grip while visibly taking up less frame.
      const meshName = (mesh.name || '').toLowerCase()
      if (GADA_MESH_HINTS.some((h) => meshName.includes(h))) {
        mesh.scale.multiplyScalar(0.86)
      }
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
  // One notch higher than before at every tier — a low-poly, faceted
  // silhouette is exactly the complaint this rebuilds away from, and the
  // ridged displacement below only reads as real geology once there are
  // enough vertices for it to actually carve into.
  const detail = quality === 'high' ? 4 : quality === 'medium' ? 3 : 2
  const rock = useMemo(() => new THREE.Color(STONE_GREY), [])
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(26, detail)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    const strataDark = new THREE.Color('#241f1a')
    const strataLight = new THREE.Color('#7d7264')
    const moss = new THREE.Color('#3a4530')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const len = Math.hypot(x, y, z) || 1
      // Ridged noise carves sharp broken cliffs/gullies instead of the old
      // smooth fbm bulge; a coarser second term breaks up the "one uniform
      // wrinkle frequency" look that still reads as a shader ball at a
      // glance even once displaced. Frequencies confirmed too low from a
      // screenshot: at radius 26 the original 0.05/0.018 multipliers gave
      // only 2-3 noise cycles across the whole object — smooth, gentle
      // undulation, not the cragged surface it was meant to read as. A
      // third, finer term adds actual micro-roughness at the scale a
      // close-up camera (several shots sit within 20-30 units of this)
      // can resolve.
      const ridge = ridgedFbm(x * 0.16, z * 0.16, 5) - 0.5
      const coarse = fbm(x * 0.05, z * 0.05, 3) - 0.5
      const fine = fbm(x * 0.4 + 50, z * 0.4 + 50, 2) - 0.5
      const n = ridge * 0.75 + coarse * 0.4 + fine * 0.18
      const scale = 1 + n * 0.65 + Math.max(0, y / len) * 0.12
      pos.setXYZ(i, (x / len) * len * scale, (y / len) * len * scale, (z / len) * len * scale)

      // Strata banding — rings of alternating light/dark rock keyed to
      // height plus a little noise-driven waver, the detail that actually
      // separates "sculpted rock formation" from "one flat grey material".
      const heightBand = Math.sin((y / len) * 14 + ridge * 4) * 0.5 + 0.5
      tmp.copy(strataDark).lerp(strataLight, heightBand).lerp(rock, 0.35)
      tmp.multiplyScalar(0.85 + coarse * 0.3)
      const greenT = Math.max(0, y / len - 0.2)
      tmp.lerp(moss, greenT * 0.4)
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
        <meshStandardMaterial vertexColors roughness={0.96} metalness={0} />
      </mesh>
      {/* Same layered-canopy treatment as environment/Landscape.tsx's own
          ScatterProps trees — a single cone read as an obvious toy-tree
          silhouette (confirmed directly from a screenshot), and this
          mountain sits close enough to several camera shots (the GADA/
          REVEAL windows both frame it) that the difference is visible. */}
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, tr.y, tr.z]}>
          <mesh position={[0, tr.s * 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[tr.s * 0.08, tr.s * 0.12, tr.s * 1.2, 5]} />
            <meshStandardMaterial color="#241a12" roughness={0.9} />
          </mesh>
          {[0, 1, 2].map((tier) => (
            <mesh key={tier} position={[0, tr.s * (1.05 + tier * 0.42), 0]} castShadow receiveShadow>
              <coneGeometry args={[tr.s * (0.75 - tier * 0.14), tr.s * 0.7, 7]} />
              <meshStandardMaterial color={tier === 1 ? '#33422b' : '#2e2418'} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Shrunk and tucked in close against the rock face — a screenshot
          showed this reading as a huge pale flat wall dominating a third
          of the frame rather than a small waterfall detail, plausibly
          this plane foreshortening oddly from certain angles. Smaller and
          closer to the rock's own silhouette bounds the worst case even
          if a future camera angle catches it edge-on again. */}
      <mesh position={[10, 8, 20]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[1.1, 11]} />
        <meshStandardMaterial color="#cfe0e6" transparent opacity={0.5} roughness={0.3} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

/**
 * Position read each frame from `hanumanPositionAt` (terrain.ts), off the
 * same eased progress the camera curve itself rides — see
 * TimelineController.tsx's own comment on why that specific value, not the
 * raw scroll fraction, is what everything here has to agree on.
 *
 * Per direction, he is stationary for the entire experience except one
 * single step at Raudra (terrain.ts's STEP_START_T/STEP_END_T) — there is
 * no more leap arc to pose for. The brief lean below only ever engages
 * across that one brief window, reading as the weight-shift of one
 * deliberate footfall rather than a sustained run.
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
      // A brief forward lean exactly across the one-step window — heading
      // is 0 the whole experience now (hanumanHeadingAt), so a positive
      // pitch here reads as leaning in his own facing direction.
      const LEAN = 0.1
      rootRef.current.rotation.x = isMoving ? LEAN : 0
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
