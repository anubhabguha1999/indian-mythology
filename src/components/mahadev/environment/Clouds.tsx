import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { PEAK_SUMMIT } from '../terrain'

function useSoftTexture() {
  return useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])
}

/**
 * A thin, mostly-still cloud ceiling above the peak that only becomes
 * "storm" (per Scene 11 — the world grows chaotic, not Shiva) once
 * `stormIntensity` rises: bigger, faster-drifting, darker. Grounded above
 * a real mountain rather than the old page's cosmic vortex — no clouds
 * exist anywhere else in the journey, so there's nothing to mistake this
 * for but weather.
 */
export function Clouds({ quality, stormIntensity }: { quality: Quality; stormIntensity: MotionValue<number> }) {
  const texture = useSoftTexture()
  const groupRef = useRef<THREE.Group>(null)
  const count = quality === 'high' ? 14 : quality === 'medium' ? 9 : 5

  const puffs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 30 + (i % 3) * 12
        return { angle, radius, y: (i % 3) * 6, scale: 22 + (i % 4) * 8 }
      }),
    [count],
  )

  useFrame((_, delta) => {
    const storm = stormIntensity.get()
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.008 + storm * 0.05)
      const s = 0.35 + storm * 0.75
      groupRef.current.scale.set(s, 0.3 + storm * 0.45, s)
    }
  })

  return (
    <group ref={groupRef} position={[PEAK_SUMMIT[0], PEAK_SUMMIT[1] + 26, PEAK_SUMMIT[2]]}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius]} scale={[p.scale, p.scale * 0.6, 1]}>
          <spriteMaterial map={texture} color="#8b939c" transparent opacity={0.2} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/** A curve made of dead-straight segments between its points — Catmull-Rom
 * (used everywhere else in this file for the smooth camera/terrain splines)
 * rounds every corner it passes through, which is exactly wrong for a bolt:
 * real lightning is a jagged, angular fracture, not a bent wire. */
class PolylineCurve extends THREE.Curve<THREE.Vector3> {
  private readonly pts: THREE.Vector3[]
  constructor(pts: THREE.Vector3[]) {
    super()
    this.pts = pts
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const segs = this.pts.length - 1
    const segT = THREE.MathUtils.clamp(t, 0, 1) * segs
    const i = Math.min(segs - 1, Math.floor(segT))
    return target.copy(this.pts[i]).lerp(this.pts[i + 1], segT - i)
  }
}

/** A jagged descent from `topY` to `bottomY` — most jitter through the
 * middle, tapering to near-nothing at both ends so the strike actually
 * starts at a point in the sky and ends at one near the peak, rather than
 * fraying at either tip. */
function jaggedPath(originX: number, originZ: number, topY: number, bottomY: number, segments: number, spread: number) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const taper = Math.sin(t * Math.PI)
    const y = THREE.MathUtils.lerp(topY, bottomY, t)
    pts.push(new THREE.Vector3(originX + (Math.random() - 0.5) * spread * taper, y, originZ + (Math.random() - 0.5) * spread * 0.6 * taper))
  }
  return pts
}

interface Bolt {
  core: THREE.TubeGeometry
  glow: THREE.TubeGeometry
  forkCore: THREE.TubeGeometry | null
  forkGlow: THREE.TubeGeometry | null
}

function buildBolt(quality: Quality): Bolt {
  const originX = (Math.random() - 0.5) * 60
  const originZ = PEAK_SUMMIT[2] + (Math.random() - 0.5) * 30
  const topY = PEAK_SUMMIT[1] + 45 + Math.random() * 25
  const bottomY = PEAK_SUMMIT[1] - 8 + Math.random() * 20
  const segments = quality === 'low' ? 7 : 11
  const pts = jaggedPath(originX, originZ, topY, bottomY, segments, 14)
  const tubular = quality === 'low' ? 40 : 70
  const core = new THREE.TubeGeometry(new PolylineCurve(pts), tubular, 0.16, 5, false)
  const glow = new THREE.TubeGeometry(new PolylineCurve(pts), tubular, 0.85, 6, false)

  // Roughly a third of strikes throw off a shorter secondary fork partway
  // down — never from the very top or bottom, so it reads as a branch off
  // the main channel rather than a second unrelated bolt.
  let forkCore: THREE.TubeGeometry | null = null
  let forkGlow: THREE.TubeGeometry | null = null
  if (Math.random() < 0.45) {
    const branchAt = 2 + Math.floor(Math.random() * (pts.length - 4))
    const branchStart = pts[branchAt]
    const forkBottomY = branchStart.y - (8 + Math.random() * 14)
    const forkPts = jaggedPath(branchStart.x, branchStart.z, branchStart.y, forkBottomY, Math.max(3, Math.floor(segments * 0.5)), 9)
    forkPts[0] = branchStart
    forkCore = new THREE.TubeGeometry(new PolylineCurve(forkPts), Math.floor(tubular * 0.5), 0.1, 5, false)
    forkGlow = new THREE.TubeGeometry(new PolylineCurve(forkPts), Math.floor(tubular * 0.5), 0.55, 6, false)
  }

  return { core, glow, forkCore, forkGlow }
}

const BOLT_POOL_SIZE = 5

