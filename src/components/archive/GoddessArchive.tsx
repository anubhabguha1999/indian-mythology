import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { RevealText } from '@/components/typography/RevealText'
import { Mandala } from '@/components/kali/Mandala'
import { goddesses, type Goddess } from '@/data/goddesses'

interface GoddessArchiveProps {
  heading?: boolean
  intro?: string
}

/**
 * SCENE 11 — THE DIVINE FEMININE.
 * One interactive archive, reused verbatim on the homepage teaser and the
 * full /goddesses page. Desktop: hovering a name floods the background
 * with her portrait. Touch devices get a vertical stack instead — hover
 * doesn't exist there, so the interaction shouldn't pretend it does.
 */
export function GoddessArchive({ heading = true, intro }: GoddessArchiveProps) {
  const hasFinePointer = useHasFinePointer()
  const location = useLocation()
  const [activeId, setActiveId] = useState(
    () => goddesses.find((g) => location.hash === `#${g.id}`)?.id ?? goddesses[0].id,
  )

  useEffect(() => {
    const found = goddesses.find((g) => location.hash === `#${g.id}`)
    if (found) setActiveId(found.id)
  }, [location.hash])

  const active = goddesses.find((g) => g.id === activeId) ?? goddesses[0]

  return (
    <section id="goddesses" className="relative bg-obsidian py-24 md:py-0">
      {heading && (
        <div className="px-6 pb-10 md:px-16 md:pb-0 md:pt-28">
          <RevealText
            text="THE DIVINE FEMININE"
            as="h2"
            splitBy="word"
            className="font-display text-3xl tracking-wide text-ivory md:text-5xl"
          />
          {intro && (
            <p className="mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-ivory/55 md:text-xl">
              {intro}
            </p>
          )}
        </div>
      )}

      {hasFinePointer ? (
        <DesktopArchive active={active} onHover={setActiveId} />
      ) : (
        <MobileArchive />
      )}
    </section>
  )
}

function DesktopArchive({ active, onHover }: { active: Goddess; onHover: (id: string) => void }) {
  return (
    <div className="relative mt-8 flex h-[85vh] min-h-[560px] items-stretch overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {active.image ? (
            <motion.img
              key={active.id}
              src={active.image.src}
              alt={active.image.alt}
              data-cursor="VIEW"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: active.image.position }}
            />
          ) : (
            <motion.div
              key="shakti-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,rgba(185,147,69,0.18),transparent_65%)]"
            >
              <Mandala size={620} opacity={0.3} spin />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/55 to-obsidian/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40" />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center gap-1 px-6 md:w-[40%] md:px-16">
        {goddesses.map((g, i) => (
          <Link
            key={g.id}
            to={`/goddesses#${g.id}`}
            data-cursor="OPEN"
            onMouseEnter={() => onHover(g.id)}
            onFocus={() => onHover(g.id)}
            className="group flex items-baseline gap-4 py-2"
          >
            <span className="font-sans text-[11px] text-ivory/30">0{i + 1}</span>
            <span
              className={`font-display text-2xl tracking-wide transition-colors md:text-3xl ${
                active.id === g.id ? 'text-divine' : 'text-ivory/70 group-hover:text-ivory'
              }`}
            >
              {g.name}
            </span>
          </Link>
        ))}

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="mt-6 max-w-sm"
          >
            <p className="font-deva text-lg text-divine/80">{active.sanskrit}</p>
            <p className="mt-1 font-serif text-base italic text-gold/90">{active.epithet}</p>
            <p className="mt-3 text-sm leading-relaxed text-ivory/60">{active.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function MobileArchive() {
  return (
    <div className="flex flex-col gap-3 px-6">
      {goddesses.map((g) => (
        <Link
          key={g.id}
          id={g.id}
          to={`/goddesses#${g.id}`}
          data-cursor="OPEN"
          className="relative flex h-40 items-end overflow-hidden"
        >
          {g.image ? (
            <img
              src={g.image.src}
              alt={g.image.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: g.image.position }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,rgba(185,147,69,0.15),transparent_65%)]">
              <Mandala size={140} opacity={0.4} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/45 to-transparent" />
          <div className="relative z-10 p-4">
            <h3 className="font-display text-xl text-ivory">{g.name}</h3>
            <p className="text-[11px] tracking-[0.2em] text-gold">{g.epithet}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
