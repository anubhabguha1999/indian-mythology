import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { dawnGroundHeight, hash1, HANUMAN_GROUND } from '../terrain'

function useGlowTexture() {
  return useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(180,190,205,0.55)')
    gradient.addColorStop(0.5, 'rgba(120,120,130,0.28)')
    gradient.addColorStop(1, 'rgba(60,60,70,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/**
 * Raudra's storm dust — rising haze/grit around Hanuman as the wind and
 * clouds turn, entirely driven by `stormIntensity` (near-invisible outside
 * the Raudra window, since STORM_KEYS in cameraShots.ts keeps that track
 * flat everywhere else). Per direction there is no battlefield any more —
 * this replaces the old broken-chariots/torn-flags war debris, which
 * implied an actual battle that no longer happens in this cut. Cool grey,
 * not warm ember-orange: this is a wind/dust storm, not a fire.
 */
export function StormAtmosphere({ quality, stormIntensity }: { quality: Quality; stormIntensity: MotionValue<number> }) {
  const texture = useGlowTexture()
  const count = quality === 'high' ? 20 : quality === 'medium' ? 12 : 6
  const groupRef = useRef<THREE.Group>(null)
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash1(i, 40) - 0.5) * 130 + HANUMAN_GROUND[0],
        z: HANUMAN_GROUND[2] + (hash1(i, 41) - 0.5) * 150,
        speed: 1.5 + hash1(i, 42) * 2.5,
        scale: 4 + hash1(i, 43) * 8,
        phase: hash1(i, 44) * 10,
      })),
    [count],
  )

  useFrame((state) => {
    const storm = stormIntensity.get()
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const it = items[i]
      const y = 0.5 + ((state.clock.elapsedTime * it.speed + it.phase) % 16)
      child.position.y = dawnGroundHeight(it.x, it.z) + y
      const mat = (child as THREE.Sprite).material as THREE.SpriteMaterial
      mat.opacity = Math.max(0, 0.4 - y / 16) * storm
    })
  })

  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <sprite key={i} position={[it.x, 1, it.z]} scale={[it.scale, it.scale, 1]}>
          <spriteMaterial map={texture} color="#9aa2ac" transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
