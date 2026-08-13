import { Navbar } from '@/components/navigation/Navbar'
import { CinematicButton } from '@/components/cinematic/CinematicButton'

export function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-obsidian px-6 text-center">
        <p className="font-deva text-2xl text-divine/80">काली</p>
        <h1 className="font-display text-4xl text-ivory md:text-6xl">THIS PATH ENDS HERE.</h1>
        <p className="max-w-md font-serif text-lg italic text-ivory/55">
          What you're looking for isn't in this telling — but the rest of the story is.
        </p>
        <CinematicButton to="/" variant="line">
          Return To The Beginning
        </CinematicButton>
      </main>
    </>
  )
}
