import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { KaliHero } from '@/components/kali/KaliHero'
import { ChapterIndex } from '@/components/kali/ChapterIndex'
import { RevealText } from '@/components/typography/RevealText'
import { Mandala } from '@/components/kali/Mandala'
import { kaliProfile } from '@/data/kali'

/** /kali — "THE MOTHER": a hub page for the three deep-dive chapters. */
export function KaliPage() {
  return (
    <>
      <Navbar />
      <main>
        <KaliHero />

        <section className="relative overflow-hidden bg-obsidian px-6 py-24 md:px-16 md:py-36">
          <Mandala
            size={520}
            opacity={0.08}
            spin
            className="pointer-events-none absolute -right-32 -top-32 md:-right-16 md:-top-16"
          />
          <RevealText
            text="THE POWER BEHIND EVERY ENDING."
            as="h2"
            splitBy="word"
            className="relative max-w-2xl font-display text-4xl leading-[1.2] text-ivory md:text-6xl"
          />
          <p className="relative mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-ivory/60 md:text-xl">
            {kaliProfile.description}
          </p>
        </section>

        <ChapterIndex />
      </main>
      <Footer />
    </>
  )
}
