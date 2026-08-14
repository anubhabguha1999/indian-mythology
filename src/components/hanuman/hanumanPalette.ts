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
  return progress >= 0.75 ? UI_WARM : UI_COOL
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

// Retimed against chapters.ts's ten-stage timeline (blackness -> wind ->
// shadow -> footstep -> gada -> reveal -> scale -> devotion -> raudra ->
// stillness). Same color logic as before — cool/dark for the stages before
// he's seen, warm and building through the reveal/scale/devotion stretch,
// a cool-dark storm swing for Raudra (there is no battle any more; this
// grade key now carries the "distant lightning, darkening sky" mood
// instead), settling warm for the final silhouette.
export const GRADE_KEYS: readonly GradeKey[] = [
  { t: 0.0, fog: CHARCOAL, fogDensity: 0.006, key: '#1c2438', keyI: 0.22, amb: '#0a0b10', ambI: 0.12, rim: '#4a5f7a', rimI: 0.22 },
  { t: 0.08, fog: '#242d42', fogDensity: 0.0045, key: '#3a4d75', keyI: 0.65, amb: '#141a26', ambI: 0.22, rim: '#5a7090', rimI: 0.42 },
  // THE SHADOW pushed more dramatic per direction — deeper ambient falloff
  // so the dark side of the diagonal split actually goes dark instead of
  // grey, a punchier key, and a stronger cool rim so silhouettes separate
  // hard from the shadow behind them.
  { t: 0.18, fog: '#443840', fogDensity: 0.0044, key: '#9a6f58', keyI: 1.25, amb: '#161014', ambI: 0.16, rim: MOON_SILVER, rimI: 0.9 },
  { t: 0.28, fog: '#7a5c44', fogDensity: 0.0035, key: SUNRISE_AMBER, keyI: 1.6, amb: '#3a2c22', ambI: 0.32, rim: MOON_SILVER, rimI: 0.78 },
  { t: 0.4, fog: '#8c6a40', fogDensity: 0.003, key: WARM_GOLD, keyI: 1.75, amb: '#4a3620', ambI: 0.34, rim: BURNT_ORANGE, rimI: 0.85 },
  { t: 0.5, fog: '#7c6440', fogDensity: 0.0026, key: WARM_GOLD, keyI: 1.8, amb: '#463620', ambI: 0.36, rim: SUNRISE_AMBER, rimI: 0.72 },
  { t: 0.65, fog: '#4c5a70', fogDensity: 0.0018, key: '#d2dcea', keyI: 1.85, amb: '#2c3542', ambI: 0.32, rim: '#c8d4e6', rimI: 0.7 },
  { t: 0.75, fog: '#241a15', fogDensity: 0.0065, key: DEVOTION_GOLD, keyI: 1.05, amb: '#1c1512', ambI: 0.22, rim: DEVOTION_GOLD, rimI: 0.55 },
  { t: 0.85, fog: '#3c342f', fogDensity: 0.0078, key: '#7a6252', keyI: 1.1, amb: '#201a18', ambI: 0.22, rim: DARK_CRIMSON, rimI: 0.72 },
  { t: 0.94, fog: '#5c4030', fogDensity: 0.003, key: BURNT_ORANGE, keyI: 1.5, amb: '#3a2a1e', ambI: 0.34, rim: SUNRISE_AMBER, rimI: 0.7 },
  { t: 1.0, fog: '#3c2e22', fogDensity: 0.0028, key: BURNT_ORANGE, keyI: 1.4, amb: '#302418', ambI: 0.3, rim: WARM_GOLD, rimI: 0.68 },
] as const

interface ExposureKey {
  t: number
  v: number
}

/** Renderer exposure — near-black at the very opening (per the brief's
 * own "start with black, complete silence"), rising through the wind/
 * shadow/footstep/gada beats, holding brightest through the reveal and
 * scale pull-back, dipping for devotion's hush, dipping further for
 * Raudra's storm, then settling warm for the final stillness. */
export const EXPOSURE_KEYS: readonly ExposureKey[] = [
  { t: 0.0, v: 0.48 },
  { t: 0.08, v: 0.85 },
  { t: 0.18, v: 1.1 },
  { t: 0.28, v: 1.4 },
  { t: 0.4, v: 1.5 },
  { t: 0.5, v: 1.55 },
  { t: 0.65, v: 1.58 },
  { t: 0.75, v: 1.15 },
  { t: 0.85, v: 1.0 },
  { t: 0.94, v: 1.35 },
  { t: 1.0, v: 1.3 },
] as const
