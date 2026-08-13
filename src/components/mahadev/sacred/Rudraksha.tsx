import { useMemo } from 'react'
import * as THREE from 'three'
import { DAMARU_POSITION } from '../terrain'

const BEAD_COUNT = 32
// Scaled well past realistic bead size — true-to-life (a fraction of a
// world unit), this was never actually visible from any camera position
// in this world; found by testing.
const BEAD_RADIUS = 0.32
const LOOP_RADIUS = 2.1
const BEAD_GEOMETRY = new THREE.IcosahedronGeometry(BEAD_RADIUS, 1)
const BEAD_MATERIAL = new THREE.MeshStandardMaterial({ color: '#2c2016', roughness: 0.78, metalness: 0.08 })

/**
 * A mala coiled loosely on the floor beside the Damaru — a small, easy-to-
 * miss detail rather than a worn accessory (nothing here needs a rigged
 * figure to hang it on), built as instanced beads along a slack, unevenly
 * settled loop rather than a perfect torus.
 */
export function Rudraksha() {
  const instanceRef = useMemo(() => {
    const dummy = new THREE.Object3D()
    const positions: THREE.Matrix4[] = []
    for (let i = 0; i < BEAD_COUNT; i++) {
      const a = (i / BEAD_COUNT) * Math.PI * 2
      const wobble = Math.sin(a * 3.1) * (LOOP_RADIUS * 0.09)
      const radius = LOOP_RADIUS + wobble
      dummy.position.set(Math.cos(a) * radius, Math.sin(a * 2) * (LOOP_RADIUS * 0.045), Math.sin(a) * radius * 0.72)
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.updateMatrix()
      positions.push(dummy.matrix.clone())
    }
    return positions
  }, [])

  return (
    <instancedMesh
      args={[BEAD_GEOMETRY, BEAD_MATERIAL, BEAD_COUNT]}
      position={[DAMARU_POSITION[0] - 3.5, DAMARU_POSITION[1] - 0.3, DAMARU_POSITION[2] + 3]}
      ref={(mesh) => {
        if (!mesh) return
        instanceRef.forEach((m, i) => mesh.setMatrixAt(i, m))
        mesh.instanceMatrix.needsUpdate = true
      }}
      castShadow
      receiveShadow
    />
  )
}
