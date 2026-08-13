/**
 * World layout — one shared coordinate system every environment piece,
 * sacred object, the Shiva figure, and the camera shot list all read from.
 * The old Shiva page's camera clipped straight through the river tube at
 * one point in its journey (a giant flat-colored plank filling the frame)
 * precisely because nothing enforced shared placement like this — shots
 * were hand-tuned against geometry defined somewhere else entirely. Here,
 * anything that needs to know "where is the cave mouth" or "how tall is
 * the peak" imports it from this one module.
 *
 * The convention: +Z is "outside, far from the mountain"; progress through
 * the journey moves the camera toward -Z, through the cave mouth at Z~12,
 * into the tunnel, and into the amphitheater where Shiva sits, centered
 * around Z~-108. Nothing here renders anything — it's the shared model the
 * renderer-facing components (Terrain, CaveTunnel, Lingam, Trishula,
 * Water, cameraShots) all sculpt or move against.
 */

/** Deterministic value noise — a hash function plus bilinear interpolation,
 * no dependency needed for a one-shot CPU displacement this cheap. */
function hash(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * A deterministic stand-in for `Math.random()`, keyed by index rather than
 * by call order. Scattered geometry (RockScatter, Stalactites) used to
 * seed itself with plain `Math.random()` inside a `useMemo` keyed on
 * `quality` — harmless until `PerformanceMonitor` actually stepped quality
 * down mid-scroll (most likely exactly where this geometry is densest: the
 * path and the cave), at which point the whole rock/stalactite field
 * re-rolled with entirely new random values and visibly jumped to a
 * different layout. `hash1(i, channel)` always returns the same value for
 * the same index, so shrinking or growing how many instances render only
 * adds or removes items from one stable arrangement rather than
 * reshuffling all of it. `channel` decorrelates multiple random values
 * (position, rotation, scale) drawn for the same index.
 */
export function hash1(i: number, channel = 0): number {
  return hash(i * 12.9898 + channel * 78.233, channel * 37.719 - i * 4.121)
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

/** Fractal Brownian motion — layered octaves for jagged, natural-reading
 * rock rather than smooth bumps. */
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

// --------------------------------------------------------------------------
// Exterior mountain
// --------------------------------------------------------------------------

const PEAK = { x: 0, z: -70, height: 108, radius: 98 }
const RIDGE_L = { x: -62, z: -18, height: 58, radius: 42 }
const RIDGE_R = { x: 66, z: 14, height: 48, radius: 38 }
export const VALLEY_BASE = -18

/** The approach path's centerline — a gentle winding line from the far
 * darkness down to the cave mouth. Shared by the terrain groove below, by
 * RockScatter (rocks/ruins bias toward it), and loosely by the opening
 * camera shots. */
export const PATH_POINTS: ReadonlyArray<readonly [number, number]> = [
  [22, 195],
  [10, 150],
  [-6, 110],
  [-2, 70],
  [4, 40],
  [0, 15],
]

function nearestPathDist(x: number, z: number): number {
  let best = Infinity
  for (const [px, pz] of PATH_POINTS) {
    const d = Math.hypot(x - px, z - pz)
    if (d < best) best = d
  }
  return best
}

/** The exterior mountain's height function. Only sampled where the terrain
 * mesh actually exists (Z gtr than roughly the cave-mouth threshold) — past
 * that the tunnel/amphitheater geometry takes over as hand-placed meshes,
 * not a heightfield (a single-valued height function can't express an
 * overhang or an enclosed tunnel). The seam between the two sits inside the
 * cave-mouth fog, never in view straight-on. */
export function terrainHeight(x: number, z: number): number {
  const dPeak = Math.hypot(x - PEAK.x, z - PEAK.z)
  const peak = PEAK.height * Math.exp(-(dPeak * dPeak) / (PEAK.radius * PEAK.radius))
  const dL = Math.hypot(x - RIDGE_L.x, z - RIDGE_L.z)
  const ridgeL = RIDGE_L.height * Math.exp(-(dL * dL) / (RIDGE_L.radius * RIDGE_L.radius))
  const dR = Math.hypot(x - RIDGE_R.x, z - RIDGE_R.z)
  const ridgeR = RIDGE_R.height * Math.exp(-(dR * dR) / (RIDGE_R.radius * RIDGE_R.radius))
  const jag = (fbm(x * 0.028, z * 0.028, 5) - 0.5) * 20
  const micro = (fbm(x * 0.2, z * 0.2, 3) - 0.5) * 3.4

  // A Gaussian bump, left alone, is a perfectly smooth bell curve — exactly
  // the "inflated balloon" silhouette that read as cartoonish in the
  // aerial Raudra pull-back, where the peak sits in clean profile against
  // the sky. `jag`/`micro` above are both too low-amplitude relative to
  // the summit's own 108-unit height to survive that read at distance.
  // Ridged noise (folding fbm around its midpoint into sharp creases
  // instead of smooth hills) breaks that up with actual jagged rock —
  // weighted by elevation so it bites into the upper slopes and summit,
  // where a real mountain is bare broken rock, while leaving the lower
  // valley/path noise alone rather than making the walkable approach spiky
  // for no reason: found by testing against this exact shot.
  const elevation = Math.min(1, Math.max(0, (peak + ridgeL + ridgeR) / 45))
  const ridged = (1 - Math.abs(fbm(x * 0.05, z * 0.05, 4) * 2 - 1) - 0.5) * 34 * elevation

  // The path groove — a shallow, flattened trail cut into the noise so the
  // approach reads as a place feet have walked, not just "somewhere on the
  // slope". Falls off smoothly with distance from PATH_POINTS.
  const pathD = nearestPathDist(x, z)
  const groove = 5.5 * Math.exp(-(pathD * pathD) / (11 * 11))

  return VALLEY_BASE + peak + ridgeL + ridgeR + jag + micro + ridged - groove
}

/** Small, purely cosmetic per-vertex variation for terrain color — kept
 * separate from the height noise so shading variance never perturbs shape. */
export function terrainDetailNoise(x: number, z: number): number {
  return fbm(x * 0.32, z * 0.32, 2)
}

export function distanceToPath(x: number, z: number): number {
  return nearestPathDist(x, z)
}

/** The summit's actual world position — read by Clouds.tsx/MoonSky.tsx to
 * anchor sky elements above the peak rather than a hand-guessed height that
 * could drift out of sync with the terrain function itself. */
export const PEAK_SUMMIT: readonly [number, number, number] = [PEAK.x, terrainHeight(PEAK.x, PEAK.z), PEAK.z]

// --------------------------------------------------------------------------
// The cave — tunnel centerline and the amphitheater it opens into
// --------------------------------------------------------------------------

/** Where the exterior terrain plane ends and the hand-built tunnel begins —
 * both Terrain.tsx (which stops generating past this Z) and CaveTunnel.tsx
 * (whose curve starts here) read this same value. */
export const CAVE_MOUTH_Z = 12

export const CAVE_CURVE_POINTS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 7, 30],
  [0, 5, 14],
  [-3, 3, -2],
  [-7, 1.5, -16],
  [-6, 0, -32],
  [-3, -1, -46],
  [0, -2, -58],
]

