/**
 * The complete replacement for raudraPalette.ts. Two things live here:
 *
 * 1. The seven base tones from the brief, used verbatim by the environment
 *    materials and the UI chrome — no neon, no fantasy saturation, warm gold
 *    reserved for sacred elements only (the Trishula's glint, the third eye,
 *    the final glyph).
 * 2. GRADE_KEYS — the one continuous lighting/fog grade the whole journey
 *    rides on, sampled through timelineMath's findSegment the same way the
 *    old PALETTE_KEYS was. Kept keyed to the same eleven progress values as
 *    CHAPTERS (see chapters.ts) so "what does chapter N look like" is one
 *    lookup, not two systems that can drift out of sync.
 */

export const VOID = '#08090A'
export const STONE_DARK = '#111418'
export const STONE = '#1A2027'
export const SLATE = '#303943'
export const ASH = '#6E7478'
export const MIST = '#B9B9AE'
export const PARCHMENT = '#D8D0B7'

/** The only warm color in the entire system — metal catching moonlight,
 * the third eye, the final devanagari glyph. Never used for anything else. */
export const SACRED_GOLD = '#ad8a54'

/** UI accent arc — restrained on purpose (per the brief's own palette
 * discipline): cool stone-grey through the approach/cave/discovery chapters,
 * shifting to the sacred gold only once Shiva himself is found. */
export const UI_COOL = '#9FB0BC'
export const UI_GOLD = '#C9B383'

export function uiAccentFor(progress: number): string {
  return progress >= 0.65 ? UI_GOLD : UI_COOL
}

interface GradeKey {
  t: number
  /** Scene fog / background color. */
  fog: string
  /** FogExp2 density — the real fix for "how far can the visitor see".
   * Dense inside the tunnel (the amphitheater's dome sits well past the
   * tube's open far end, and without enough fog it was visible from the
   * cave mouth — found by testing), much thinner for the aerial pull-back
   * shots, which need the whole mountain range to actually resolve from
   * hundreds of units away. */
  fogDensity: number
  /** Key (moonlight) light. */
  key: string
  keyI: number
  /** Ambient fill. */
  amb: string
  ambI: number
  /** Rim/edge light — what actually separates a dark silhouette from the
   * darker void behind it. */
  rim: string
  rimI: number
}

/**
 * Keyed at the same eleven progress values the brief specifies for its
 * scroll architecture (0.00 darkness -> 1.00 stillness). Reads as: a cold
 * moonrise, deepening as the path descends into rock, a skylight breath at
 * the footprints chamber, dimming again for the presence/reveal, a single
 * warm pulse at the third eye, a harsh cold surge for Raudra, settling back
 * to calm silver for the held final stillness.
 *
 * ambI/keyI run noticeably higher than a first pass of this grade did —
 * "atmospheric" and "under-lit to the point the shapes don't read" turned
 * out to be the same mistake here: found by testing, the first pass left
 * ambient fill low enough that most of the journey past the opening beat
 * read as flat near-black regardless of what was actually modelled there.
 */
export const GRADE_KEYS: readonly GradeKey[] = [
  { t: 0.0, fog: VOID, fogDensity: 0.005, key: '#212a32', keyI: 0.4, amb: '#12151a', ambI: 0.22, rim: STONE, rimI: 0.06 },
  { t: 0.1, fog: STONE_DARK, fogDensity: 0.004, key: '#4c5860', keyI: 1.05, amb: '#232a30', ambI: 0.58, rim: ASH, rimI: 0.24 },
  { t: 0.22, fog: STONE, fogDensity: 0.0045, key: '#56626a', keyI: 1.2, amb: '#29313a', ambI: 0.62, rim: ASH, rimI: 0.28 },
  { t: 0.35, fog: STONE_DARK, fogDensity: 0.0095, key: '#525d66', keyI: 1.3, amb: '#2b323a', ambI: 0.68, rim: SLATE, rimI: 0.36 },
  { t: 0.45, fog: STONE_DARK, fogDensity: 0.011, key: '#5c6670', keyI: 1.35, amb: '#2e353e', ambI: 0.7, rim: SACRED_GOLD, rimI: 0.46 },
  { t: 0.55, fog: '#2c343b', fogDensity: 0.011, key: '#6b7680', keyI: 1.4, amb: '#2f3840', ambI: 0.66, rim: MIST, rimI: 0.34 },
  { t: 0.65, fog: STONE, fogDensity: 0.0095, key: '#606a72', keyI: 1.25, amb: '#2e353e', ambI: 0.62, rim: ASH, rimI: 0.46 },
  { t: 0.75, fog: '#333c44', fogDensity: 0.0095, key: '#78828a', keyI: 1.3, amb: '#3a434c', ambI: 0.58, rim: PARCHMENT, rimI: 0.44 },
  { t: 0.84, fog: '#262d34', fogDensity: 0.008, key: SACRED_GOLD, keyI: 1.0, amb: '#2c333a', ambI: 0.48, rim: SACRED_GOLD, rimI: 0.52 },
  { t: 0.92, fog: SLATE, fogDensity: 0.0025, key: '#9ba6b0', keyI: 1.45, amb: '#4a545e', ambI: 0.68, rim: MIST, rimI: 0.5 },
  { t: 1.0, fog: STONE_DARK, fogDensity: 0.0018, key: '#7c8894', keyI: 1.1, amb: '#3a434c', ambI: 0.58, rim: MIST, rimI: 0.34 },
] as const

interface ExposureKey {
  t: number
  v: number
}

/** Overall renderer exposure — the brief's own opening still calls for
 * real darkness at t=0, but "atmospheric" throughout was reading as
 * simply too dark to see what's actually there. This ramps up steadily as
 * the visitor scrolls rather than sitting at one flat value, so the
 * journey visibly brightens on the way to the held, clearly-lit final
 * stillness. Applied to the renderer's toneMappingExposure in
 * TimelineController — a multiplier on top of the GRADE_KEYS light
 * intensities above, not a replacement for them. */
export const EXPOSURE_KEYS: readonly ExposureKey[] = [
  { t: 0.0, v: 0.9 },
  { t: 0.1, v: 1.2 },
  { t: 0.22, v: 1.3 },
  { t: 0.35, v: 1.25 },
  { t: 0.45, v: 1.3 },
  { t: 0.55, v: 1.4 },
  { t: 0.65, v: 1.25 },
  { t: 0.75, v: 1.4 },
  { t: 0.84, v: 1.55 },
  { t: 0.92, v: 1.45 },
  { t: 1.0, v: 1.65 },
] as const
