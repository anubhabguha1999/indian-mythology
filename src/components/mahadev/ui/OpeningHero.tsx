import { motion } from 'framer-motion'
import { ParticleField } from '@/components/particles/ParticleField'
import { SACRED_GOLD } from '../mahadevPalette'

/**
 * The very first frame a visitor sees on /shiva, before the pinned scroll
 * journey even mounts — per direction, a still, immediately dramatic scene
 * rather than dropping straight into Chapter 01's own slow fade-up out of
 * near-total black. Rebuilt to match the Kali page's own hero (KaliHero.tsx)
 * once that pattern existed — full-bleed portrait with a Ken Burns drift,
 * not the earlier draft's image confined to a right-hand column, for the
 * same reason KaliHero uses it: it's the stronger, simpler read, and now
 * both landing pages share one visual grammar instead of two.
 *
 * The portrait (public/mahadev/shiva-portrait.png) is a supplied image, not
 * code-drawn — two earlier drafts here tried to trace a face/figure from
 * hand-guessed SVG paths and neither read as intended.
 */
export function OpeningHero() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-[#04060a] md:items-center">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/mahadev/shiva-portrait.png"
          alt="Shiva standing before a mandala of Sanskrit script and a crescent moon, trishula in hand, matted hair loose in the wind."
          // Portrait-oriented source (1023x1537) cropped into a wide desktop
          // viewport loses most of its height — same fix as KaliHero.tsx's
          // own object-position: a much stronger top bias on desktop than
          // the taller mobile viewport needs, so the face stays in frame
          // instead of centering on the waist.
          className="h-full w-full animate-[kenburns_36s_ease-in-out_infinite_alternate] object-cover object-[38%_15%] md:object-[38%_14%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04060a] via-[#04060a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-transparent to-[#04060a]/30" />
      </motion.div>

      <ParticleField className="absolute inset-0" variant="dust" count={70} opacity={0.35} palette={['159,176,188', '110,120,130']} />

      <div className="relative z-10 w-full px-6 pb-16 pt-40 md:px-16 md:pb-0 md:pt-0">
        <div className="max-w-xl">
          <p className="mb-4 font-sans text-xs tracking-[0.5em] text-ivory/45">01</p>
          <h1 className="font-display leading-[0.95] text-ivory">
            <span className="block text-3xl tracking-wide md:text-4xl">THE SKY</span>
            <span className="block text-6xl tracking-wide md:text-8xl">BOWED.</span>
          </h1>
          <p className="mt-6 max-w-md font-serif text-base italic leading-relaxed text-ivory/65 md:text-lg">
            In the stillness of the Himalayas, where time stands frozen, <span style={{ color: SACRED_GOLD }}>Mahadev</span> remains.
          </p>

          <button
            type="button"
            data-cursor="OPEN"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="group mt-10 flex items-center gap-4 text-ivory/80 transition-colors hover:text-ivory"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-colors group-hover:bg-white/5"
              style={{ borderColor: SACRED_GOLD, boxShadow: `inset 0 0 0 1px ${SACRED_GOLD}` }}
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
                <path d="M1 1L11 7L1 13V1Z" fill={SACRED_GOLD} />
              </svg>
            </span>
            <span className="font-sans text-xs tracking-[0.35em]">BEGIN THE JOURNEY</span>
          </button>
        </div>
      </div>
    </section>
  )
}