/**
 * The tunnel's own centerline height/position at a given Z — sampled by
 * linear interpolation over CAVE_CURVE_POINTS. Anything placed *inside the
 * tunnel corridor* (as opposed to the amphitheater, which has its own flat
 * CAVE_FLOOR_Y) needs to read its resting height from here, not from
 * CAVE_FLOOR_Y — the tunnel's floor descends continuously from ~7 to ~-2
 * along its length, nowhere near the amphitheater's -15. Placing the
 * Trishula at CAVE_FLOOR_Y originally buried it more than ten units below
 * the tunnel's actual floor, invisible from any shot along the corridor —
 * found by testing.
 */
function tunnelPointAt(z: number): readonly [number, number] {
  for (let i = 0; i < CAVE_CURVE_POINTS.length - 1; i++) {
    const [xa, ya, za] = CAVE_CURVE_POINTS[i]
    const [xb, yb, zb] = CAVE_CURVE_POINTS[i + 1]
    if ((z <= za && z >= zb) || (z >= za && z <= zb)) {
      const span = zb - za
      const t = span !== 0 ? (z - za) / span : 0
      return [xa + (xb - xa) * t, ya + (yb - ya) * t]
    }
  }
  const last = CAVE_CURVE_POINTS[CAVE_CURVE_POINTS.length - 1]
  return [last[0], last[1]]
}

export function tunnelFloorY(z: number): number {
  return tunnelPointAt(z)[1] - 0.4
}

/** The amphitheater Shiva occupies — a wide, tall bowl the tunnel opens
 * into, roofed but for a ragged skylight above (where the footprints'
 * moonlight and later the storm come from). */
export const AMPHITHEATER_CENTER: readonly [number, number] = [0, -100]
export const AMPHITHEATER_RADIUS = 46
export const CAVE_FLOOR_Y = -15

export const TRISHULA_POSITION: readonly [number, number, number] = [-9.5, tunnelFloorY(-29) + 0.3, -29]
export const LINGAM_POSITION: readonly [number, number, number] = [0, CAVE_FLOOR_Y, -108]

/**
 * The Shivling — a smooth aniconic column, not a body. Every other module
 * that needs to know its shape (the camera shots' clearances, the third-
 * eye-analog "mark" position, where the Damaru/Rudraksha can sit without
 * being buried in the pedestal) reads these same numbers rather than
 * re-guessing them, the exact discipline that was missing when the
 * previous humanoid figure's silhouette didn't match what the camera path
 * assumed and several shots clipped into it.
 */
