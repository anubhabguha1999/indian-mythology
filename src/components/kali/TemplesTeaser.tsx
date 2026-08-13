import { RevealText } from '@/components/typography/RevealText'
import { kaliTemples, type SacredPlace } from '@/data/temples'

function TemplePanel({ temple }: { temple: SacredPlace }) {
  return (
    <div className="group relative h-[68vh] w-[80vw] flex-shrink-0 snap-start overflow-hidden md:w-[30rem]">
      <img
        src={temple.image.src}
        alt={temple.image.alt}
        data-cursor="VIEW"
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        style={{ objectPosition: temple.image.position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/5 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="font-display text-2xl text-ivory">{temple.name}</h3>
        <p className="mt-1 text-[11px] tracking-[0.25em] text-gold">{temple.location}</p>
      </div>
    </div>
  )
}

/**
 * SCENE 09 — SACRED PLACES (home teaser).
 * Motion language: parallax via a horizontal, snap-scrolling filmstrip —
 * a journey across geography rather than a vertical pin. This filmstrip
 * already shows every entry in `kaliTemples`, so there's no separate
 * "full version" to link onward to (a former /kali/temples page did, and
 * has since folded into the same one continuous page this scene lives on).
 */
export function TemplesTeaser() {
  return (
    <section className="relative bg-obsidian py-24 md:py-32">
      <div className="px-6 md:px-16">
        <RevealText
          text="WHERE SHE IS WORSHIPPED"
          as="h2"
          splitBy="word"
          className="font-display text-3xl tracking-wide text-ivory md:text-5xl"
        />
        <RevealText
          text="Places where myth becomes memory."
          splitBy="word"
          delay={0.15}
          className="mt-4 font-serif text-lg italic text-ivory/50 md:text-xl"
        />
      </div>

      <div className="scrollbar-none mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 md:px-16">
        {kaliTemples.map((temple) => (
          <TemplePanel key={temple.id} temple={temple} />
        ))}
      </div>
    </section>
  )
}
