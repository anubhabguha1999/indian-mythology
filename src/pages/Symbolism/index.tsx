import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { PageIntro } from '@/components/kali/PageIntro'
import { FormScene } from '@/components/kali/FormScene'
import { SymbolismScene } from '@/components/kali/SymbolismScene'

/** /kali/symbolism — "THE FORM": full iconography sequence + the concepts beneath it. */
export function SymbolismPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageIntro
          eyebrow="THE FORM & THE SYMBOLISM"
          title={'NOTHING HERE\nIS WITHOUT MEANING.'}
          description="Every element of her image — crown to feet — carries a specific idea. Scroll to move through them, one at a time."
        />
        <FormScene />
        <SymbolismScene />
      </main>
      <Footer />
    </>
  )
}
