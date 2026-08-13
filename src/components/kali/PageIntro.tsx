import { motion } from 'framer-motion'
import { RevealText } from '@/components/typography/RevealText'

interface PageIntroProps {
  eyebrow: string
  title: string
  description?: string
}

/** The opening beat for every /kali/* sub-page — consistent, but never identical to the homepage hero. */
export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="relative flex min-h-[60vh] flex-col items-start justify-center gap-6 bg-obsidian px-6 pt-28 md:px-16">
      <RevealText
        text={eyebrow}
        splitBy="word"
        className="font-sans text-xs tracking-[0.4em] text-gold md:text-sm"
      />
      <RevealText
        text={title}
        as="h1"
        delay={0.1}
        className="max-w-3xl font-display text-5xl leading-[1.1] text-ivory md:text-7xl"
      />
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl font-serif text-lg italic leading-relaxed text-ivory/60 md:text-xl"
        >
          {description}
        </motion.p>
      )}
    </section>
  )
}
