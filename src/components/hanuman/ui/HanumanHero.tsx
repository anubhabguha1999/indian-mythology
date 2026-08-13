import { motion } from 'framer-motion'
import { ParticleField } from '@/components/particles/ParticleField'
import { WARM_GOLD } from '../hanumanPalette'

/**
 * The landing frame on /hanuman, before the pinned scroll journey mounts —
 * same pattern as OpeningHero.tsx (Shiva) and KaliHero.tsx: a full-bleed
 * supplied portrait with a Ken Burns drift, headline, and a CTA that
 * scrolls into the experience rather than navigating away.
 */
export function HanumanHero() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-[#0c0d0f] md:items-center">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/hanuman_ji/bajrangbali.jpg"
          alt="Hanuman, kneeling in devotion, hands folded."
          className="h-full w-full animate-[kenburns_36s_ease-in-out_infinite_alternate] object-cover object-[50%_20%] md:object-[50%_34%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d0f] via-[#0c0d0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0f] via-transparent to-[#0c0d0f]/30" />
      </motion.div>

      <ParticleField className="absolute inset-0" variant="ember" count={60} opacity={0.3} palette={['201,168,74', '138,90,50']} />

      <div className="relative z-10 w-full px-6 pb-16 pt-40 md:px-16 md:pb-0 md:pt-0">
        <div className="max-w-xl">
          <p className="mb-4 font-deva text-2xl text-ivory/70">हनुमान</p>
          <h1 className="font-display leading-[0.95] text-ivory">
            <span className="block text-6xl tracking-wide md:text-8xl">HANUMAN</span>
          </h1>
          <p className="mt-5 font-sans text-xs tracking-[0.45em]" style={{ color: WARM_GOLD }}>
            THE IMPOSSIBLE
          </p>
          <p className="mt-6 max-w-md font-serif text-base italic leading-relaxed text-ivory/65 md:text-lg">
            Power without ego. Devotion without limit.
          </p>

          <button
            type="button"
            data-cursor="OPEN"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="group mt-10 flex items-center gap-4 text-ivory/80 transition-colors hover:text-ivory"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-colors group-hover:bg-white/5"
              style={{ borderColor: WARM_GOLD, boxShadow: `inset 0 0 0 1px ${WARM_GOLD}` }}
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
                <path d="M1 1L11 7L1 13V1Z" fill={WARM_GOLD} />
              </svg>
            </span>
            <span className="font-sans text-xs tracking-[0.35em]">BEGIN</span>
          </button>
        </div>
      </div>
    </section>
  )
}
