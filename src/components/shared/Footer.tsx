import { Link } from 'react-router-dom'

interface FooterProps {
  /** Devanagari line — defaults to the site-wide Kali identity. */
  glyph?: string
  description?: string
  creditsHref?: string
  creditsLabel?: string
}

export function Footer({
  glyph = 'माँ काली',
  description = "Presented with respect for the diversity of Hindu tradition. Accounts of Devi's stories vary by region, lineage and text — where a single telling is shown here, others exist.",
  creditsHref = '/archive#credits',
  creditsLabel = 'IMAGE CREDITS',
}: FooterProps) {
  return (
    <footer className="relative border-t border-ivory/[0.06] bg-obsidian px-6 py-10 md:px-16">
      <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <span className="font-deva text-base text-ivory/40">{glyph}</span>
        <p className="max-w-xl text-[11px] leading-relaxed tracking-wide text-ivory/35">{description}</p>
        <Link
          to={creditsHref}
          data-cursor="OPEN"
          className="text-[11px] tracking-[0.25em] text-ivory/40 transition-colors hover:text-divine"
        >
          {creditsLabel}
        </Link>
      </div>
    </footer>
  )
}
