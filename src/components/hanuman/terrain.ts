import * as THREE from 'three'
import { RAUDRA_T } from './chapters'

/**
 * World layout for the Hanuman experience — the shared coordinate system
 * every environment piece, the figure himself, and the camera shot list
 * read from. Same role as mahadev/terrain.ts.
 *
 * Per direction, this is no longer a "he moves from dawn ground to a
 * distant battlefield" world — there is no leap and no battle. Hanuman
 * stands at one fixed ground position (HANUMAN_GROUND) for the entire
 * experience; the world changes around him (light, wind, storm, camera),
 * he does not. The one exception is RAUDRA_T's single step — see
 * `hanumanPositionAt` below.
 */

function hash(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const a = hash(xi, zi)
  const b = hash(xi + 1, zi)
  const c = hash(xi, zi + 1)
  const d = hash(xi + 1, zi + 1)
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export function fbm(x: number, z: number, octaves = 4): number {
  let total = 0
  let amp = 1
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    total += valueNoise(x * freq, z * freq) * amp
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return total / max
}

/** Ridged variant — folds each octave around its midpoint (`1 - |2v-1|`)
 * instead of averaging it in directly, which is what turns smooth rolling
 * fbm into sharp, geological-looking ridgelines. Used wherever a silhouette
 * needs to read as real rock (the distant ridge, the carried mountain)
 * rather than a soft, rounded blob — a plain fbm mountain is exactly the
 * "faceted/abstract" look the brief calls out to remove. */
export function ridgedFbm(x: number, z: number, octaves = 5): number {
  let total = 0
  let amp = 0.5
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    const n = valueNoise(x * freq, z * freq)
    const ridge = 1 - Math.abs(2 * n - 1)
    total += ridge * ridge * amp
    max += amp
    amp *= 0.55
    freq *= 2.05
  }
  return total / max
}

/** Deterministic per-index random, same reasoning as mahadev/terrain.ts's
 * hash1 — scattered props (rocks, trees) need a stable layout across
 * quality changes rather than a Math.random() reroll. */
export function hash1(i: number, channel = 0): number {
  return hash(i * 12.9898 + channel * 78.233, channel * 37.719 - i * 4.121)
}

// --------------------------------------------------------------------------
// Ground
// --------------------------------------------------------------------------

export const GROUND_Y = 0
/** Dry, rolling dawn earth — gentle undulation, no dramatic peaks (the
 * mountain in this world is the one Hanuman carries, not the terrain
 * underfoot). One continuous ground the whole experience through — there
 * is no separate "battlefield earth" any more, so nothing here needs to
 * key off world position at all. */
export function dawnGroundHeight(x: number, z: number): number {
  return (fbm(x * 0.012, z * 0.012, 4) - 0.5) * 5 + (fbm(x * 0.08, z * 0.08, 3) - 0.5) * 0.8
}

/** The actual rendered ground surface height at any (x, z) — Landscape.tsx's
 * own ground mesh reads the same function, so hanumanPositionAt's feet sit
 * on the terrain that's actually drawn there rather than hovering a
 * noise-height's worth above or below it. */
export function groundHeightAt(x: number, z: number): number {
  return dawnGroundHeight(x, z)
}

// --------------------------------------------------------------------------
// Hanuman — scale and the single step
// --------------------------------------------------------------------------

/** His standing height, feet to crown — everything else (trees, rocks, a
 * distant lone figure) is scaled to read as tiny beside this, per the
 * brief's own "a tree should reach only partway up his leg" instruction. */
export const HANUMAN_HEIGHT = 46

export const HANUMAN_GROUND: readonly [number, number, number] = [0, GROUND_Y, -30]

// The one motion he makes in the entire experience — a single step forward
// as Raudra's storm arrives, per the brief's own "then: one step. the
// ground responds. that is enough." A short, sharp window (not a slow
// drift) so it reads as one deliberate footfall, not him sliding across
// the ground.
const STEP_START_T = RAUDRA_T + 0.02
const STEP_END_T = RAUDRA_T + 0.05
const STEP_DISTANCE = 3.2

/**
 * Where Hanuman's own root sits at a given scroll progress. Fixed at
 * HANUMAN_GROUND for the whole journey except the brief single step that
 * lands right as Raudra begins.
 */
export function hanumanPositionAt(t: number, out = new THREE.Vector3()): THREE.Vector3 {
  const [gx, , gz] = HANUMAN_GROUND
  const stepLocal = THREE.MathUtils.smoothstep(t, STEP_START_T, STEP_END_T)
  const z = gz + stepLocal * STEP_DISTANCE
  return out.set(gx, groundHeightAt(gx, z), z)
}

/** Facing direction (a Y rotation) — he faces the viewer/horizon the whole
 * time now; there is no leap turn to make. */
export function hanumanHeadingAt(_t: number): number {
  return 0
}
