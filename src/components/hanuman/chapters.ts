/**
 * The single source of truth for "what happens when" — nine named beats
 * (0.00 dawn -> 1.00 stillness), matching mahadev/chapters.ts's role for
 * the Shiva experience. Nothing else invents its own chapter boundaries.
 */
export interface Chapter {
  t: number
  n: string
  label: string
}

// THE MOUNTAIN and THE LEAP shrunk from 0.15 scroll-width each down to
// 0.08 — per direction, less scrolling needed to get through those two
// beats — with everything after shifted earlier by the same amount so the
// total journey still lands at t=1. STILLNESS absorbs the freed space at
// the end instead (0.19 wide now, was 0.05) rather than compressing
// everything else too, which reads as more time to settle at the close
// rather than less time anywhere it wasn't asked for. See terrain.ts's
// LEAP_START_T/LEAP_END_T, hanumanPalette.ts's GRADE_KEYS/EXPOSURE_KEYS,
// and cameraShots.ts's SHOTS/WIND_KEYS/STORM_KEYS — all retimed to match
// these exact same boundaries, or the lighting/camera would drift out of
// sync with what the chapter label says is happening.
export const CHAPTERS: readonly Chapter[] = [
  { t: 0.0, n: '01', label: 'DAWN' },
  { t: 0.1, n: '02', label: 'THE WIND' },
  { t: 0.2, n: '03', label: 'THE SHADOW' },
  { t: 0.35, n: '04', label: 'THE MOUNTAIN' },
  { t: 0.43, n: '05', label: 'THE LEAP' },
  { t: 0.51, n: '06', label: 'THE SKY' },
  { t: 0.64, n: '07', label: 'THE BATTLE' },
  { t: 0.74, n: '08', label: 'DEVOTION' },
  { t: 0.81, n: '09', label: 'STILLNESS' },
  { t: 1.0, n: '09', label: 'STILLNESS' },
] as const

/** The moment everything goes quiet and Hanuman kneels — the one held
 * pause in an otherwise continuously-moving camera, same role as
 * mahadev/chapters.ts's THIRD_EYE_T. */
export const DEVOTION_T = 0.74
export const FREEZE_DURATION = 1.2

export interface StoryWindow {
  show: number
  peak: number
  hide: number
}

/**
 * One window per data/hanumanStory.ts chapter — the story itself, told
 * *during* the scroll (see CinematicText.tsx), each timed to land near
 * whatever part of the visual journey it's actually about: the Sanjeevani
 * chapter plays during "THE MOUNTAIN", the ocean-leap chapter during
 * "THE LEAP", the devotion chapter during "DEVOTION". Same role as
 * mahadev/chapters.ts's STORY_WINDOWS for shivaOrigin.
 */
export const STORY_WINDOWS: readonly StoryWindow[] = [
  { show: 0.03, peak: 0.06, hide: 0.09 },
  { show: 0.15, peak: 0.18, hide: 0.22 },
  { show: 0.361, peak: 0.382, hide: 0.414 },
  { show: 0.441, peak: 0.462, hide: 0.494 },
  { show: 0.52, peak: 0.56, hide: 0.61 },
  { show: 0.65, peak: 0.68, hide: 0.72 },
  { show: 0.75, peak: 0.77, hide: 0.8 },
  { show: 0.82, peak: 0.85, hide: 0.9 },
] as const
