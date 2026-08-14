import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cloud, Clouds as DreiClouds, Sky as DreiSky } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { RAUDRA_T } from '../chapters'
import { HANUMAN_GROUND } from '../terrain'

/**
 * A real physically-based sky (three.js's own Rayleigh/Mie scattering
 * model, wrapped by drei — fully procedural, no texture/network fetch),
 * replacing the flat fog-color background the scene had before. The sun
 * arcs low-to-high-to-low across the whole scroll (grazing light at the
 * open/close, higher through the reveal/scale stretch), and turbidity/
 * rayleigh both climb through Raudra for a genuinely hazy, storm-heavy
 * sky rather than the same clear-day sky the whole way through.
 */
export function DynamicSky({ easedProgress }: { easedProgress: MotionValue<number> }) {
  const skyRef = useRef<THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>>(null)
  const sunPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const p = THREE.MathUtils.clamp(easedProgress.get(), 0, 1)
    const arc = Math.sin(p * Math.PI)
    // Capped well below true midday (was 38°) — that peak landed at the
    // same REVEAL/SCALE stretch hanumanPalette.ts's own EXPOSURE_KEYS also
    // peaks at (both tuned independently), and the two stacked into a
    // genuinely overexposed, blown-out-white sky confirmed directly from
    // a screenshot. A lower ceiling keeps this a warm low-angle sun the
    // whole way through rather than a bright noon sky fighting the grade.
    const elevationDeg = THREE.MathUtils.lerp(3, 22, arc)
    const azimuthDeg = THREE.MathUtils.lerp(70, 200, p)
    const phi = THREE.MathUtils.degToRad(90 - elevationDeg)
    const theta = THREE.MathUtils.degToRad(azimuthDeg)
    sunPos.setFromSphericalCoords(1, phi, theta)

    const raudra = THREE.MathUtils.smoothstep(p, RAUDRA_T - 0.02, RAUDRA_T + 0.03) * (1 - THREE.MathUtils.smoothstep(p, 0.94, 0.98))
    const u = skyRef.current?.material.uniforms
    if (!u) return
    u.sunPosition.value.copy(sunPos)
    u.turbidity.value = THREE.MathUtils.lerp(6, 20, raudra)
    u.rayleigh.value = THREE.MathUtils.lerp(1.1, 3.2, raudra)
  })

  return <DreiSky ref={skyRef} distance={900} turbidity={6} rayleigh={1.1} mieCoefficient={0.006} mieDirectionalG={0.8} />
}

/** Two loose, large cloud formations sitting where the camera actually
 * looks now (near HANUMAN_GROUND, not the old leap-altitude coordinates
 * this scene used before the leap arc was removed — see the sprite Clouds
 * below for that same fix). Real drei volumetric billboards rather than
 * another sprite layer, for the one or two "hero" formations the SHADOW/
 * RAUDRA beats actually need to read as physically present cloud mass. */
export function HeroClouds({ stormIntensity }: { stormIntensity: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    const storm = stormIntensity.get()
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * (0.01 + storm * 0.025)
    // Raudra's storm doesn't just add more cloud — the whole formation
    // sinks lower and swells, the same "ceiling coming down" read real
    // storm clouds have, rather than an unrelated new layer appearing.
    groupRef.current.position.y = 150 - storm * 35
    const s = 1 + storm * 0.5
    groupRef.current.scale.set(s, 1 + storm * 0.3, s)
  })
  return (
    <group ref={groupRef} position={[HANUMAN_GROUND[0], 150, HANUMAN_GROUND[2] - 40]}>
      <DreiClouds material={THREE.MeshBasicMaterial}>
        <Cloud seed={7} bounds={[90, 20, 60]} segments={30} volume={26} color="#cfd6de" opacity={0.55} fade={120} position={[30, 10, -20]} />
        <Cloud seed={13} bounds={[70, 16, 50]} segments={22} volume={20} color="#b8c0cc" opacity={0.4} fade={120} position={[-40, -6, 10]} />
      </DreiClouds>
    </group>
  )
}

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

/** A thin, reactive haze layer of soft sprite puffs — cheap, per-frame
 * reactive to stormIntensity in a way HeroClouds' real volumetrics aren't
 * (those are closer to static set-dressing; this is the layer that
 * actually thickens/lowers/spins faster as Raudra's storm builds).
 * Anchored near HANUMAN_GROUND at a height the *current* camera path
 * actually frames — this used to sit at the old leap arc's peak altitude
 * (y~170, z~-170), a coordinate system that stopped meaning anything once
 * the leap/battlefield were removed (terrain.ts), which meant the whole
 * storm was drifting somewhere the camera never once pointed. */
export function Clouds({ quality, stormIntensity }: { quality: Quality; stormIntensity: MotionValue<number> }) {
  const texture = useSoftTexture()
  const groupRef = useRef<THREE.Group>(null)
  const count = quality === 'high' ? 26 : quality === 'medium' ? 16 : 8

  const puffs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 50 + (i % 4) * 26
        return { angle, radius, y: (i % 4) * 10, scale: 30 + (i % 5) * 14 }
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
    <group ref={groupRef} position={[HANUMAN_GROUND[0], 120, HANUMAN_GROUND[2] - 60]}>
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
  const originX = HANUMAN_GROUND[0] + (Math.random() - 0.5) * 90
  const originZ = HANUMAN_GROUND[2] - 60 + (Math.random() - 0.5) * 90
  const topY = 190 + Math.random() * 25
  const bottomY = 60 + Math.random() * 30
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
      <pointLight
        ref={flashLight}
        position={[HANUMAN_GROUND[0], 130, HANUMAN_GROUND[2] - 60]}
        color="#dfe6f2"
        intensity={0}
        distance={280}
        decay={1.2}
      />
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
