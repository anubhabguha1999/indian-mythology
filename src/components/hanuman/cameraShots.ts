import { findSegment, lerpNum } from '@/components/mahadev/timelineMath'

/**
 * The camera path — dawn low and still, rising with the wind, following
 * the shadow upward into the first reveal, pulling back for the mountain,
 * tracking the leap up through the sky and down into the battlefield,
 * closing in for devotion, then pulling far back for the final silhouette.
 * FOV narrows for the close/tense beats (leap anticipation, devotion) and
 * widens for the scale shots (mountain reveal, sky, final stillness) —
 * the same "lens as language" the Mahadev shot list uses.
 */
// t values retimed to match chapters.ts's shrunk MOUNTAIN/LEAP boundaries
// — same positions/fov, just reached at a different point in the (now
// shorter) scroll. The orbit/follow cameras in TimelineController.tsx
// override most of the mountain-through-battle stretch anyway (see its
// own comments), so these mainly matter as the spline this blends against
// and as the exact framing for battle/devotion/stillness.
export const SHOTS = [
  { t: 0.0, pos: [0, 0.6, 70], look: [0, 4, -60], fov: 38 },
  { t: 0.06, pos: [4, 0.8, 55], look: [0, 5, -50], fov: 36 },
  { t: 0.1, pos: [-6, 1.2, 42], look: [4, 6, -30], fov: 40 },
  { t: 0.16, pos: [10, 1.5, 30], look: [-4, 6, -10], fov: 42 },
  { t: 0.2, pos: [8, 3, 14], look: [0, 22, -20], fov: 46 },
  { t: 0.27, pos: [16, 4, 2], look: [0, 20, -25], fov: 40 },
  // The foot impact — low, close, looking up.
  { t: 0.32, pos: [14, 1.2, -8], look: [2, 6, -28], fov: 30 },
  // The full reveal — pulled well back to hold the whole figure and the
  // mountain he's carrying in frame.
  { t: 0.366, pos: [58, 26, 36], look: [0, 24, -30], fov: 46 },
  { t: 0.398, pos: [44, 18, 12], look: [0, 22, -30], fov: 40 },
  // Leap anticipation — close and low, tense.
  { t: 0.425, pos: [16, 2.4, -14], look: [0, 6, -30], fov: 32 },
  { t: 0.457, pos: [42, 62, -62], look: [8, 92, -92], fov: 48 },
  { t: 0.51, pos: [32, 182, -150], look: [0, 150, -158], fov: 58 },
  { t: 0.58, pos: [22, 118, -222], look: [0, 60, -258], fov: 46 },
  { t: 0.64, pos: [52, 16, -232], look: [0, 20, -280], fov: 40 },
  { t: 0.69, pos: [26, 10, -250], look: [0, 18, -280], fov: 34 },
  // Devotion — close, quiet, a telephoto feel.
  { t: 0.74, pos: [9, 21, -256], look: [0, 23, -280], fov: 22 },
  { t: 0.78, pos: [14, 24, -250], look: [0, 24, -280], fov: 26 },
  { t: 0.848, pos: [150, 85, -190], look: [0, 32, -280], fov: 44 },
  { t: 1.0, pos: [230, 112, -150], look: [0, 26, -280], fov: 40 },
] as const

export function sampleFov(t: number): number {
  const { i, local } = findSegment(t, SHOTS)
  return lerpNum(SHOTS[i].fov, SHOTS[i + 1].fov, local)
}

export function mapCurveT(t: number): number {
  const { i, local } = findSegment(t, SHOTS)
  return (i + local) / (SHOTS.length - 1)
}

/** Wind/dust intensity — near-still at the very opening, building through
 * the wind/shadow beats, a held calm through the sky float, a second surge
 * for the battlefield's dust and smoke, settling for devotion/stillness. */
export const WIND_KEYS = [
  { t: 0.0, v: 0.03 },
  { t: 0.1, v: 0.25 },
  { t: 0.2, v: 0.55 },
  { t: 0.32, v: 0.8 },
  { t: 0.366, v: 0.4 },
  { t: 0.43, v: 0.5 },
  { t: 0.51, v: 0.2 },
  { t: 0.64, v: 0.75 },
  { t: 0.74, v: 0.15 },
  { t: 1.0, v: 0.1 },
] as const

/** Storm cloud cover / lightning readiness — mostly clear through dawn and
 * the mountain reveal, a real build for the sky crossing and the
 * battlefield, calming for devotion and the final held stillness. */
export const STORM_KEYS = [
  { t: 0.0, v: 0.05 },
  { t: 0.35, v: 0.08 },
  { t: 0.457, v: 0.3 },
  { t: 0.51, v: 0.55 },
  { t: 0.64, v: 0.7 },
  { t: 0.74, v: 0.2 },
  { t: 1.0, v: 0.08 },
] as const
