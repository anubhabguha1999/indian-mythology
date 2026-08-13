import { motion } from 'framer-motion'
import { RevealText } from '@/components/typography/RevealText'
import { CinematicButton } from '@/components/cinematic/CinematicButton'
import { ParticleField } from '@/components/particles/ParticleField'
import { kaliProfile } from '@/data/kali'

/**
 * The moment of arrival, right after the Revelation completes. Static
 * relative to scroll (this is where the camera finally stops) — entrance
 * choreography plays once, on view.
 *
 * The portrait (public/kali/kali-portrait.png) is a supplied image, same
 * as Shiva's page's OpeningHero — full-bleed here rather than confined to
 * a side column, since that's this hero's own existing pattern (Ken Burns
 * background + left-aligned text), not something built to match Shiva's
 * split layout.
 */
export function KaliHero() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-obsidian md:items-center">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12, opacity: 0.6 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/kali/kali-portrait.png"
          alt="Maa Kali, fierce-eyed with a golden crown and third eye, garlanded in skulls and red flowers, holding a blade before flames."
          // A portrait-oriented image (1024x1536) cropped into a wide desktop
          // viewport loses most of its height — object-cover's default 50%
          // vertical anchor left the crown/face (the top ~30%) cropped off,
          // centering on the torso/skulls instead. Desktop needs a much
          // stronger top bias than the taller mobile viewport does, hence
          // the two breakpoints rather than one fixed position.
          className="h-full w-full animate-[kenburns_36s_ease-in-out_infinite_alternate] object-cover object-[50%_20%] md:object-[50%_17%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      </motion.div>

      <ParticleField className="absolute inset-0" variant="ember" count={44} opacity={0.4} />

      <div className="relative z-10 w-full px-6 pb-16 pt-40 md:px-16 md:pb-0 md:pt-0">
        <div className="max-w-xl">
          <RevealText
            text={kaliProfile.devanagari}
            as="p"
            splitBy="word"
            className="font-deva text-2xl text-divine/90 md:text-3xl"
          />

          <RevealText
            text={kaliProfile.name}
            as="h1"
            splitBy="word"
            delay={0.1}
            className="mt-2 font-display text-6xl leading-none tracking-wide text-ivory sm:text-7xl md:text-8xl"
          />

          <RevealText
            text={kaliProfile.epithet}
            as="p"
            splitBy="word"
            delay={0.28}
            className="mt-5 font-sans text-xs tracking-[0.45em] text-gold md:text-sm"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-md font-serif text-lg leading-relaxed text-ivory/70 md:text-xl"
          >
            {kaliProfile.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-10"
          >
            {/* Both used to navigate to separate /kali/story and
                /kali/symbolism routes — that whole journey now lives
                inline on this same page (see pages/Home/index.tsx), so
                both scroll into it instead, same as /shiva's own
                "Begin The Journey" pattern. */}
            <CinematicButton variant="primary" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
              Enter The Story
            </CinematicButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
