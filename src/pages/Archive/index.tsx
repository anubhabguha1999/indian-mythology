import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { PageIntro } from '@/components/kali/PageIntro'
import { ArchiveIndex } from '@/components/archive/ArchiveIndex'
import { CreditsList } from '@/components/archive/CreditsList'

/** /archive — the master index. Where the final scene's line actually leads. */
export function ArchivePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageIntro
          eyebrow="THE ARCHIVE"
          title={'EVERYTHING\nGATHERED HERE.'}
          description="Every chapter of this experience, in one place."
        />
        <ArchiveIndex />
        <CreditsList />
      </main>
      <Footer />
    </>
  )
}
