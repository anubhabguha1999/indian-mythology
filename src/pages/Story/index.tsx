import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { PageIntro } from '@/components/kali/PageIntro'
import { StoryScene } from '@/components/kali/StoryScene'
import { StoryChapters } from '@/components/kali/StoryChapters'
import { CinematicButton } from '@/components/cinematic/CinematicButton'

/** /kali/story — "THE STORY": the condensed cinematic beats, then the full telling. */
export function StoryPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageIntro
          eyebrow="THE STORY"
          title={'WHEN CHAOS\nTHREATENED THE WORLD'}
          description="One widely told account of how Kali came to be — and what she ended."
        />
        <StoryScene />
        <StoryChapters />
        <div className="flex justify-center bg-obsidian pb-24">
          <CinematicButton to="/kali/temples" variant="line">
            Where She Is Worshipped
          </CinematicButton>
        </div>
      </main>
      <Footer />
    </>
  )
}
