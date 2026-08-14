/**
 * The color/light system for the whole Hanuman experience — one continuous
 * grade the scroll rides through, same pattern as mahadevPalette.ts's
 * GRADE_KEYS. Kept to the brief's own named palette (deep charcoal, earth
 * brown, stone grey, burnt orange, warm gold, sunrise amber, dark crimson)
 * — no neon, no fantasy purple, no electric blue.
 */

export const CHARCOAL = '#0c0d0f'
export const EARTH_BROWN = '#3a2b1f'
export const STONE_GREY = '#514a42'
export const BURNT_ORANGE = '#b4622c'
export const WARM_GOLD = '#c99a4a'
export const SUNRISE_AMBER = '#e0955a'
export const DARK_CRIMSON = '#5c1f1a'

/** The one warm accent reserved for the devotion beat — the same
 * discipline mahadevPalette.ts applies to SACRED_GOLD. */
export const DEVOTION_GOLD = '#d9a441'

export const UI_COOL = '#a8a196'
export const UI_WARM = '#d9b077'

export function uiAccentFor(progress: number): string {
  return progress >= 0.64 ? UI_WARM : UI_COOL
}

interface GradeKey {
  t: number
  fog: string
  fogDensity: number
  key: string
  keyI: number
  amb: string
  ambI: number
  rim: string
  rimI: number
}

/**
 * Night -> blue hour -> dawn -> golden -> storm -> firelight -> sunset,
 * keyed at the same progress values CHAPTERS uses (see chapters.ts) so
 * "what does chapter N look like" stays one lookup.
 */
/** A cool moonlight/sky silver, reserved for rim light against the warm
 * beats — the complementary-color separation ("warm key, cool rim" or the
 * reverse) that actually reads as cinematic contrast, rather than
 * everything sitting in the same grey-brown middle distance. */
const MOON_SILVER = '#7d93a6'

// Reworked for more deliberate contrast per direction: ambI dropped across
// the board (deeper shadow — light should fall off, not fill in evenly)
// while rimI rose substantially, and each beat now leans distinctly cool
// (night/wind/sky) or distinctly warm (dawn/mountain/leap/devotion/
// stillness) rather than the previous pass's fairly uniform grey-brown
// wash — that brightened the mood but flattened the drama between beats,
// which is exactly what this fixes.
// t values retimed to match chapters.ts's shrunk MOUNTAIN/LEAP boundaries
// (0.5->0.43, 0.65->0.51, 0.78->0.64, 0.88->0.74, 0.95->0.81) — colors and
// intensities unchanged, only when each one kicks in.
export const GRADE_KEYS: readonly GradeKey[] = [
  { t: 0.0, fog: CHARCOAL, fogDensity: 0.006, key: '#1c2438', keyI: 0.22, amb: '#0a0b10', ambI: 0.12, rim: '#4a5f7a', rimI: 0.22 },
  { t: 0.1, fog: '#242d42', fogDensity: 0.0045, key: '#3a4d75', keyI: 0.65, amb: '#141a26', ambI: 0.22, rim: '#5a7090', rimI: 0.42 },
  // THE SHADOW (chapter 03, t=0.2-0.35) pushed more dramatic per direction
  // — deeper ambient falloff so the dark side of the diagonal split
  // actually goes dark instead of grey, a punchier key, and a stronger
  // cool rim so his silhouette separates hard from the shadow behind him,
  // closer to the devotional-card reference's own high-contrast look.
  { t: 0.2, fog: '#443840', fogDensity: 0.0044, key: '#9a6f58', keyI: 1.25, amb: '#161014', ambI: 0.16, rim: MOON_SILVER, rimI: 0.9 },
  { t: 0.35, fog: '#7a5c44', fogDensity: 0.0035, key: SUNRISE_AMBER, keyI: 1.6, amb: '#3a2c22', ambI: 0.32, rim: MOON_SILVER, rimI: 0.78 },
  { t: 0.43, fog: '#8c6a40', fogDensity: 0.003, key: WARM_GOLD, keyI: 1.75, amb: '#4a3620', ambI: 0.34, rim: BURNT_ORANGE, rimI: 0.85 },
  { t: 0.51, fog: '#4c5a70', fogDensity: 0.0022, key: '#d2dcea', keyI: 1.75, amb: '#2c3542', ambI: 0.3, rim: '#c8d4e6', rimI: 0.75 },
  { t: 0.64, fog: '#3c342f', fogDensity: 0.0075, key: '#7a6252', keyI: 1.15, amb: '#241d1a', ambI: 0.26, rim: DARK_CRIMSON, rimI: 0.68 },
  { t: 0.74, fog: '#241a15', fogDensity: 0.0065, key: DEVOTION_GOLD, keyI: 1.05, amb: '#1c1512', ambI: 0.22, rim: DEVOTION_GOLD, rimI: 0.55 },
  { t: 0.81, fog: '#5c4030', fogDensity: 0.003, key: BURNT_ORANGE, keyI: 1.5, amb: '#3a2a1e', ambI: 0.34, rim: SUNRISE_AMBER, rimI: 0.7 },
  { t: 1.0, fog: '#3c2e22', fogDensity: 0.0028, key: BURNT_ORANGE, keyI: 1.4, amb: '#302418', ambI: 0.3, rim: WARM_GOLD, rimI: 0.68 },
] as const

interface ExposureKey {
  t: number
  v: number
}

/** Renderer exposure — near-black at the very opening (per the brief's
 * own "start with black, complete silence"), rising through dawn, holding
 * bright through the mountain/leap/sky beats, dipping for the battle's
 * hushed arrival, then settling warm for the close. */
export const EXPOSURE_KEYS: readonly ExposureKey[] = [
  { t: 0.0, v: 0.48 },
  { t: 0.1, v: 0.85 },
  { t: 0.2, v: 1.1 },
  { t: 0.35, v: 1.4 },
  { t: 0.43, v: 1.5 },
  { t: 0.51, v: 1.55 },
  { t: 0.64, v: 1.2 },
  { t: 0.74, v: 1.15 },
  { t: 0.81, v: 1.35 },
  { t: 1.0, v: 1.3 },
] as const
