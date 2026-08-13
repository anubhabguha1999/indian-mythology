import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { images, type ImageAsset } from '@/data/images'

interface Destination {
  id: string
  index: string
  label: string
  to: string
  image: ImageAsset
}

const DESTINATIONS: Destination[] = [
  { id: 'home', index: '00', label: 'THE FULL EXPERIENCE', to: '/', image: images.kali.secondary },
  { id: 'mother', index: '01', label: 'THE MOTHER', to: '/kali', image: images.kali.seated },
  { id: 'form', index: '02', label: 'THE FORM & SYMBOLISM', to: '/kali/symbolism', image: images.kali.primary },
  { id: 'story', index: '03', label: 'THE STORY', to: '/kali/story', image: images.kali.primary },
  { id: 'temples', index: '04', label: 'TEMPLES', to: '/kali/temples', image: images.temples.kalighat },
  { id: 'goddesses', index: '05', label: 'THE DIVINE FEMININE', to: '/goddesses', image: images.goddesses.durga },
]

/** The site's master index — every destination, one hover-driven list. */
export function ArchiveIndex() {
  const [activeId, setActiveId] = useState(DESTINATIONS[0].id)
  const active = DESTINATIONS.find((d) => d.id === activeId) ?? DESTINATIONS[0]

  return (
    <section className="relative overflow-hidden bg-obsidian">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={active.id}
            src={active.image.src}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.45, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: active.image.position }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-obsidian/80" />
      </div>

      <div className="relative z-10 divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.id}
            to={d.to}
            data-cursor="OPEN"
            onMouseEnter={() => setActiveId(d.id)}
            onFocus={() => setActiveId(d.id)}
            className="group flex items-baseline gap-6 px-6 py-7 md:px-16 md:py-9"
          >
            <span className="font-sans text-xs text-ivory/30">{d.index}</span>
            <span
              className={`font-display text-3xl tracking-wide transition-colors md:text-5xl ${
                activeId === d.id ? 'text-divine' : 'text-ivory group-hover:text-divine'
              }`}
            >
              {d.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
