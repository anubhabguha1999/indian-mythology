/**
 * Core content for Maa Kali — the anchor of the entire experience.
 * Kept separate from `goddesses.ts` (the wider Divine Feminine archive),
 * `temples.ts` (sacred geography) and `stories.ts` (the expanded narrative).
 */

export const kaliProfile = {
  name: 'KALI',
  devanagari: 'माँ काली',
  epithet: 'THE POWER BEYOND TIME',
  tagline: 'An exploration of the timeless Mother, her symbolism, stories and traditions.',
  description:
    'Kali is among the most powerful and widely worshipped forms of the Goddess in Hindu tradition — central to Shaktism and especially revered across Bengal, Assam and Odisha. Her name is bound to kāla, time itself: she is the force that consumes every illusion, every ego, every false shape — and, in doing so, sets her devotees free.',
}

export interface IconographyElement {
  id: string
  index: string
  name: string
  sanskrit: string
  meaning: string
  detail: string
}

export const iconography: IconographyElement[] = [
  {
    id: 'crown',
    index: '01',
    name: 'THE CROWN',
    sanskrit: 'मुकुट',
    meaning: 'Sovereignty over time itself.',
    detail:
      'In many depictions her hair falls loose and unbound rather than bound by any crown — often crested with a crescent moon. Untamed by convention, it marks a power that answers to nothing but itself.',
  },
  {
    id: 'eyes',
    index: '02',
    name: 'THE EYES',
    sanskrit: 'त्रिनेत्र',
    meaning: 'Sight beyond illusion.',
    detail:
      'A third eye, present in many depictions, is said to see past, present and future at once — perception unclouded by māyā, the illusion that ordinary sight mistakes for the whole truth.',
  },
  {
    id: 'tongue',
    index: '03',
    name: 'THE TONGUE',
    sanskrit: 'जिह्वा',
    meaning: 'The instant the fierce meets the tender.',
    detail:
      'Traditions read her lolling tongue differently. Some describe it as the hunger that consumed the demon Raktabīja before his spilled blood could multiply him. Bengali devotional tradition offers a gentler account — startled realization, caught mid-motion.',
  },
  {
    id: 'arms',
    index: '04',
    name: 'THE ARMS',
    sanskrit: 'भुजा',
    meaning: 'Power held in balance with protection.',
    detail:
      'Commonly shown with four arms, each gesture carries its own meaning — destruction in one hand, protection in another. Ferocity and grace are never separated; they are the same gesture, seen from two sides.',
  },
  {
    id: 'sword',
    index: '05',
    name: 'THE SWORD',
    sanskrit: 'खड्ग',
    meaning: 'Symbol of the destruction of ignorance.',
    detail:
      'The khaḍga cuts, but not at flesh in the way it first appears — it cuts through avidyā, the ignorance that mistakes the temporary for the eternal.',
  },
  {
    id: 'garland',
    index: '06',
    name: 'THE GARLAND',
    sanskrit: 'मुण्डमाला',
    meaning: 'The source and dissolution of all language.',
    detail:
      'The muṇḍamālā — a garland traditionally described as fifty skulls or severed heads, one for each letter of the Sanskrit alphabet — casts her as the origin and the end of speech, thought and creation itself.',
  },
  {
    id: 'feet',
    index: '07',
    name: 'THE FEET',
    sanskrit: 'चरण',
    meaning: 'Where untamed force meets stillness.',
    detail:
      'She is widely shown standing upon Shiva. In the best-known devotional telling, her foot upon him is the moment unbound force meets consciousness at rest — the dance quiets, and balance is restored.',
  },
]

export interface SymbolismConcept {
  id: string
  word: string
  description: string
  morphsInto?: string
}

export const symbolism: SymbolismConcept[] = [
  {
    id: 'darkness',
    word: 'DARKNESS',
    description:
      'Not the absence of the divine, but the space before form — the womb from which creation emerges, and to which it returns.',
  },
  {
    id: 'time',
    word: 'TIME',
    description:
      'Her name shares its root with kāla, time. She is the force that ages every star, every empire, every sense of self — impartial, unhurried, absolute.',
  },
  {
    id: 'death',
    word: 'DEATH',
    description:
      'She is worshipped, unusually, at cremation grounds — the one place illusion cannot survive. Here, death is not an ending to fear but a threshold.',
  },
  {
    id: 'transformation',
    word: 'TRANSFORMATION',
    description: 'What she destroys is never being itself — only the false shape it had taken.',
    morphsInto: 'LIBERATION',
  },
  {
    id: 'protection',
    word: 'PROTECTION',
    description:
      'The same ferocity that ends demons stands, to her devotees, as a wall around the ones she loves. Fear of her is said to dissolve into fearlessness.',
  },
  {
    id: 'shakti',
    word: 'SHAKTI',
    description:
      'Durga, Parvati, Lakshmi, Saraswati — each a face of Shakti, the one cosmic energy. Kali is that same force, unveiled without ornament.',
  },
]

export interface StoryBeat {
  line: string
}

/** The condensed, cinematic beats used in the homepage narrative scene. */
export const storyBeatsCondensed: StoryBeat[] = [
  { line: 'THE DARKNESS GREW.' },
  { line: 'THE GODDESSES ANSWERED.' },
  { line: 'FROM THE DIVINE FEMININE\nCAME KALI.' },
  { line: 'NOT AS DESTRUCTION ALONE.' },
  { line: 'BUT AS THE END\nOF WHAT MUST END.' },
]

export interface FestivalStep {
  id: string
  label: string
  caption: string
}

export const festivalJourney: FestivalStep[] = [
  { id: 'dark', label: 'DARKNESS', caption: 'The new-moon night of Kartik, the darkest of the year.' },
  { id: 'lamp', label: 'ONE LAMP', caption: 'A single oil lamp is lit against it.' },
  { id: 'lights', label: 'A THOUSAND LIGHTS', caption: 'Then hundreds more, until the darkness has nowhere left to stand.' },
  { id: 'temple', label: 'THE TEMPLE WAKES', caption: 'Temples across Bengal, Assam and Odisha fill through the night.' },
  { id: 'gold', label: 'GOLDEN NIGHT', caption: 'Kali Pūjā — the night the Mother is worshipped in her fiercest form.' },
]
