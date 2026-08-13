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

/** Fixed jagged bolt paths near the peak, toggled on briefly rather than
 * regenerated per flash. Frequency and brightness both rise with
 * `stormIntensity`; driven by `worldTime` so it visibly freezes along with
 * everything else during the third-eye event. */
const BOLT_PATHS: Array<Array<[number, number, number]>> = [
  [
    [-24, 148, -80],
    [-18, 132, -74],
    [-27, 118, -84],
    [-20, 104, -76],
    [-26, 92, -82],
  ],
  [
    [20, 152, -60],
    [13, 136, -66],
    [22, 122, -56],
    [14, 108, -64],
    [21, 96, -58],
  ],
]

export function Lightning({ worldTime, stormIntensity }: { worldTime: MotionValue<number>; stormIntensity: MotionValue<number> }) {
  const flashLight = useRef<THREE.PointLight>(null)
  const boltMats = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const nextFlashAt = useRef(4)
  const activeUntil = useRef(0)
  const activeBolt = useRef(0)

  const boltGeometries = useMemo(
    () =>
      BOLT_PATHS.map((pts) => {
        const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
        return new THREE.TubeGeometry(curve, 20, 0.2, 6, false)
      }),
    [],
  )

  useFrame(() => {
    const t = worldTime.get()
    const storm = stormIntensity.get()
    if (t > nextFlashAt.current && storm > 0.35) {
      activeBolt.current = Math.floor(Math.random() * boltGeometries.length)
      activeUntil.current = t + 0.1 + Math.random() * 0.07
      const gap = Math.max(0.6, 5 - storm * 4)
      nextFlashAt.current = t + gap + Math.random() * gap * 0.6
    }
    const flashing = t < activeUntil.current
    boltMats.current.forEach((m, i) => {
      if (m) m.opacity = flashing && i === activeBolt.current ? 0.85 : 0
    })
    if (flashLight.current) flashLight.current.intensity = flashing ? 8 + storm * 16 : 0
  })

  return (
    <>
      <pointLight ref={flashLight} position={PEAK_SUMMIT} color="#dfe6f2" intensity={0} distance={260} decay={1.3} />
      {boltGeometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            ref={(el) => {
              boltMats.current[i] = el
            }}
            color="#e6ecf6"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}
