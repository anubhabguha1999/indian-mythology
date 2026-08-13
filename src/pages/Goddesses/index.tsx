import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { PageIntro } from '@/components/kali/PageIntro'
import { GoddessArchive } from '@/components/archive/GoddessArchive'

/** /goddesses — the wider Divine Feminine archive. Kali remains the anchor, not the whole of it. */
export function GoddessesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageIntro
          eyebrow="THE DIVINE FEMININE"
          title={'ONE FORCE.\nMANY FACES.'}
          description="Shaktism holds Shakti as the active power of the universe — Durga, Parvati, Lakshmi, Saraswati and Kali are each a face of the same current."
        />
        <GoddessArchive heading={false} />
      </main>
      <Footer />
    </>
  )
}
