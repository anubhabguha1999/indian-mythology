import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Menu, Volume2, VolumeX, X } from 'lucide-react'
import { UI_WARM } from '../hanumanPalette'

const MENU_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Mahadev — Shiva', to: '/shiva' },
]

/**
 * Per the brief: HANUMAN left, THE IMPOSSIBLE right, nothing else — no
 * traditional navbar, no cards, no giant buttons. The one concession is a
 * small menu trigger (there has to be *some* way back to the rest of the
 * site) styled as unobtrusively as mahadev/ui/Header.tsx's own.
 */
export function Header({ muted, onToggleMute }: { muted?: boolean; onToggleMute?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const chromeOpacity = useTransform(scrollY, [0, 600], [1, 0.55])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <motion.div
          aria-hidden="true"
          style={{ opacity: chromeOpacity, background: `linear-gradient(90deg, transparent, ${UI_WARM}33 25%, ${UI_WARM}33 75%, transparent)` }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        />

        <nav className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-[4.5rem] md:px-10">
          <Link to="/" data-cursor="OPEN" className="font-display text-[13px] tracking-[0.3em] text-ivory/85 transition-colors hover:text-ivory md:text-sm">
            HANUMAN
          </Link>

          <div className="flex items-center gap-2">
            <span className="mr-4 hidden font-sans text-[10px] tracking-[0.4em] text-ivory/40 md:inline">THE IMPOSSIBLE</span>
            {onToggleMute && (
              <button
                type="button"
                data-cursor="OPEN"
                onClick={onToggleMute}
                aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
                aria-pressed={muted}
                className="rounded-full p-2 text-ivory/50 ring-1 ring-transparent transition-colors hover:text-ivory hover:ring-ivory/15"
              >
                {muted ? <VolumeX size={15} strokeWidth={1.1} /> : <Volume2 size={15} strokeWidth={1.1} />}
              </button>
            )}
            <button
              type="button"
              data-cursor="OPEN"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              className="rounded-full p-2 text-ivory/60 ring-1 ring-transparent transition-colors hover:text-ivory hover:ring-ivory/15"
            >
              <Menu size={17} strokeWidth={1.1} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[160] flex flex-col bg-[#0c0d0f]/[0.97] backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-8">
              <span className="font-deva text-lg text-ivory/45">हनुमान</span>
              <button
                type="button"
                data-cursor="OPEN"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 text-ivory/70 ring-1 ring-transparent transition-colors hover:text-ivory hover:ring-ivory/15"
              >
                <X size={22} strokeWidth={1.1} />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-start justify-center gap-2 px-6 md:px-16">
              {MENU_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="group overflow-hidden"
                >
                  <NavLink
                    to={link.to}
                    data-cursor="OPEN"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `relative inline-block pb-1 font-display text-3xl uppercase tracking-wide transition-colors sm:text-4xl md:text-5xl ${isActive ? 'text-ivory' : 'text-ivory/55 hover:text-ivory'}`
                    }
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <>
                        {link.label}
                        <span
                          aria-hidden="true"
                          className={`absolute bottom-0 left-0 h-[2px] w-full origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                          style={{ backgroundColor: UI_WARM }}
                        />
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-6 pb-8 text-[10px] tracking-[0.3em] text-ivory/25 md:px-16">
              <span className="inline-block h-[3px] w-[3px] rounded-full" style={{ backgroundColor: UI_WARM }} />
              DEVOTION HAS NO LIMIT
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
