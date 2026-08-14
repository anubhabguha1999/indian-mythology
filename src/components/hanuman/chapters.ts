/**
 * The single source of truth for "what happens when" — the ten-stage
 * cinematic timeline from the brief: blackness -> wind -> shadow ->
 * footstep -> gada -> reveal -> scale -> devotion -> raudra -> stillness.
 * Nothing else invents its own chapter boundaries — terrain.ts's RAUDRA_T,
 * cameraShots.ts's SHOTS/WIND_KEYS/STORM_KEYS, and hanumanPalette.ts's
 * GRADE_KEYS/EXPOSURE_KEYS all key off these exact same t values.
 *
 * This replaces the previous nine-beat structure (dawn/wind/shadow/
 * mountain/leap/sky/battle/devotion/stillness) — per direction, there is no
 * leap-across-the-ocean or battlefield scene any more. Hanuman never
 * leaves HANUMAN_GROUND; the only motion he makes in the entire experience
 * is the one step at RAUDRA_T (terrain.ts).
 */
export interface Chapter {
  t: number
  n: string
  label: string
}

export const CHAPTERS: readonly Chapter[] = [
  { t: 0.0, n: '00', label: 'BLACKNESS' },
  { t: 0.08, n: '01', label: 'THE WIND' },
  { t: 0.18, n: '02', label: 'THE SHADOW' },
  { t: 0.28, n: '03', label: 'THE FOOTSTEP' },
  { t: 0.4, n: '04', label: 'THE GADA' },
  { t: 0.5, n: '05', label: 'THE REVEAL' },
  { t: 0.65, n: '06', label: 'THE SCALE' },
  { t: 0.75, n: '07', label: 'DEVOTION' },
  { t: 0.85, n: '08', label: 'RAUDRA' },
  { t: 0.94, n: '09', label: 'THE IMPOSSIBLE' },
  { t: 1.0, n: '09', label: 'THE IMPOSSIBLE' },
] as const

/** The devotion freeze — the one held pause in an otherwise continuously
 * moving camera, right as the hand reaches the chest. Same role as
 * mahadev/chapters.ts's THIRD_EYE_T. */
export const DEVOTION_T = 0.75
export const FREEZE_DURATION = 1.2

/** Where Raudra's one step happens — terrain.ts's hanumanPositionAt reads
 * this same constant so the step lands exactly when the storm does, never
 * before the ground/light/wind have already told the viewer something is
 * changing. */
export const RAUDRA_T = 0.85

export interface StoryWindow {
  show: number
  peak: number
  hide: number
}

/**
 * One window per data/hanumanStory.ts chapter — the story itself, told
 * *during* the scroll (see CinematicText.tsx). Retimed against the new
 * ten-stage structure: each beat lands near whichever visual chapter it
 * resonates with thematically now that there's no literal leap/battle
 * scene to place "the leap" or "lanka's fire" against directly — the leap
 * plays during THE SCALE (the pull-back that finally shows how vast the
 * distance/world is), lanka-fire plays during RAUDRA (restrained power,
 * same theme as "carried fire and did not burn"), heart plays during
 * DEVOTION itself.
 */
export const STORY_WINDOWS: readonly StoryWindow[] = [
  { show: 0.09, peak: 0.12, hide: 0.16 }, // forgotten-strength — THE WIND
  { show: 0.19, peak: 0.22, hide: 0.26 }, // kishkindha — THE SHADOW
  { show: 0.41, peak: 0.44, hide: 0.48 }, // sanjeevani — THE GADA
  { show: 0.52, peak: 0.56, hide: 0.61 }, // leap — THE REVEAL
  { show: 0.67, peak: 0.7, hide: 0.73 }, // not-flight — THE SCALE
  { show: 0.86, peak: 0.89, hide: 0.93 }, // lanka-fire — RAUDRA
  { show: 0.77, peak: 0.8, hide: 0.83 }, // heart — DEVOTION
  { show: 0.945, peak: 0.955, hide: 0.965 }, // still-serving — THE IMPOSSIBLE
] as const
