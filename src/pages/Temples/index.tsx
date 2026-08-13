import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { PageIntro } from '@/components/kali/PageIntro'
import { TempleJourney } from '@/components/kali/TempleJourney'

/** /kali/temples — "TEMPLES": a horizontal journey across her sacred geography. */
export function TemplesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageIntro
          eyebrow="SACRED PLACES"
          title={'WHERE MYTH\nBECOMES MEMORY'}
          description="Four places where her worship has stood, in some form, for centuries."
        />
        <TempleJourney />
      </main>
      <Footer />
    </>
  )
}
