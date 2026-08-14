import { findSegment, lerpNum } from '@/components/mahadev/timelineMath'

/**
 * The camera path for the ten-stage timeline (chapters.ts): pitch black at
 * ground level, a slow reveal of the landscape as wind arrives, a shadow
 * sweeping overhead, dropping low for the footstep, a 50mm pass introducing
 * the Gada beside him, a rising crane shot revealing Hanuman himself
 * (legs -> torso -> face, never all at once), a dramatic pull-back that
 * sells the true scale of the world around him, a close quiet devotion
 * hold, a Raudra beat that widens just enough to show the storm without
 * ever cutting to a "boss fight" angle, and a final extreme-wide silhouette
 * against the sunset. FOV narrows for the close/quiet beats (footstep,
 * devotion) and widens for the scale shots (the pull-back, the final
 * stillness) — lens as language, same discipline as the Mahadev shot list.
 */
export const SHOTS = [
  // BLACKNESS (0-8%) — extreme ground level, almost nothing visible.
  { t: 0.0, pos: [0, 0.3, 62], look: [0, 1, 20], fov: 24 },
  { t: 0.05, pos: [1, 0.4, 54], look: [0, 1.6, 8], fov: 26 },
  // THE WIND (8-18%) — the landscape starts to arrive; still low, widening.
  { t: 0.08, pos: [2, 0.6, 48], look: [0, 2.5, -4], fov: 30 },
  { t: 0.14, pos: [8, 2, 30], look: [0, 6, -10], fov: 35 },
  // THE SHADOW (18-28%) — wide enough to hold the full sweep overhead.
  { t: 0.18, pos: [6, 4, 12], look: [0, 20, -15], fov: 46 },
  { t: 0.24, pos: [14, 3, -2], look: [0, 15, -20], fov: 40 },
  // THE FOOTSTEP (28-40%) — the camera drops hard, low and close, looking
  // up at the moment of impact. Only foot/fur/dust, nothing else yet.
  { t: 0.28, pos: [12, 1, -14], look: [3, 4, -28], fov: 30 },
  { t: 0.34, pos: [16, 1.4, -18], look: [2, 5, -28], fov: 32 },
  // THE GADA (40-50%) — 50mm, beside him at his own height, never head-on
  // filling the frame the way the old blocking did.
  { t: 0.4, pos: [22, 4, -20], look: [11, 6, -24], fov: 50 },
  { t: 0.46, pos: [27, 6, -25], look: [7, 10, -28], fov: 44 },
  // THE REVEAL (50-65%) — a rising crane: legs, then torso/arms, then face,
  // each held long enough to actually register before the next.
  { t: 0.5, pos: [30, 2, -8], look: [0, 3, -30], fov: 36 },
  { t: 0.56, pos: [25, 14, -14], look: [0, 17, -30], fov: 33 },
  { t: 0.62, pos: [10, 24, -18], look: [0, 27, -30], fov: 29 },
  // THE SCALE (65-75%) — begins close on him, then the single biggest pull
  // in the whole piece: 10m -> 50m -> ~200m, the world growing around him
  // rather than him shrinking on his own.
  { t: 0.65, pos: [6, 22, -16], look: [0, 24, -30], fov: 25 },
  { t: 0.7, pos: [58, 30, 22], look: [0, 24, -30], fov: 34 },
  { t: 0.75, pos: [210, 92, 130], look: [0, 24, -30], fov: 22 },
  // DEVOTION (75-85%) — approaching from behind and above, quiet and
  // telephoto; tightens once more right at the freeze (DEVOTION_T) toward
  // a near-100mm hold on the face before easing back for the hand-to-heart
  // beat.
  { t: 0.77, pos: [5, 24, -52], look: [0, 23, -18], fov: 24 },
  { t: 0.8, pos: [12, 22.5, -38], look: [1, 23.2, -30], fov: 17 },
  { t: 0.83, pos: [9, 23, -35], look: [0, 23, -30], fov: 20 },
  // RAUDRA (85-94%) — pulls back only enough to show the storm arriving
  // (dark clouds, dust, distant lightning); low and dramatic for the one
  // step, never a "monster reveal" angle.
  { t: 0.85, pos: [40, 20, -6], look: [0, 22, -30], fov: 34 },
  { t: 0.9, pos: [18, 4, -4], look: [1, 10, -30], fov: 29 },
  // THE IMPOSSIBLE (94-100%) — the final extreme wide: a silhouette on the
  // ridge against the sunset, everything else in the frame is world.
  { t: 0.94, pos: [190, 105, 110], look: [0, 24, -30], fov: 23 },
  { t: 1.0, pos: [225, 118, 128], look: [0, 24, -30], fov: 21 },
] as const

export function sampleFov(t: number): number {
  const { i, local } = findSegment(t, SHOTS)
  return lerpNum(SHOTS[i].fov, SHOTS[i + 1].fov, local)
}

export function mapCurveT(t: number): number {
  const { i, local } = findSegment(t, SHOTS)
  return (i + local) / (SHOTS.length - 1)
}

/** Wind/dust intensity — dead silent at the very opening, arriving with
 * THE WIND, building through the shadow/footstep beats, settling through
 * the Gada/reveal/scale stretch (nothing should visually compete with the
 * reveal itself), hushed for devotion, then a hard surge for Raudra before
 * settling again for the close. */
export const WIND_KEYS = [
  { t: 0.0, v: 0.02 },
  { t: 0.08, v: 0.15 },
  { t: 0.18, v: 0.35 },
  { t: 0.28, v: 0.55 },
  { t: 0.4, v: 0.3 },
  { t: 0.5, v: 0.22 },
  { t: 0.65, v: 0.18 },
  { t: 0.75, v: 0.08 },
  { t: 0.85, v: 0.8 },
  { t: 0.94, v: 0.32 },
  { t: 1.0, v: 0.16 },
] as const

/** Storm cloud cover / lightning readiness — essentially clear through the
 * reveal and the scale pull-back (the brief's own "mountains disappear
 * into atmospheric haze" belongs to Raudra alone, not the whole piece), a
 * real build only once Raudra begins, calming into the final stillness. */
export const STORM_KEYS = [
  { t: 0.0, v: 0.03 },
  { t: 0.5, v: 0.05 },
  { t: 0.65, v: 0.06 },
  { t: 0.75, v: 0.04 },
  { t: 0.85, v: 0.6 },
  { t: 0.9, v: 0.72 },
  { t: 0.94, v: 0.3 },
  { t: 1.0, v: 0.12 },
] as const
