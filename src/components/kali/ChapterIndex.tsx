import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { images, type ImageAsset } from '@/data/images'

interface Chapter {
  id: string
  label: string
  description: string
  to: string
  image: ImageAsset
}

const CHAPTERS: Chapter[] = [
  {
    id: 'form',
    label: 'THE FORM',
    description: 'Seven elements of her iconography — and the symbolism beneath each one.',
    to: '/kali/symbolism',
    image: images.kali.seated,
  },
  {
    id: 'story',
    label: 'THE STORY',
    description: "When chaos threatened the world, and what answered it.",
    to: '/kali/story',
    image: images.kali.primary,
  },
  {
    id: 'temples',
    label: 'TEMPLES',
    description: 'Dakshineswar, Kalighat, Kamakhya, Tarapith — where she is worshipped.',
    to: '/kali/temples',
    image: images.temples.dakshineswar,
  },
]

/**
 * A chapter-select list for the /kali hub — hovering a chapter floods the
 * background behind the whole list with its image, same crossfade
 * mechanism as <GoddessArchive/> but scoped to three destinations.
 */
export function ChapterIndex() {
  const [activeId, setActiveId] = useState(CHAPTERS[0].id)
  const active = CHAPTERS.find((c) => c.id === activeId) ?? CHAPTERS[0]

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={active.id}
            src={active.image.src}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.5, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: active.image.position }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-obsidian/75" />
      </div>

      <div className="relative z-10 divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
        {CHAPTERS.map((chapter) => (
          <Link
            key={chapter.id}
            to={chapter.to}
            data-cursor="OPEN"
            onMouseEnter={() => setActiveId(chapter.id)}
            onFocus={() => setActiveId(chapter.id)}
            className="group flex flex-col items-start justify-between gap-2 px-6 py-8 transition-colors md:flex-row md:items-center md:px-16 md:py-10"
          >
            <span
              className={`font-display text-4xl tracking-wide transition-colors md:text-6xl ${
                activeId === chapter.id ? 'text-divine' : 'text-ivory group-hover:text-divine'
              }`}
            >
              {chapter.label}
            </span>
            <span className="max-w-sm font-serif text-base italic text-ivory/55 md:text-lg">
              {chapter.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