/**
 * A real strike, not a glowing wire: a jagged fractured path (occasionally
 * forked), a hot white core inside a softer additive glow tube for the
 * bloom pass to catch, and 2-3 rapid flickers per strike rather than one
 * flat flash — the double/triple stutter that makes lightning read as
 * electricity instead of a light switching on. Frequency and brightness
 * both rise with `stormIntensity`; driven by `worldTime` so it freezes
 * along with everything else during the third-eye event. `thunderTrigger`
 * fires once per strike (not per flicker) for the thunderclap outside the
 * canvas to sync to.
 */
export function Lightning({
  worldTime,
  stormIntensity,
  thunderTrigger,
  quality = 'high',
}: {
  worldTime: MotionValue<number>
  stormIntensity: MotionValue<number>
  thunderTrigger?: MotionValue<number>
  quality?: Quality
}) {
  const flashLight = useRef<THREE.PointLight>(null)
  const washLight = useRef<THREE.HemisphereLight>(null)
  const nextFlashAt = useRef(4)
  const activeBolt = useRef(0)
  const flickers = useRef<Array<{ start: number; end: number; strength: number }>>([])

  const bolts = useMemo(() => Array.from({ length: BOLT_POOL_SIZE }, () => buildBolt(quality)), [quality])
  // One entry per bolt in `bolts`, each holding refs to that bolt's own
  // core/glow/fork materials — the earlier draft packed all of these into
  // one flat ref array addressed by hand-computed indices, which quietly
  // left the fork's core material out of the loop that actually applies
  // the flicker (it sat at a hardcoded, always-on opacity): found by
  // testing. Per-bolt objects make "does this material get animated" a
  // structural fact instead of an index-arithmetic one.
  const matRefs = useRef<
    Array<{
      core: THREE.MeshBasicMaterial | null
      glow: THREE.MeshBasicMaterial | null
      forkCore: THREE.MeshBasicMaterial | null
      forkGlow: THREE.MeshBasicMaterial | null
    }>
  >(bolts.map(() => ({ core: null, glow: null, forkCore: null, forkGlow: null })))

  useFrame(() => {
    const t = worldTime.get()
    const storm = stormIntensity.get()
    if (t > nextFlashAt.current && storm > 0.35) {
      activeBolt.current = Math.floor(Math.random() * bolts.length)
      const flickerCount = 1 + Math.floor(Math.random() * 2)
      let cursor = t
      flickers.current = Array.from({ length: flickerCount }, (_, i) => {
        const dur = 0.035 + Math.random() * 0.05
        const seg = { start: cursor, end: cursor + dur, strength: i === 0 ? 1 : 0.35 + Math.random() * 0.4 }
        cursor += dur + 0.02 + Math.random() * 0.06
        return seg
      })
      const gap = Math.max(0.6, 5 - storm * 4)
      nextFlashAt.current = cursor + gap + Math.random() * gap * 0.6
      // Encodes the intensity the thunderclap should be built at, jittered
      // so consecutive flashes at near-identical storm levels still count
      // as a "change" outside the canvas (see SceneSignals.thunderTrigger).
      thunderTrigger?.set(storm + Math.random() * 1e-4)
    }

    let strength = 0
    for (const f of flickers.current) {
      if (t >= f.start && t <= f.end) {
        strength = f.strength
        break
      }
    }

    matRefs.current.forEach((refs, i) => {
      const active = i === activeBolt.current ? strength : 0
      if (refs.core) refs.core.opacity = active * 0.95
      if (refs.glow) refs.glow.opacity = active * 0.4
      if (refs.forkCore) refs.forkCore.opacity = active * 0.75
      if (refs.forkGlow) refs.forkGlow.opacity = active * 0.32
    })
    if (flashLight.current) flashLight.current.intensity = strength * (10 + storm * 20)
    if (washLight.current) washLight.current.intensity = strength * (0.5 + storm * 0.9)
  })

  return (
    <>
      <pointLight ref={flashLight} position={PEAK_SUMMIT} color="#dfe6f2" intensity={0} distance={320} decay={1.15} />
      {/* A broad, dim sky-wide wash on top of the focused point light above —
          real lightning lights the whole underside of the storm, not just
          the ground near the bolt. */}
      <hemisphereLight ref={washLight} color="#eef3ff" groundColor="#0a0d10" intensity={0} />
      {bolts.map((bolt, i) => (
        <group key={i}>
          <mesh geometry={bolt.glow}>
            <meshBasicMaterial
              ref={(el) => {
                matRefs.current[i].glow = el
              }}
              color="#a9c8ff"
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh geometry={bolt.core}>
            <meshBasicMaterial
              ref={(el) => {
                matRefs.current[i].core = el
              }}
              color="#f5f9ff"
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
          {bolt.forkCore && bolt.forkGlow && (
            <>
              <mesh geometry={bolt.forkGlow}>
                <meshBasicMaterial
                  ref={(el) => {
                    matRefs.current[i].forkGlow = el
                  }}
                  color="#a9c8ff"
                  transparent
                  opacity={0}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              <mesh geometry={bolt.forkCore}>
                <meshBasicMaterial
                  ref={(el) => {
                    matRefs.current[i].forkCore = el
                  }}
                  color="#f5f9ff"
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </>
  )
}
