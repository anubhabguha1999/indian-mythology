import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { motion, useInView, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useSectionLoadLock } from '@/hooks/useSectionLoadLock'
import { ManifestationLoader } from './ManifestationLoader'
import { AtmosphereLayers, Floor, Lamps, MandalaRings, Pillars, Steps } from './ManifestationEnvironment'
import { detectInitialQuality, stepDown, type Quality } from '@/utils/quality'

/** How long to wait for the canvas's first real frame before giving up and
 * unlocking scroll anyway — a genuine failure (WebGL unavailable, a context
 * creation error) should never trap the user's scroll indefinitely. */
const READY_TIMEOUT_MS = 8000

const CRIMSON = '#7a1118'
const GOLD = '#b99345'
const VOID_BG = '#030303'

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

/** Smoothstep — used everywhere below instead of raw scroll `t` so every
 * ramp eases in and out rather than moving at a constant, mechanical rate. */
function ease(t: number) {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

function pick<T>(quality: Quality, high: T, medium: T, low: T): T {
  return quality === 'high' ? high : quality === 'medium' ? medium : low
}

/**
 * The robed silhouette's profile, revolved into a lathe — feet lost in fog
 * at the bottom, tapering through waist and shoulders, up to a crowned
 * head. One continuous monumental form rather than stacked primitives.
 */
const BODY_PROFILE = [
  [0.0, -3.6],
  [1.55, -3.5],
  [1.42, -2.5],
  [1.1, -1.3],
  [0.92, -0.2],
  [1.3, 0.9],
  [1.12, 1.7],
  [0.5, 2.15],
  [0.58, 2.4],
  [0.38, 2.85],
  [0.0, 3.05],
].map(([x, y]) => new THREE.Vector2(x, y))

/**
 * A cinematic camera path, not a two-point tween — eleven hand-placed
 * shots (extreme wide → distant temple → silhouette → fog → crown →
 * upper body → arms → a low-angle dip → face height → full form → the
 * final hero frame), threaded through a Catmull-Rom spline so the camera
 * drifts rather than travels in a straight line. `t` below is intentionally
 * evenly spaced (0, 0.1, 0.2 … 1.0) so the curve's parametric `getPoint(t)`
 * lines up with these fractions — an arc-length parametrization would not.
 */
const SHOTS = [
  { t: 0.0, pos: [3.2, -2, 27], look: [1.6, -3, 6], fov: 38 },
  { t: 0.1, pos: [2.6, -1.8, 24.5], look: [1.2, -2.6, 4], fov: 36.5 },
  { t: 0.2, pos: [1.9, -1.5, 21], look: [0.7, -1.8, 2], fov: 35 },
  { t: 0.3, pos: [1.1, -1.1, 17.5], look: [0.35, 0.35, 0], fov: 33.5 },
  { t: 0.4, pos: [0.5, -0.6, 14.2], look: [0.12, 1.0, 0], fov: 32 },
  { t: 0.5, pos: [0.2, -0.1, 11.6], look: [0, 1.2, 0], fov: 31 },
  { t: 0.6, pos: [-0.1, 0.25, 9.8], look: [0, 1.3, 0], fov: 30 },
  { t: 0.7, pos: [0.05, -0.65, 8.3], look: [0, 1.85, 0], fov: 29 },
  { t: 0.8, pos: [0, 0.05, 7.5], look: [0, 1.6, 0], fov: 28 },
  { t: 0.9, pos: [0, 0.32, 7.0], look: [0, 1.48, 0], fov: 27 },
  { t: 1.0, pos: [0, 0.4, 6.6], look: [0, 1.42, 0], fov: 26 },
] as const

function buildSpline(points: readonly (readonly [number, number, number])[]) {
  return new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', 0.5)
}

function sampleFov(t: number) {
  const c = clamp01(t)
  for (let i = 0; i < SHOTS.length - 1; i++) {
    const a = SHOTS[i]
    const b = SHOTS[i + 1]
    if (c <= b.t) return a.fov + ((b.fov - a.fov) * (c - a.t)) / (b.t - a.t)
  }
  return SHOTS[SHOTS.length - 1].fov
}

const ARM_COUNT: Record<Quality, number> = { high: 6, medium: 5, low: 4 }
const HAIR_COUNT: Record<Quality, number> = { high: 9, medium: 7, low: 5 }
const CROWN_SPIKES: Record<Quality, number> = { high: 9, medium: 7, low: 6 }

/**
 * A slightly-enlarged backface-only duplicate of a mesh — the classic cheap
 * rim-light trick. It only shows through where it pokes past the front
 * mesh's silhouette, which reads as a thin glowing edge without needing any
 * per-pixel lighting math. Color/opacity are driven by scroll progress so
 * the rim ignites as the camera approaches rather than being always-on.
 */
function RimHull({
  geometry,
  color,
  opacity,
  scale = 1.045,
}: {
  geometry: THREE.BufferGeometry
  color: string
  opacity: MotionValue<number>
  scale?: number
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    if (mat.current) mat.current.opacity = opacity.get()
  })
  return (
    <mesh geometry={geometry} scale={scale}>
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

/**
 * Injects a tiny world-space sway into the robe's vertex shader — cheap
 * stand-in for cloth simulation. Stronger toward the hem (low, negative Y),
 * almost nonexistent at the rigid shoulders/crown, so it reads as "fabric
 * catching a slow wind" rather than the whole silhouette wobbling.
 */
function useClothMaterial() {
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#050403', roughness: 0.85, metalness: 0.05 })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 }
      shader.vertexShader =
        'uniform float uTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float sway = sin(uTime * 0.35 + position.y * 0.6) * 0.02 * clamp((1.0 - position.y) / 4.0, 0.0, 1.0);
          transformed.x += sway;`,
        )
      m.userData.shader = shader
    }
    return m
  }, [])
  return mat
}

/**
 * The figure herself — built entirely from procedural geometry (no sculpted
 * asset exists in this project), deliberately kept dark and under-detailed.
 * She is meant to read as scale and presence, not facial likeness — the
 * face is intentionally left unresolved here; RevelationScene picks up
 * immediately after this scene and does that work against the real
 * painted portrait.
 */
function Figure({ quality, backOpacity, keyIntensity }: { quality: Quality; backOpacity: MotionValue<number>; keyIntensity: MotionValue<number> }) {
  const bodyGeometry = useMemo(() => new THREE.LatheGeometry(BODY_PROFILE, pick(quality, 48, 36, 24)), [quality])
  const bodyMat = useClothMaterial()
  const armCount = ARM_COUNT[quality]
  const hairCount = HAIR_COUNT[quality]
  const crownCount = CROWN_SPIKES[quality]

  const arms = useMemo(
    () =>
      Array.from({ length: armCount }, (_, i) => {
        const side = i % 2 === 0 ? 1 : -1
        const tier = Math.floor(i / 2)
        const angle = side * (0.55 + tier * 0.38)
        const lift = 0.6 - tier * 0.55
        return { angle, lift, side, length: 1.9 - tier * 0.15, isTrident: i === armCount - 1 }
      }),
    [armCount],
  )

  const hair = useMemo(
    () =>
      Array.from({ length: hairCount }, (_, i) => {
        const t = i / (hairCount - 1)
        // Strands fan out sideways in *position*, not in orientation — they
        // still hang mostly straight down (a small rotation for a gentle
        // outward lean), which is what reads as cascading hair rather than
        // two blobs swung out to the sides.
        const spread = (t - 0.5) * 1.7
        return {
          x: spread,
          lean: spread * 0.55,
          length: 2.1 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
        }
      }),
    [hairCount],
  )

  const crown = useMemo(
    () => Array.from({ length: crownCount }, (_, i) => (i / crownCount) * Math.PI * 2),
    [crownCount],
  )

  const garland = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), [])

  // hairCount can shrink at runtime (PerformanceMonitor stepping the quality
  // tier down) — an array keyed only by index would otherwise leave stale
  // slots from the previous, longer render pointing at now-unmounted
  // groups. Rebuild fresh each time hairCount changes rather than mutating
  // in place from ref callbacks.
  const hairRefs = useRef<(THREE.Group | null)[]>([])
  hairRefs.current = useMemo(() => Array(hairCount).fill(null), [hairCount])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bodyMat.userData.shader) bodyMat.userData.shader.uniforms.uTime.value = t
    hairRefs.current.forEach((g, i) => {
      if (!g || !hair[i]) return
      g.rotation.z = Math.sin(t * 0.12 + hair[i].phase) * 0.05
      g.rotation.x = Math.cos(t * 0.09 + hair[i].phase) * 0.03
    })
  })

  const goldMat = <meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.65} />
  const darkMetal = <meshStandardMaterial color="#0d0b0a" roughness={0.55} metalness={0.5} />

  return (
    <group>
      {/* the robe/torso — the dominant silhouette mass, subtly alive in a slow wind */}
      <mesh geometry={bodyGeometry} material={bodyMat} />
      <RimHull geometry={bodyGeometry} color={CRIMSON} opacity={backOpacity} />

      {/* the garland — a plain loop of dark beads, never detailed into skulls */}
      <group position={[0, 1.35, 0]}>
        {garland.map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.62, Math.sin(angle) * 0.18 - 0.55, Math.sin(angle) * 0.3]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            {darkMetal}
          </mesh>
        ))}
      </group>

      {/* arms, fanned outward, kept slender so they read as gesture, not anatomy */}
      {arms.map((a, i) => (
        <group key={i} position={[0, 0.9, 0]} rotation={[0, 0, a.angle]}>
          <mesh position={[a.side * a.length * 0.5, a.lift, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.13, a.length, 4, pick(quality, 8, 6, 5)]} />
            <primitive object={bodyMat} attach="material" />
          </mesh>
          {/* an ornament at the hand — the one point on each arm allowed to glint */}
          <mesh position={[a.side * a.length, a.lift, 0]}>
            <torusGeometry args={[0.16, 0.045, 8, 16]} />
            {goldMat}
          </mesh>
          {/* one raised arm carries a plain trident silhouette — symbol, not a weapon shot */}
          {a.isTrident && (
            <group position={[a.side * a.length, a.lift + 0.7, 0]}>
              <mesh>
                <cylinderGeometry args={[0.025, 0.025, 1.4, 6]} />
                {darkMetal}
              </mesh>
              {[-0.14, 0, 0.14].map((x) => (
                <mesh key={x} position={[x, 0.75, 0]}>
                  <coneGeometry args={[0.03, 0.3, 6]} />
                  {darkMetal}
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}

      {/* hair, cascading down past the shoulders and drifting slowly as if in
          a cosmic wind — some strands cut off by fog before they resolve */}
      {hair.map((h, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) hairRefs.current[i] = el
          }}
          position={[h.x, 2.5, -0.2 - Math.abs(h.x) * 0.15]}
          rotation={[0.1, 0, h.lean]}
        >
          <mesh position={[0, -h.length * 0.5, 0]}>
            <coneGeometry args={[0.11, h.length, pick(quality, 10, 8, 6)]} />
            <primitive object={bodyMat} attach="material" />
          </mesh>
        </group>
      ))}

      {/* the crown — antique gold, the first thing meant to catch light */}
      <group position={[0, 2.98, 0]}>
        {crown.map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.32, 0.1, Math.sin(angle) * 0.32]} rotation={[0.5, -angle, 0]}>
            <coneGeometry args={[0.06, 0.34, 6]} />
            {goldMat}
          </mesh>
        ))}
        <mesh>
          <torusGeometry args={[0.34, 0.05, 8, 24]} />
          {goldMat}
        </mesh>
      </group>

      <KeyLightGlints keyIntensity={keyIntensity} />
    </group>
  )
}

/** A single point light riding just above the crown, standing in for the
 * "tiny golden highlights" the brief asks for — cheaper and more reliable
 * than trying to fake specular glints per-vertex. */
function KeyLightGlints({ keyIntensity }: { keyIntensity: MotionValue<number> }) {
  const light = useRef<THREE.PointLight>(null)
  useFrame(() => {
    if (light.current) light.current.intensity = keyIntensity.get() * 2.4
  })
  return <pointLight ref={light} position={[1.4, 3.3, 1.6]} color={GOLD} intensity={0} distance={7} decay={2} />
}

/**
 * Drives the camera every frame along the SHOTS spline, from the scene's
 * scroll progress — the main storytelling mechanism, per the brief. A
 * damped "smoothed" progress value chases the raw scroll value with
 * inertia, which is what gives the dolly its heavy, monumental feel instead
 * of tracking scroll 1:1. A slow, tiny, scroll-independent drift is layered
 * on top so the path never reads as a perfectly straight machine move.
 */
function CameraRig({ progress, backOpacity, keyIntensity }: { progress: MotionValue<number>; backOpacity: MotionValue<number>; keyIntensity: MotionValue<number> }) {
  const { camera } = useThree()
  const posCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.pos)), [])
  const lookCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.look)), [])
  const smoothed = useRef(0)
  const backLight = useRef<THREE.PointLight>(null)
  const ambientLight = useRef<THREE.AmbientLight>(null)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const raw = progress.get()
    smoothed.current += (raw - smoothed.current) * Math.min(1, delta * 1.6)
    const p = ease(smoothed.current)
    const t = state.clock.elapsedTime

    posCurve.getPoint(p, pos)
    lookCurve.getPoint(p, look)

    // a slow, human-operator drift — never quite the same frame twice
    pos.x += Math.sin(t * 0.11) * 0.05
    pos.y += Math.cos(t * 0.08) * 0.03

    camera.position.copy(pos)
    camera.lookAt(look)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = sampleFov(p)
      camera.updateProjectionMatrix()
    }

    // back light ramps in early — creates the silhouette before anything else
    const backRamp = clamp01(smoothed.current / 0.5)
    backOpacity.set(0.05 + backRamp * 0.55)
    if (backLight.current) backLight.current.intensity = 1.5 + backRamp * 7

    // key light arrives later — she's already a recognizable mass by then
    const keyRamp = clamp01((smoothed.current - 0.4) / 0.5)
    keyIntensity.set(keyRamp)

    if (ambientLight.current) ambientLight.current.intensity = 0.01 + p * 0.025
  })

  return (
    <>
      <ambientLight ref={ambientLight} intensity={0.01} />
      <pointLight ref={backLight} position={[0, 1.2, -6]} color={CRIMSON} intensity={0} distance={22} decay={1.6} />
      {/* LIGHT 03 — near-invisible cool fill on the opposite side, purely to
          separate her silhouette from the background rather than illuminate her */}
      <pointLight position={[-3, 1, 4]} color="#1a2436" intensity={0.4} distance={14} decay={2} />
    </>
  )
}

/** Real bloom/DoF/vignette/grain via @react-three/postprocessing — skipped
 * entirely on the 'low' tier, where EffectComposer's extra render passes
 * (especially depth-of-field) aren't worth the cost. */
function PostFX({ quality }: { quality: Quality }) {
  if (quality === 'low') return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.4} luminanceThreshold={0.35} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
      <DepthOfField focusDistance={0.02} focalLength={0.04} bokehScale={quality === 'high' ? 3.5 : 2} />
      <Vignette eskil={false} offset={0.25} darkness={0.9} />
      <Noise opacity={0.02} />
    </EffectComposer>
  )
}

/** Fires once, on the canvas's first actually-rendered frame — a much
 * stronger "it's really working" signal than Canvas's `onCreated` (which
 * fires once the renderer exists, not once it's drawn anything through the
 * full pipeline, including the postprocessing composer's own setup). */
function FirstFrameSignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady()
  })
  return null
}

function ManifestationStatic() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center gap-6 bg-obsidian px-6 text-center">
      <div
        className="h-24 w-24 rounded-full opacity-70 blur-md"
        style={{ background: 'radial-gradient(circle, rgba(122,17,24,0.7), transparent 70%)' }}
        aria-hidden="true"
      />
      <p className="font-display text-3xl tracking-wide text-ivory md:text-5xl">SHE EMERGED FROM IT.</p>
      <p className="font-serif text-lg italic text-ivory/55">Ancient, immense, and unmistakably divine.</p>
    </section>
  )
}

/**
 * Replaces the old eyes-in-the-dark ignition with a genuine 3D cinematic
 * approach — an eleven-shot camera path through a dark temple chamber,
 * toward a monumental, procedurally-built silhouette. Her face is
 * deliberately left unresolved here (no sculpted asset exists in this
 * project to put a face on); RevelationScene, immediately after, does that
 * work against the real painted portrait. This scene's job is purely
 * scale, environment and the sense of an approach — not detail.
 */
export function ManifestationScene() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const { ref, progress } = useScrollProgress(['start start', 'end end'])
  const mountRef = useRef<HTMLDivElement>(null)
  const shouldMount = useInView(mountRef, { once: false, margin: '25% 0px 25% 0px' })
  const [quality, setQuality] = useState<Quality>(() => detectInitialQuality(isMobile))
  const [ready, setReady] = useState(false)

  // Lock scroll for as long as the user is at this section and it hasn't
  // rendered anything yet — otherwise the wait (chunk already loaded, but
  // WebGL/shader setup still catching up) just looks like a blank page.
  useSectionLoadLock(shouldMount && !ready)

  // A genuine failure (WebGL unavailable, a context-creation error) means
  // FirstFrameSignal never fires — give up after a while and unlock rather
  // than trap the user's scroll forever.
  useEffect(() => {
    if (!shouldMount || ready) return
    const timer = setTimeout(() => setReady(true), READY_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [shouldMount, ready])

  // Plain, independently-settable motion values — CameraRig writes to these
  // every frame (backlight/key-light ramps computed from the damped camera
  // progress, not raw scroll), and Figure/RimHull read them back. Deriving
  // them with useTransform instead would fight CameraRig's manual .set()
  // calls the next time `progress` itself changes.
  const backOpacityMV = useMotionValue(0)
  const keyIntensityMV = useMotionValue(0)

  const line1Opacity = useTransform(progress, [0.04, 0.14, 0.26], [0, 1, 0])
  const line2Opacity = useTransform(progress, [0.4, 0.52, 0.68], [0, 1, 0])

  if (reducedMotion) return <ManifestationStatic />

  return (
    <section ref={ref} className="relative h-[320vh] bg-obsidian">
      <div ref={mountRef} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {shouldMount && (
          <Canvas
            dpr={[1, isMobile ? 1.3 : 2]}
            camera={{ position: SHOTS[0].pos as unknown as [number, number, number], fov: SHOTS[0].fov }}
            gl={{ antialias: true, alpha: false }}
            // R3F's Canvas sets `position:relative` via its own inline style,
            // which beats a Tailwind class of the same specificity-tier — pass
            // the override through `style` instead, where it actually wins.
            style={{ position: 'absolute', inset: 0 }}
          >
            <PerformanceMonitor onDecline={() => setQuality((q) => stepDown(q))} />
            <color attach="background" args={[VOID_BG]} />
            <fog attach="fog" args={[VOID_BG, 6, 38]} />
            <CameraRig progress={progress} backOpacity={backOpacityMV} keyIntensity={keyIntensityMV} />
            <Figure quality={quality} backOpacity={backOpacityMV} keyIntensity={keyIntensityMV} />
            <Floor />
            <Steps />
            <Pillars quality={quality} />
            <Lamps quality={quality} />
            <MandalaRings quality={quality} />
            <AtmosphereLayers quality={quality} />
            <PostFX quality={quality} />
            <FirstFrameSignal onReady={() => setReady(true)} />
          </Canvas>
        )}

        {shouldMount && !ready && <ManifestationLoader />}

        <div className="pointer-events-none absolute inset-0 vignette" />

        <div className="relative z-10 px-6 text-center">
          <motion.p
            style={{ opacity: line1Opacity }}
            className="absolute inset-x-0 top-[70%] font-display text-2xl tracking-wide text-ivory md:text-4xl"
          >
            SHE WAS NOT BORN
            <br />
            FROM DARKNESS.
          </motion.p>
          <motion.p
            style={{ opacity: line2Opacity }}
            className="absolute inset-x-0 top-[70%] font-display text-2xl tracking-wide text-ivory md:text-4xl"
          >
            SHE EMERGED
            <br />
            FROM IT.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
