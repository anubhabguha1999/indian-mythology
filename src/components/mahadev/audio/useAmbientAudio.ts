import { useEffect, useRef, useState } from 'react'
import type { MotionValue } from 'framer-motion'
import { setThunderMuted } from './thunder'

const MUSIC_SRC = '/music.mp3'
const BASE_VOLUME = 0.45

/**
 * The site's music bed — public/music.mp3, looped, muted by default per
 * direction: the opening darkness stays literally silent until the
 * visitor chooses to turn it on, rather than an autoplaying soundtrack
 * deciding for them. Muted playback is exempt from the browser's autoplay-
 * needs-a-gesture rule, so this can start the instant the experience
 * mounts; unmuting is the one moment that needs a real gesture, and the
 * visitor's own click on the header's mute toggle is exactly that.
 */
export function useAmbientAudio(enabled: boolean, stormIntensity?: MotionValue<number>) {
  const [muted, setMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    const audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.muted = true
    audio.volume = BASE_VOLUME
    // Muted autoplay can still be blocked on some mobile browsers even
    // though it's exempt from the gesture requirement on desktop — if it
    // is, the visitor's own unmute click below retries it with a genuine
    // gesture already in hand.
    audio.play().catch(() => undefined)
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [enabled])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = muted
    if (!muted) audio.play().catch(() => undefined)
    // Thunder rides the same mute switch and, more importantly, the same
    // click — the one real user gesture that can actually unlock a Web
    // Audio AudioContext.
    setThunderMuted(muted)
  }, [muted])

  // Raudra nudges the volume up rather than changing anything about the
  // track itself — the world getting louder around a visitor who already
  // chose to have sound on, not a separate effects layer.
  useEffect(() => {
    if (!stormIntensity) return
    return stormIntensity.on('change', (v) => {
      if (audioRef.current) audioRef.current.volume = Math.min(1, BASE_VOLUME + v * 0.25)
    })
  }, [stormIntensity])

  return { muted, toggleMute: () => setMuted((m) => !m) }
}
