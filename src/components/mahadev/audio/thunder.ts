/**
 * Synthesized thunder — no audio asset, built entirely from the Web Audio
 * API so there's nothing to source/license/download. A single shared
 * AudioContext and a single shared noise buffer (thunder is just filtered
 * noise; regenerating that buffer per clap would be wasted work for
 * something that's about to be low-passed into a rumble anyway) — every
 * clap is a fresh BufferSource + filter + gain envelope built from those.
 *
 * Kept independent of `useAmbientAudio` — that hook owns the music bed and
 * its own mute state; this module just needs to know *whether* to make
 * sound, not *how* the mute toggle works. `setThunderMuted` below is the
 * one bit of coupling, called from the same click that unmutes the music
 * so this shares that click's user-gesture unlock rather than needing (and
 * failing) its own.
 */

let ctx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null
let muted = true

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

function getNoiseBuffer(context: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const seconds = 2
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    noiseBuffer = buffer
  }
  return noiseBuffer
}

/** Called from the ambient-audio mute toggle — the visitor's own click,
 * i.e. a real gesture, which is what actually lets `resume()` succeed. */
export function setThunderMuted(value: boolean) {
  muted = value
  if (!value) getContext()?.resume().catch(() => undefined)
}

/**
 * One thunder clap: a low rumble (noise through a swept lowpass, the
 * classic "distant boom" shape) plus a short sharp crack layered on top for
 * closer/stronger strikes. `intensity` (0-1, Raudra's own stormIntensity)
 * scales loudness, brightness, and how much crack rides on top of the
 * rumble — a distant flicker of storm should thump, not detonate.
 */
export function playThunder(intensity: number) {
  if (muted) return
  const context = getContext()
  if (!context || context.state === 'closed') return
  context.resume().catch(() => undefined)

  const now = context.currentTime
  const strength = Math.min(1, Math.max(0.15, intensity))
  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  // The rumble — noise low-passed hard, sweeping a little brighter at onset
  // then falling away, with a slow multi-second decay (thunder trails off,
  // it doesn't stop).
  const rumbleSource = context.createBufferSource()
  rumbleSource.buffer = getNoiseBuffer(context)
  rumbleSource.loop = true
  const rumbleFilter = context.createBiquadFilter()
  rumbleFilter.type = 'lowpass'
  rumbleFilter.frequency.setValueAtTime(90 + strength * 180, now)
  rumbleFilter.frequency.exponentialRampToValueAtTime(50, now + 1.6)
  rumbleSource.connect(rumbleFilter).connect(master)

  const duration = 1.8 + strength * 1.6
  const peak = 0.16 + strength * 0.3
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(peak, now + 0.05 + Math.random() * 0.05)
  master.gain.exponentialRampToValueAtTime(0.001, now + duration)

  rumbleSource.start(now)
  rumbleSource.stop(now + duration + 0.1)
  rumbleSource.onended = () => {
    rumbleFilter.disconnect()
    master.disconnect()
  }

  // A short crack riding the front edge — only for stronger strikes, so
  // weak/distant flickers stay a plain low boom.
  if (strength > 0.4) {
    const crackSource = context.createBufferSource()
    crackSource.buffer = getNoiseBuffer(context)
    const crackFilter = context.createBiquadFilter()
    crackFilter.type = 'highpass'
    crackFilter.frequency.value = 700 + strength * 900
    const crackGain = context.createGain()
    crackGain.gain.setValueAtTime((strength - 0.4) * 0.35, now)
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    crackSource.connect(crackFilter).connect(crackGain).connect(context.destination)
    crackSource.start(now)
    crackSource.stop(now + 0.25)
    crackSource.onended = () => {
      crackFilter.disconnect()
      crackGain.disconnect()
    }
  }
}
