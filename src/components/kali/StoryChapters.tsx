import { motion } from 'framer-motion'
import { EASE_CINEMATIC } from '@/animations/transitions'
import { kaliOrigin } from '@/data/stories'

/** The expanded, editorial telling of her emergence — read, not scroll-jacked. */
export function StoryChapters() {
  return (
    <section className="bg-obsidian px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto max-w-3xl">
        {kaliOrigin.map((chapter) => (
          <motion.article
            key={chapter.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE_CINEMATIC }}
            className="border-t border-ivory/10 py-10 first:border-t-0 first:pt-0"
          >
            <span className="font-sans text-xs tracking-[0.3em] text-ivory/30">{chapter.index}</span>
            <h3 className="mt-3 font-display text-3xl text-ivory md:text-4xl">{chapter.heading}</h3>
            <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-ivory/70">{chapter.body}</p>
            {chapter.tradition && (
              <p className="mt-3 text-xs tracking-[0.2em] text-gold/80">— {chapter.tradition}</p>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  )
}
