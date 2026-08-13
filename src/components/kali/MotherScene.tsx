import { motion } from 'framer-motion'
import { RevealText } from '@/components/typography/RevealText'
import { ParticleField } from '@/components/particles/ParticleField'
import { images } from '@/data/images'

/**
 * SCENE 08 — THE MOTHER.
 * Motion language: slow floating drift, nothing else. A deliberate hard
 * cut in tone from the Dance's darkness into warmth — the one scene in
 * the site designed to feel entirely at rest.
 */
export function MotherScene() {
  const portrait = images.kali.seated

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#1a1108]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(227,196,106,0.22),transparent_65%)]" />

      <motion.div
        className="absolute right-0 top-0 h-full w-full md:w-[62%]"
        initial={{ opacity: 0, scale: 1.06 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-full w-full animate-[float-slow_9s_ease-in-out_infinite]">
          <img
            src={portrait.src}
            alt={portrait.alt}
            loading="eager"
            className="h-full w-full object-cover"
            style={{ objectPosition: portrait.position, filter: 'saturate(1.1) brightness(1.05) contrast(1.04)' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1108] via-[#1a1108]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1108]/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[#B99345]/12 mix-blend-soft-light" />
      </motion.div>

      <ParticleField
        className="absolute inset-0"
        variant="dust"
        count={26}
        palette={['227,196,106', '237,227,208']}
        opacity={0.35}
      />

      <div className="relative z-10 max-w-xl px-6 md:px-16">
        <RevealText
          text="BEYOND FEAR."
          splitBy="word"
          className="font-sans text-xs tracking-[0.45em] text-gold md:text-sm"
        />
        <RevealText
          text={'THE MOTHER\nIS ALSO\nTHE PROTECTOR.'}
          as="h2"
          delay={0.15}
          className="mt-5 font-display text-4xl leading-[1.2] text-ivory sm:text-5xl md:text-6xl"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-6 max-w-md font-serif text-lg italic leading-relaxed text-ivory/60 md:text-xl"
        >
          The same force that ends what must end is, to her devotees, the gentlest presence they know.
        </motion.p>
      </div>
    </section>
  )
}
