/** Shared quality-tier logic for the heavy Three.js scenes (Kali's
 * ManifestationScene, Shiva's RaudraShivaScene). */
export type Quality = 'high' | 'medium' | 'low'

/**
 * A one-time device-capability guess for the *starting* tier — mobile or a
 * low core-count means don't even try the heavy path. PerformanceMonitor
 * steps this down further at runtime if the frame rate actually sags;
 * this is just a sane opening bid.
 */
export function detectInitialQuality(isMobile: boolean): Quality {
  if (isMobile) return 'low'
  if (typeof navigator === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency ?? 4
  if (cores <= 4) return 'medium'
  return 'high'
}

export function stepDown(quality: Quality): Quality {
  if (quality === 'high') return 'medium'
  return 'low'
}
