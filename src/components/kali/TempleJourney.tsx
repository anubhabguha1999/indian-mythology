import { useRef, type KeyboardEvent } from 'react'
import { kaliTemples } from '@/data/temples'

/**
 * SCENE 09 (full) — SACRED PLACES.
 * A true horizontal journey: one full-height panel per temple, native
 * scroll-snap so trackpad, touch and (via arrow keys) keyboard all work.
 */
export function TempleJourney() {
  const containerRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const el = containerRef.current
    if (!el) return
    if (e.key === 'ArrowRight') el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
    if (e.key === 'ArrowLeft') el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Sacred places associated with Kali"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto bg-obsidian"
    >
      {kaliTemples.map((temple) => (
        <div
          key={temple.id}
          className="relative flex h-screen w-screen flex-shrink-0 snap-start items-end overflow-hidden"
        >
          <img
            src={temple.image.src}
            alt={temple.image.alt}
            data-cursor="VIEW"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: temple.image.position }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-transparent to-transparent" />

          <div className="relative z-10 max-w-xl p-8 md:p-16">
            <h3 className="font-display text-5xl text-ivory md:text-7xl">{temple.name}</h3>
            <p className="mt-3 text-xs tracking-[0.3em] text-gold md:text-sm">{temple.location}</p>
            <p className="mt-5 max-w-md font-serif text-lg leading-relaxed text-ivory/70">{temple.description}</p>
          </div>

          <span className="absolute bottom-6 right-6 font-sans text-[10px] tracking-[0.3em] text-ivory/35 md:right-10">
            SCROLL →
          </span>
        </div>
      ))}
    </div>
  )
}
