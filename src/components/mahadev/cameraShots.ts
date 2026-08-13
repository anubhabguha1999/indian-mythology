import { LINGAM_MARK_WORLD, LINGAM_POSITION, lingamRadiusAt } from './terrain'
import { findSegment, lerpNum } from './timelineMath'

/**
 * The camera path — nineteen shots, unevenly spaced to match the brief's
 * own pacing (a long, slow opening flight; a dense cluster through the
 * mark macro; a sudden pull to aerial scale for Raudra). Every
 * position/look-at pair here is checked against `lingamRadiusAt` (the same
 * function the lingam's own geometry is built from, in terrain.ts) rather
 * than hand-guessed — the old page's camera clipped straight through the
 * river tube at one point specifically because its shots and its geometry
 * were authored independently of each other; the presence-approach shots
 * below (0.65-0.84) are all checked to clear the shaft's actual radius at
 * their height with a few units to spare.
 *
 * FOV doubles as the "lens" language the brief asks for: wide for the
 * exterior approach, progressively narrower through the cave and the
 * reveal, down to a close ~20° for the mark.
 */
export const SHOTS = [
  { t: 0.0, pos: [36, 5, 208], look: [8, 14, 150], fov: 50 },
  { t: 0.05, pos: [24, 7, 182], look: [2, 16, 120], fov: 48 },
  { t: 0.1, pos: [12, 9, 150], look: [-2, 18, 90], fov: 46 },
  { t: 0.16, pos: [2, 8, 118], look: [-4, 14, 70], fov: 44 },
  { t: 0.22, pos: [-4, 6, 86], look: [-6, 9, 45], fov: 42 },
  { t: 0.28, pos: [-5, 5, 54], look: [-6, 6, 20], fov: 40 },
  { t: 0.35, pos: [-3, 6, 20], look: [-5, 2, -10], fov: 36 },
  { t: 0.4, pos: [-6, 3, -4], look: [-8, 0.5, -22], fov: 32 },
  { t: 0.45, pos: [-4, 0.5, -24], look: [-9.5, 1.6, -29], fov: 27 },
  { t: 0.5, pos: [-1, 0, -42], look: [1, -4, -60], fov: 30 },
  { t: 0.55, pos: [3, 4, -58], look: [2, -11, -80], fov: 38 },
  { t: 0.6, pos: [3, 7, -73], look: [1, 2, -96], fov: 34 },
  { t: 0.65, pos: [2, 11, -85], look: [0, 17, -105], fov: 29 },
  { t: 0.7, pos: [1, 16, -95], look: [0, 22, -103], fov: 25 },
  { t: 0.75, pos: [0, 20, -95], look: [0, 24, -101], fov: 20 },
  { t: 0.8, pos: [0, 25, -90], look: [0, 25, -100], fov: 18 },
  // The mark sits at LINGAM_MARK_WORLD (~0, 25, -100.1) — shot placed 14
  // units in front of it along +Z, well outside the shaft's own radius
  // there (~7.9), so the close-up never clips into the geometry.
  { t: 0.84, pos: [LINGAM_MARK_WORLD[0], LINGAM_MARK_WORLD[1], LINGAM_MARK_WORLD[2] + 14], look: [...LINGAM_MARK_WORLD], fov: 20 },
  { t: 0.88, pos: [10, 40, -60], look: [0, 25, -100], fov: 32 },
  { t: 0.92, pos: [45, 120, 10], look: [0, 55, -70], fov: 48 },
  { t: 0.96, pos: [95, 155, 140], look: [0, 55, -70], fov: 46 },
  { t: 1.0, pos: [150, 175, 230], look: [0, 50, -70], fov: 44 },
] as const

// Dev-time-only guard: every shot's camera *position* is checked against
// the lingam's own radius at that height, with a couple of units to
// spare — this is exactly the check that would have caught the old page's
// river-tube clip and this build's own first-draft shots through the
// lingam before they were adjusted. Stripped in production builds.
if (import.meta.env.DEV) {
  for (const s of SHOTS) {
    const [x, y, z] = s.pos
    const distFromAxis = Math.hypot(x - LINGAM_POSITION[0], z - LINGAM_POSITION[2])
    const clearance = distFromAxis - lingamRadiusAt(y)
    if (clearance < 2) {
      console.warn(`[cameraShots] shot t=${s.t} sits only ${clearance.toFixed(2)} units clear of the lingam — check for clipping.`)
    }
  }
}

export function sampleFov(t: number): number {
  const { i, local } = findSegment(t, SHOTS)
  return lerpNum(SHOTS[i].fov, SHOTS[i + 1].fov, local)
}

export function mapCurveT(t: number): number {
  const { i, local } = findSegment(t, SHOTS)
  return (i + local) / (SHOTS.length - 1)
}

/**
 * Raudra's storm — near-silent through the whole approach/discovery/reveal
 * arc, then a real build once the third eye has opened, per Scene 11's
 * "not Shiva, the world" instruction: the environment gets chaotic, he
 * doesn't. Settles back to near-nothing for the held final stillness.
 */
export const STORM_KEYS = [
  { t: 0.0, v: 0.02 },
  { t: 0.35, v: 0.03 },
  { t: 0.55, v: 0.05 },
  { t: 0.75, v: 0.08 },
  { t: 0.84, v: 0.1 },
  { t: 0.88, v: 0.5 },
  { t: 0.92, v: 0.95 },
  { t: 0.96, v: 0.5 },
  { t: 1.0, v: 0.04 },
] as const

/** The moon/star visibility — mostly clouded over, briefly glimpsed at the
 * skylight and the third eye, hidden entirely by Raudra's storm, then the
 * clouds part for the final stillness (Scene 13). */
export const SKY_REVEAL_KEYS = [
  { t: 0.0, v: 0.05 },
  { t: 0.1, v: 0.16 },
  { t: 0.55, v: 0.3 },
  { t: 0.84, v: 0.35 },
  { t: 0.88, v: 0.14 },
  { t: 0.92, v: 0.05 },
  { t: 0.96, v: 0.55 },
  { t: 1.0, v: 0.92 },
] as const
