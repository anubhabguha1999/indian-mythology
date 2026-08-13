import { useMemo } from 'react'
import * as THREE from 'three'
import type { Quality } from '@/utils/quality'
import { CAVE_MOUTH_Z, distanceToPath, terrainDetailNoise, terrainHeight } from '../terrain'

const WIDTH = 460
// From well behind the visitor's starting point out to just past the cave
// mouth — past CAVE_MOUTH_Z the hand-built tunnel/amphitheater geometry
// (CaveTunnel.tsx) takes over. Padded a few units past the mouth itself so
// there's a believable threshold lip rather than a hard mesh edge sitting
// exactly where the tunnel begins.
const DEPTH_FAR = 210
const DEPTH_NEAR = CAVE_MOUTH_Z - 6

const ROCK_DARK = new THREE.Color('#1c1a17')
const ROCK_MID = new THREE.Color('#413b34')
const SNOW_COLOR = new THREE.Color('#dfe4ea')
const SNOW_LINE = 18
const SNOW_FULL = 58

/**
 * The exterior mountain — a single displaced plane, same proven technique
 * as the old HimalayanWorld's Terrain, but wider/deeper (this world is
 * meant to feel colossal by the final pull-back), with a three-tone rock
 * blend instead of a two-tone one (the old flat brown read as a "blob";
 * dark wet rock near the path grading up through dry stone to snow reads
 * as an actual mountainside), and a real vertex-noise breakup strong enough
 * to survive the close, low camera the opening shots use.
 */
export function Terrain({ quality }: { quality: Quality }) {
  const segX = quality === 'high' ? 240 : quality === 'medium' ? 160 : 90
  const segZ = quality === 'high' ? 170 : quality === 'medium' ? 110 : 60

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, DEPTH_FAR - DEPTH_NEAR, segX, segZ)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, 0, DEPTH_NEAR + (DEPTH_FAR - DEPTH_NEAR) / 2)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = terrainHeight(x, z)
      pos.setY(i, y)

      const snowT = Math.min(1, Math.max(0, (y - SNOW_LINE) / (SNOW_FULL - SNOW_LINE)))
      const pathT = Math.min(1, Math.max(0, 1 - distanceToPath(x, z) / 26))
      tmp.copy(ROCK_DARK).lerp(ROCK_MID, 1 - pathT * 0.6).lerp(SNOW_COLOR, snowT)
      const shade = 1 + (terrainDetailNoise(x, z) - 0.5) * 0.38 * (1 - snowT)
      tmp.multiplyScalar(shade)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [segX, segZ])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0.02} />
    </mesh>
  )
}
