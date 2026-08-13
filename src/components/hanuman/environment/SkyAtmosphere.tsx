import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'

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
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/** A layered cloud volume around the leap's peak altitude (y~150-220) —
 * thin and mostly still until `stormIntensity` rises for the sky/battle
 * stretch, per the brief's own "clouds should have realistic volume,
 * sunlight should scatter through them" instruction. Built from soft
 * sprite puffs (same technique as mahadev/environment/Clouds.tsx) rather
 * than a volumetric shader — real volumetrics are out of reach for
 * real-time web Three.js at this budget; layered soft sprites are the
 * honest approximation. */
export function Clouds({ quality, stormIntensity }: { quality: Quality; stormIntensity: MotionValue<number> }) {
  const texture = useSoftTexture()
  const groupRef = useRef<THREE.Group>(null)
  const count = quality === 'high' ? 26 : quality === 'medium' ? 16 : 8

  const puffs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 60 + (i % 4) * 30
        return { angle, radius, y: (i % 4) * 14, scale: 40 + (i % 5) * 18 }
      }),
    [count],
  )

  useFrame((_, delta) => {
    const storm = stormIntensity.get()
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.006 + storm * 0.03)
      const s = 0.7 + storm * 0.6
      groupRef.current.scale.set(s, 0.4 + storm * 0.3, s)
    }
  })

  return (
    <group ref={groupRef} position={[0, 170, -170]}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius]} scale={[p.scale, p.scale * 0.55, 1]}>
          <spriteMaterial map={texture} color="#cfd6de" transparent opacity={0.28} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/** A curve made of dead-straight segments — see mahadev/environment/
 * Clouds.tsx's own PolylineCurve for why: Catmull-Rom rounds every corner
 * a bolt passes through, which is exactly wrong for lightning. */
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

function buildBolt(): THREE.TubeGeometry {
  const originX = (Math.random() - 0.5) * 100
  const originZ = -170 + (Math.random() - 0.5) * 100
  const topY = 260 + Math.random() * 30
  const bottomY = 100 + Math.random() * 40
  const pts = jaggedPath(originX, originZ, topY, bottomY, 9, 18)
  return new THREE.TubeGeometry(new PolylineCurve(pts), 50, 0.22, 5, false)
}

const BOLT_POOL_SIZE = 4

/** Lightning through the sky/battle stretch — same flicker/fork approach
 * proven in mahadev/environment/Clouds.tsx, restrained per the brief's own
 * "no random lightning" caution: it only fires when `stormIntensity` is
 * genuinely up, not as ambient decoration. */
export function Lightning({ worldTime, stormIntensity }: { worldTime: MotionValue<number>; stormIntensity: MotionValue<number> }) {
  const flashLight = useRef<THREE.PointLight>(null)
  const nextFlashAt = useRef(6)
  const activeBolt = useRef(0)
  const flickers = useRef<Array<{ start: number; end: number; strength: number }>>([])
  const bolts = useMemo(() => Array.from({ length: BOLT_POOL_SIZE }, () => buildBolt()), [])
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])

  useFrame(() => {
    const t = worldTime.get()
    const storm = stormIntensity.get()
    if (t > nextFlashAt.current && storm > 0.4) {
      activeBolt.current = Math.floor(Math.random() * bolts.length)
      const flickerCount = 1 + Math.floor(Math.random() * 2)
      let cursor = t
      flickers.current = Array.from({ length: flickerCount }, (_, i) => {
        const dur = 0.03 + Math.random() * 0.05
        const seg = { start: cursor, end: cursor + dur, strength: i === 0 ? 1 : 0.4 + Math.random() * 0.3 }
        cursor += dur + 0.02 + Math.random() * 0.05
        return seg
      })
      const gap = Math.max(1.2, 6 - storm * 4)
      nextFlashAt.current = cursor + gap + Math.random() * gap * 0.6
    }
    let strength = 0
    for (const f of flickers.current) {
      if (t >= f.start && t <= f.end) {
        strength = f.strength
        break
      }
    }
    matRefs.current.forEach((m, i) => {
      if (m) m.opacity = i === activeBolt.current ? strength * 0.9 : 0
    })
    if (flashLight.current) flashLight.current.intensity = strength * (6 + storm * 14)
  })

  return (
    <>
      <pointLight ref={flashLight} position={[0, 180, -170]} color="#dfe6f2" intensity={0} distance={340} decay={1.2} />
      {bolts.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el
            }}
            color="#eef4ff"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}
