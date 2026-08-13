/**
 * The single source of truth for "what happens when" — the eleven named
 * beats from the brief's own scroll architecture (0.00 darkness -> 1.00
 * stillness), used by the camera shot list, the chapter indicator, the
 * scroll indicator, and the palette grade. Nothing else invents its own
 * chapter boundaries; drift between "what the camera is doing" and "what
 * the UI says is happening" was exactly the kind of seam the brief asks
 * this experience not to have.
 */
export interface Chapter {
  t: number
  n: string
  label: string
}

export const CHAPTERS: readonly Chapter[] = [
  { t: 0.0, n: '01', label: 'DARKNESS' },
  { t: 0.1, n: '02', label: 'THE MOUNTAIN' },
  { t: 0.22, n: '03', label: 'THE PATH' },
  { t: 0.35, n: '04', label: 'THE CAVE' },
  { t: 0.45, n: '05', label: 'THE TRISHULA' },
  { t: 0.55, n: '06', label: 'THE FOOTPRINTS' },
  { t: 0.65, n: '07', label: 'THE PRESENCE' },
  { t: 0.75, n: '08', label: 'SHIVA' },
  { t: 0.84, n: '09', label: 'THE THIRD EYE' },
  { t: 0.92, n: '10', label: 'RAUDRA' },
  { t: 1.0, n: '11', label: 'STILLNESS' },
] as const

/** The moment the camera arrives at the third-eye closeup. Kept as a named
 * constant since TimelineController's freeze logic and the ThirdEye mesh
 * both need to trigger off the exact same value CHAPTERS uses. */
export const THIRD_EYE_T = 0.84
export const FREEZE_DURATION = 1.0

/**
 * Text as atmosphere, not caption — each window appears briefly then
 * disappears, and is positioned (see CinematicText.tsx) to never sit over
 * the lingam's own screen position. `show`/`peak`/`hide` feed a 0->1->0
 * opacity curve.
 *
 * The story itself (data/shivaStory.ts's `shivaOrigin`, seven chapters)
 * *is* this text now — each window below lines up by index with one of
 * those seven chapters, timed to land near whatever beat it's actually
 * about (Ganga's chapter as the water is first discovered, the lingam
 * chapter right as the presence resolves into one, Raudra's chapter as
 * the storm builds). A first pass told this same story as a separate
 * read-at-your-own-pace section after the scroll released; per direction,
 * the story belongs *in* the scroll, not after it.
 */
export interface StoryWindow {
  show: number
  peak: number
  hide: number
}

export const STORY_WINDOWS: readonly StoryWindow[] = [
  { show: 0.03, peak: 0.08, hide: 0.14 }, // the ascetic on the mountain
  { show: 0.3, peak: 0.35, hide: 0.4 }, // ganga in his hair
  { show: 0.47, peak: 0.51, hide: 0.56 }, // the poison he did not swallow
  { show: 0.63, peak: 0.68, hide: 0.735 }, // a form beyond form
  { show: 0.775, peak: 0.8, hide: 0.83 }, // the third eye
  { show: 0.865, peak: 0.89, hide: 0.91 }, // raudra
  { show: 0.935, peak: 0.96, hide: 0.982 }, // the stillness at the center
] as const
