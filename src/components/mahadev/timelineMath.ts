import * as THREE from 'three'

/**
 * Shared pure math for the whole experience — one clamp/ease/segment-lookup
 * implementation rather than each director re-deriving it. Kept dependency-
 * free (just Three's Vector3/CatmullRomCurve3 for the spline builder) so it
 * can be imported from data files, components, and the UI layer alike.
 */

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/** Smoothstep — used everywhere a raw scroll fraction needs to feel like a
 * camera easing in and out of a move rather than moving at constant rate. */
export function ease(t: number): number {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Every keyframe track in this experience (camera shots, palette grading,
 * storm/cosmic-style signals, chapter text windows) is deliberately spaced
 * unevenly on purpose — long and slow for the opening approach, dense
 * through the third-eye climax. `Curve.getPoint(t)` distributes progress
 * evenly by index regardless of the `t` label attached to each point, which
 * would misalign badly against that spacing. This finds the true local
 * position within whichever segment `t` falls into instead.
 */
export function findSegment<T extends { t: number }>(t: number, keys: readonly T[]): { i: number; local: number } {
  const c = clamp01(t)
  for (let i = 0; i < keys.length - 1; i++) {
    if (c <= keys[i + 1].t) {
      const span = keys[i + 1].t - keys[i].t
      return { i, local: span > 0 ? (c - keys[i].t) / span : 0 }
    }
  }
  return { i: keys.length - 2, local: 1 }
}

/** Linear-interpolate a numeric field across a keyframe track via findSegment. */
export function sampleTrack<T extends { t: number }>(t: number, keys: readonly T[], field: keyof T): number {
  const { i, local } = findSegment(t, keys)
  return lerpNum(keys[i][field] as unknown as number, keys[i + 1][field] as unknown as number, local)
}

/**
 * 'centripetal', not the default 'catmullrom' (uniform) parametrization —
 * uniform Catmull-Rom is well documented to overshoot into loops/cusps
 * whenever consecutive control points have very different spacing, which
 * every shot list here does by design (long slow approaches next to tight
 * close-in beats). Confirmed directly: Hanuman's own SCALE pull-back
 * (cameraShots.ts, t=0.65→0.75, a ~65-unit gap immediately followed by a
 * ~200-unit gap) rendered as a nonsensical extreme close-up on his knee
 * mid-transition instead of the intended pull-back — a textbook uniform-
 * parametrization overshoot. Centripetal parametrization mathematically
 * guarantees no cusps/loops regardless of how unevenly the control points
 * are spaced, which is exactly the property every shot list here needs.
 */
export function buildSpline(points: ReadonlyArray<readonly [number, number, number]>): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal', 0.5)
}
