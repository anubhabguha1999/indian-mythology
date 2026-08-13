import type { StoryChapter } from './stories'

/**
 * The story itself, told *during* the scroll rather than in a separate
 * section read afterward — same pattern as data/shivaStory.ts, and the
 * same reason: the cinematic shows the mountain, the leap, the battle,
 * the devotion, but never stops to say what any of it is actually about.
 * Eight beats, one per CinematicText.tsx window (see chapters.ts's
 * STORY_WINDOWS), each timed to land near whatever part of the visual
 * journey it's actually about — the mountain beat plays during "THE
 * MOUNTAIN" chapter, not before or after it. Accounts of Hanuman vary by
 * region, lineage and text (Valmiki's Ramayana, Tulsidas's Ramcharitmanas,
 * and regional oral traditions all differ in emphasis and detail); this
 * follows the most widely told version of each episode rather than
 * flattening every variant into one telling.
 */
export const hanumanOrigin: StoryChapter[] = [
  {
    id: 'forgotten-strength',
    index: '01',
    heading: 'THE FORGOTTEN STRENGTH',
    body: 'As a restless child, Hanuman once leapt for the rising sun, mistaking it for a fruit. The gods intervened, and in the aftermath the sages placed a condition on his own boundless strength: he would forget it entirely, until the day someone reminded him what he was capable of.',
    tradition: 'Regional oral tradition',
  },
  {
    id: 'kishkindha',
    index: '02',
    heading: 'A VĀNARA WAITING FOR PURPOSE',
    body: 'He grew up in the forests of Kishkindha among the vanaras, strength intact but unclaimed — capable of things he had no reason yet to attempt. It took meeting Rama, exiled and searching for his abducted wife Sita, for that strength to matter to anyone, including himself.',
  },
  {
    id: 'sanjeevani',
    index: '03',
    heading: 'THE MOUNTAIN HE COULD NOT LEAVE BEHIND',
    body: "When Lakshmana fell in battle, near death, the physician Sushena named a single herb on a Himalayan mountainside that could save him — sanjeevani. Sent to fetch it, Hanuman could not tell the healing herb from the rest of the mountainside. Rather than return empty-handed and risk being wrong, he carried the entire mountain back.",
    tradition: 'Valmiki Ramayana / Ramcharitmanas',
  },
  {
    id: 'leap',
    index: '04',
    heading: 'THE LEAP ACROSS THE OCEAN',
    body: "To find where Sita was held, Hanuman grew to a scale that matched the task in front of him and leapt across the sea to Lanka — a single bound where every other option had failed. Scale, in his own story, was never the point. It was only ever a means to reach her.",
  },
  {
    id: 'not-flight',
    index: '05',
    heading: 'NOT FLIGHT. SURRENDER TO PURPOSE.',
    body: "Crossing the sky, he is often described less as flying than as being carried — by his father Vayu, the wind, and by the purpose Rama had given him. The strength was real. Whose it served was never in question.",
  },
  {
    id: 'lanka-fire',
    index: '06',
    heading: 'HE WHO CARRIED FIRE AND DID NOT BURN',
    body: "Captured in Lanka and set alight by his own tail as mockery, Hanuman used the fire against the city instead, and walked out of it largely unburned. Even telling this, tradition is careful to frame it as duty carried out, not rage indulged.",
    tradition: 'Valmiki Ramayana',
  },
  {
    id: 'heart',
    index: '07',
    heading: 'WITHIN THIS CHEST, RAMA LIVES',
    body: 'Asked, late in his life, where his devotion actually lived, Hanuman is said to have torn open his own chest — and there, seated, were Rama and Sita. Not a metaphor offered for effect: the most literal answer available to a question about where devotion resides.',
    tradition: 'Bhakti tradition',
  },
  {
    id: 'still-serving',
    index: '08',
    heading: 'HIS STRENGTH WAS NEVER THE POINT',
    body: 'Every episode that gets remembered — the mountain, the leap, the fire — remembers the strength first. Hanuman himself, in nearly every telling, remembers only who it was for.',
  },
]
