import { images } from '@/data/images'

const CREDITS = [
  { label: 'Kali — primary portrait', asset: images.kali.primary },
  { label: 'Kali — secondary portrait', asset: images.kali.secondary },
  { label: 'Kali — seated portrait (Kangra miniature)', asset: images.kali.seated },
  { label: 'Durga', asset: images.goddesses.durga },
  { label: 'Parvati', asset: images.goddesses.parvati },
  { label: 'Lakshmi', asset: images.goddesses.lakshmi },
  { label: 'Saraswati', asset: images.goddesses.saraswati },
  { label: 'Dakshineswar Kali Temple', asset: images.temples.dakshineswar },
  { label: 'Kalighat Kali Temple', asset: images.temples.kalighat },
  { label: 'Kamakhya Temple', asset: images.temples.kamakhya },
  { label: 'Tarapith Temple', asset: images.temples.tarapith },
]

/** Every image credited — attribution for the classical art and temple photography this site relies on. */
export function CreditsList() {
  return (
    <section id="credits" className="bg-obsidian px-6 py-24 md:px-16">
      <h2 className="font-display text-2xl tracking-[0.2em] text-ivory md:text-3xl">IMAGE CREDITS</h2>
      <p className="mt-3 max-w-xl font-sans text-sm text-ivory/50">
        Every image is a classical public-domain painting or freely-licensed photograph, served via Wikimedia
        Commons.
      </p>
      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {CREDITS.map((c) => (
          <li key={c.label} className="border-t border-ivory/10 pt-4">
            <p className="font-sans text-sm text-ivory/80">{c.label}</p>
            <p className="mt-1 text-xs text-ivory/40">
              {c.asset.credit.title} — {c.asset.credit.author} · {c.asset.credit.license}
            </p>
            <a
              href={c.asset.credit.source}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="OPEN"
              className="mt-1 inline-block text-xs text-gold transition-colors hover:text-divine"
            >
              View source ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
