import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { CAVE_FLOOR_Y, TRISHULA_POSITION, WATER_POINTS } from '../terrain'
import { buildSpline } from '../timelineMath'

/** A moving noise texture standing in for flowing water — cheap and
 * reliable; real-time planar reflection (see StillPool below) wouldn't
 * even look right here since rippling water doesn't hold a clean mirror
 * image anyway. */
function useFlowTexture() {
  return useMemo(() => {
    const w = 48
    const h = 320
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.sin(x * 0.55 + y * 0.16) * 0.5 + Math.sin(y * 0.35 + x * 0.22) * 0.3 + Math.random() * 0.25
        const v = Math.max(0, Math.min(255, 130 + n * 75))
        ctx.fillStyle = `rgb(${v},${v + 14},${Math.min(255, v + 30)})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 10)
    return texture
  }, [])
}

function widthAt(u: number): number {
  return THREE.MathUtils.lerp(0.85, 2.7, Math.min(1, u))
}

/**
 * Ganga — sourced high above the lingam (see Lingam.tsx), threading
 * back down through the tunnel and out along the exterior path. One
 * continuous ribbon rather than two separate objects (the old page had a
 * "GangaSource" and a "ValleyRiver" as unrelated pieces that only visually
 * lined up by luck) — the water the visitor meets deep in the cave is
 * provably the same water the path followed in.
 */
export function WaterStream({ worldTime }: { worldTime: MotionValue<number> }) {
  const texture = useFlowTexture()
  const geometry = useMemo(() => {
    const curve = buildSpline(WATER_POINTS)
    const samples = 160
    const points = curve.getSpacedPoints(samples)
    const positions: number[] = []
    const uvs: number[] = []
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= samples; i++) {
      const p = points[i]
      const u = i / samples
      const tangent = curve.getTangentAt(Math.min(1, Math.max(0, u)))
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize()
      const width = widthAt(u)
      const left = p.clone().addScaledVector(right, -width)
      const rightP = p.clone().addScaledVector(right, width)
      positions.push(left.x, left.y + 0.05, left.z, rightP.x, rightP.y + 0.05, rightP.z)
      uvs.push(0, u * 12, 1, u * 12)
    }
    const indices: number[] = []
    for (let i = 0; i < samples; i++) {
      const a = i * 2
      const b = i * 2 + 1
      const c = i * 2 + 2
      const d = i * 2 + 3
      indices.push(a, b, c, b, d, c)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(() => {
    texture.offset.y = -worldTime.get() * 0.3
    if (mat.current) mat.current.emissiveIntensity = 0.11 + Math.sin(worldTime.get() * 0.8) * 0.03
  })

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        ref={mat}
        map={texture}
        color="#9fb9c9"
        emissive="#1b323c"
        emissiveIntensity={0.12}
        roughness={0.25}
        metalness={0.15}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * A single still pool where the stream widens just past the Trishula
 * alcove — the one place in this world that gets a genuine real-time
 * planar reflection (drei's MeshReflectorMaterial) rather than the flow-
 * texture approximation, precisely because Scene 05 asks for water that
 * visibly "reflects the moonlight" while the camera is briefly still.
 */
export function StillPool() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TRISHULA_POSITION[0] + 7.5, CAVE_FLOOR_Y + 0.03, TRISHULA_POSITION[2] + 3]}>
      <circleGeometry args={[3.4, 56]} />
      <MeshReflectorMaterial
        blur={[240, 90]}
        resolution={512}
        mixBlur={0.9}
        mixStrength={22}
        roughness={0.4}
        depthScale={0.35}
        minDepthThreshold={0.8}
        maxDepthThreshold={1.2}
        color="#0c1013"
        metalness={0.3}
      />
    </mesh>
  )
}