export const PEDESTAL_HEIGHT = 5
export const PEDESTAL_BASE_RADIUS = 20
export const PEDESTAL_TOP_RADIUS = 16
export const SHAFT_HEIGHT = 44
export const SHAFT_BASE_RADIUS = 9.5
export const SHAFT_TOP_RADIUS = 7.5
export const DOME_RADIUS = SHAFT_TOP_RADIUS
export const LINGAM_TOTAL_HEIGHT = PEDESTAL_HEIGHT + SHAFT_HEIGHT + DOME_RADIUS

/** The shaft's radius at a given world Y — used for camera clearance
 * checks and for placing the seam mark flush against the actual surface
 * rather than floating in front of or buried inside it. */
export function lingamRadiusAt(worldY: number): number {
  const shaftBaseY = LINGAM_POSITION[1] + PEDESTAL_HEIGHT
  const shaftTopY = shaftBaseY + SHAFT_HEIGHT
  if (worldY <= LINGAM_POSITION[1]) return PEDESTAL_BASE_RADIUS
  if (worldY <= shaftBaseY) {
    const t = (worldY - LINGAM_POSITION[1]) / PEDESTAL_HEIGHT
    return PEDESTAL_BASE_RADIUS + (PEDESTAL_TOP_RADIUS - PEDESTAL_BASE_RADIUS) * t
  }
  if (worldY <= shaftTopY) {
    const t = (worldY - shaftBaseY) / SHAFT_HEIGHT
    return SHAFT_BASE_RADIUS + (SHAFT_TOP_RADIUS - SHAFT_BASE_RADIUS) * t
  }
  const domeT = Math.min(1, (worldY - shaftTopY) / DOME_RADIUS)
  return DOME_RADIUS * Math.cos((domeT * Math.PI) / 2)
}

/** The vertical seam on the shaft's front face that stands in for the
 * third eye — closed and near-invisible through most of the journey, a
 * thin glowing crack once it "opens" (see Lingam.tsx). Placed at the same
 * world height the old head/eye sat at, purely so the existing camera
 * shots through that stretch of the journey still frame roughly the right
 * area without every one of them needing to be re-aimed from scratch. */
export const LINGAM_MARK_Y = 25
export const LINGAM_MARK_WORLD: readonly [number, number, number] = [
  LINGAM_POSITION[0],
  LINGAM_MARK_Y,
  LINGAM_POSITION[2] + lingamRadiusAt(LINGAM_MARK_Y),
]

/** At the pedestal's near edge (clear of its ~16-20 unit radius, but on
 * the approach side rather than out of frame entirely) — an offering left
 * at the base, the kind of detail a visitor notices only because the
 * camera happens to pass near it, not a second showcase object. Scaled up
 * from a realistic hand-held size (the first pass was true-to-life small
 * enough — a fraction of a unit — that it was never actually visible from
 * any camera distance in this world; found by testing). */
export const DAMARU_POSITION: readonly [number, number, number] = [3, CAVE_FLOOR_Y + 0.4, -84]

/** Footprint centers — a trail across the amphitheater's snow floor,
 * heading from where the tunnel opens toward the lingam. Read by
 * Footprints.tsx to stamp depressions and by the "footprints" chapter's
 * camera shots. */
export const FOOTPRINT_TRAIL: ReadonlyArray<readonly [number, number]> = [
  [3.2, -62],
  [1.6, -68],
  [3.0, -74],
  [1.4, -80],
  [2.8, -86],
  [1.2, -92],
]

/** The stream — Ganga, sourced high above from a crack in the rock roof
 * (traditionally, the water that continuously bathes a lingam), threading
 * back through the tunnel and out along the exterior path. One continuous
 * curve so the water the visitor first meets in the cave (Scene 05) is
 * recognizably the same water the path followed in from the very start. */
export const WATER_POINTS: ReadonlyArray<readonly [number, number, number]> = [
  // The first three points sit *behind* the lingam's own Z (its shaft
  // center is at -108) rather than in front of it — its own silhouette
  // occludes this stretch from every "presence/reveal" camera shot, which
  // all look at it from the front. Routed in front instead, this same
  // stretch passed close by several of those cameras' own positions and
  // read as a stray bright diagonal streak across the frame — the same
  // family of bug as the old page's camera clipping the river tube.
  [1.6, 46, -112],
  [2.2, 24, -114],
  [2.4, 4, -109],
  [3.5, -10, -80],
  [2.5, -8, -60],
  [-2, -13, -30],
  [0, -12.5, 0],
  [3, -14, 40],
  [2, -15, 90],
  [0, -16, 150],
  [-2, -16.5, 195],
]
