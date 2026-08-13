import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { DAMARU_POSITION } from '../terrain'

/**
 * Resting on the amphitheater floor near Shiva rather than floating and
 * pulsing the storm's rhythm — the old page used this as a constant
 * animated metronome; here it's a detail the camera can notice at rest, in
 * keeping with "presence, not spectacle". A very slight settle-breathing
 * motion is all that remains, as if it had only just been set down.
 *
 * Scaled well past a realistic hand-held size — true-to-life, this sat at
 * a fraction of a world unit across, which meant it was never actually
 * visible from any camera position in this world; found by testing.
 */
const SCALE = 5.5
export function Damaru({ worldTime }: { worldTime: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null)
  const drumGeometry = useMemo(() => {
    const profile = [
      [0.42, -0.52],
      [0.25, -0.32],
      [0.08, 0],
      [0.25, 0.32],
      [0.42, 0.52],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(profile, 20)
  }, [])

  useFrame(() => {
    const t = worldTime.get()
    if (group.current) group.current.rotation.z = Math.sin(t * 0.25) * 0.015
  })

  return (
    <group ref={group} position={DAMARU_POSITION} rotation={[0.1, 0.6, Math.PI / 2.15]} scale={SCALE}>
      <mesh geometry={drumGeometry} castShadow>
        <meshStandardMaterial color="#4a3320" roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.11, 0.014, 6, 16]} />
        <meshStandardMaterial color="#8a6a35" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}
