import * as THREE from 'three'

/**
 * World layout for the Hanuman experience — the shared coordinate system
 * every environment piece, the figure himself, and the camera shot list
 * read from. Same role as mahadev/terrain.ts.
 *
 * Convention: dawn/wind/shadow/mountain all happen at one fixed ground
 * position (HANUMAN_GROUND); the leap arcs him forward and up to
 * HANUMAN_BATTLEFIELD, where he stays stationary through the battle,
 * devotion, and final stillness. He is a moving actor across the leap,
 * not a fixed backdrop the camera walks past — see `hanumanPositionAt`.
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

/** Deterministic per-index random, same reasoning as mahadev/terrain.ts's
 * hash1 — scattered props (rocks, trees, chariots) need a stable layout
 * across quality changes rather than a Math.random() reroll. */
export function hash1(i: number, channel = 0): number {
  return hash(i * 12.9898 + channel * 78.233, channel * 37.719 - i * 4.121)
}

// --------------------------------------------------------------------------
// Ground
// --------------------------------------------------------------------------

export const GROUND_Y = 0
/** Dry, rolling dawn earth — gentle undulation, no dramatic peaks (the
 * mountain in this world is the one Hanuman carries, not the terrain
 * underfoot). */
export function dawnGroundHeight(x: number, z: number): number {
  return (fbm(x * 0.012, z * 0.012, 4) - 0.5) * 5 + (fbm(x * 0.08, z * 0.08, 3) - 0.5) * 0.8
}

/** Cracked, flatter battlefield earth — churned, not rolling. */
export function battlefieldGroundHeight(x: number, z: number): number {
  return (fbm(x * 0.02, z * 0.02, 3) - 0.5) * 1.4 + (fbm(x * 0.15, z * 0.15, 4) - 0.5) * 0.5
}

/** The actual rendered ground surface height at any (x, z) — the same
 * dawn->battlefield blend Landscape.tsx's own ground mesh uses (keyed off
 * world -z, not scroll t, so it lines up regardless of when something
 * crosses that line). hanumanPositionAt reads this instead of a flat
 * constant so his feet sit on the terrain that's actually drawn there
 * rather than hovering a noise-height's worth above or below it. */
export function groundHeightAt(x: number, z: number): number {
  const battleT = THREE.MathUtils.smoothstep(-z, 120, 220)
  return THREE.MathUtils.lerp(dawnGroundHeight(x, z), battlefieldGroundHeight(x, z), battleT)
}

// --------------------------------------------------------------------------
// Hanuman — scale and the leap arc
// --------------------------------------------------------------------------

/** His standing height, feet to crown — everything else (trees, rocks, a
 * distant lone figure) is scaled to read as tiny beside this, per the
 * brief's own "a tree should reach only partway up his leg" instruction. */
export const HANUMAN_HEIGHT = 46

export const HANUMAN_GROUND: readonly [number, number, number] = [0, GROUND_Y, -30]
export const HANUMAN_BATTLEFIELD: readonly [number, number, number] = [0, GROUND_Y, -280]

// Shrunk from 0.5-0.78 per direction ("remove the scrolling period from
// the mountain/leap chapters") — the whole leap now takes noticeably less
// scroll to get through. Kept exactly matching chapters.ts's own new LEAP
// (0.43) and BATTLE (0.64) boundaries, same relationship as before: the
// leap physically starts when the LEAP chapter label does and lands
// exactly when BATTLE begins.
export const LEAP_START_T = 0.43
export const LEAP_END_T = 0.64
// No longer an aerial arc — a static, unrigged model has no way to sell
// actually being airborne (see Hanuman.tsx's own comment history: three
// rounds of tilt/trail/wobble attempts, all rejected as "still floating"
// because there's no skeleton to pose mid-air convincingly, and the real
// parabola's own math forced him bolt-upright at the apex regardless).
// Per direction, he no longer leaves the ground at all — he covers the
// same distance as a fast, committed run along the earth instead of a
// jump through the sky, so there's never a moment where he's a rigid
// shape hanging disconnected in empty air. Kept the LEAP_START_T/
// LEAP_END_T names since every other file (chapters/camera/palette)
// still keys its own timing off this window, just not off an actual
// height any more.

/**
 * Where Hanuman's own root sits at a given scroll progress. Stationary at
 * HANUMAN_GROUND through dawn/wind/shadow/mountain, covers the ground
 * between there and HANUMAN_BATTLEFIELD during the leap/sky beats at a
 * fixed height (no arc — see the comment above), then stationary at
 * HANUMAN_BATTLEFIELD through battle/devotion/stillness.
 */
export function hanumanPositionAt(t: number, out = new THREE.Vector3()): THREE.Vector3 {
  if (t <= LEAP_START_T) return out.set(HANUMAN_GROUND[0], groundHeightAt(HANUMAN_GROUND[0], HANUMAN_GROUND[2]), HANUMAN_GROUND[2])
  if (t >= LEAP_END_T) return out.set(HANUMAN_BATTLEFIELD[0], groundHeightAt(HANUMAN_BATTLEFIELD[0], HANUMAN_BATTLEFIELD[2]), HANUMAN_BATTLEFIELD[2])
  const local = (t - LEAP_START_T) / (LEAP_END_T - LEAP_START_T)
  const x = THREE.MathUtils.lerp(HANUMAN_GROUND[0], HANUMAN_BATTLEFIELD[0], local)
  const z = THREE.MathUtils.lerp(HANUMAN_GROUND[2], HANUMAN_BATTLEFIELD[2], local)
  return out.set(x, groundHeightAt(x, z), z)
}

/** Facing direction (a Y rotation) — turned toward the battlefield once
 * the leap begins rather than held at whatever angle the dawn scenes used,
 * so he visibly commits to the jump instead of drifting sideways. */
export function hanumanHeadingAt(t: number): number {
  if (t <= LEAP_START_T) return 0
  return Math.PI
}
