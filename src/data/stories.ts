export interface StoryChapter {
  id: string
  index: string
  heading: string
  body: string
  tradition?: string
}

/**
 * The expanded telling used on /kali/story. Rooted in the Devī Māhātmya /
 * Devī-Bhāgavata tradition of Kali's emergence, with regional variation
 * flagged rather than flattened into one canonical account.
 */
export const kaliOrigin: StoryChapter[] = [
  {
    id: 'edge',
    index: '01',
    heading: 'THE WORLD ON THE EDGE',
    body: 'The demon Raktabīja could not be defeated by force. Every drop of his blood that touched the ground rose again as a copy of himself — an army that multiplied with every wound the gods managed to land.',
  },
  {
    id: 'fury',
    index: '02',
    heading: "DURGA'S FURY",
    body: 'Durga fought on, but a stalemate is its own kind of defeat. In the widely told Devī Māhātmya account, her rage at the impossibility of the battle grew until it could no longer stay contained within her.',
    tradition: 'Devī Māhātmya tradition',
  },
  {
    id: 'birth',
    index: '03',
    heading: 'THE BIRTH OF KALI',
    body: 'From her brow — some tellings say her forehead, others her fury itself — sprang Kali: dark as the space between stars, tongue lolling, sword already raised.',
  },
  {
    id: 'end',
    index: '04',
    heading: 'WHAT MUST END',
    body: "Kali drank Raktabīja's blood before it touched the earth, ending his multiplication and the battle in the same motion. Regional tellings vary in their details, but agree on the shape of the ending: what force alone could not defeat was undone at its root.",
  },
  {
    id: 'dance',
    index: '05',
    heading: 'THE DANCE THAT WOULD NOT STOP',
    body: 'Her fury unspent, Kali danced on across the field. Devotional tradition holds that the momentum of that dance threatened to unmake creation along with the demons.',
  },
  {
    id: 'stillness',
    index: '06',
    heading: "SHIVA'S STILLNESS",
    body: 'Shiva lay down in her path. In the best-known devotional image — the one now inseparable from her iconography — she steps upon him, startles, and the dance quiets. Balance returns.',
    tradition: 'Shakta devotional tradition',
  },
  {
    id: 'remains',
    index: '07',
    heading: 'THE MOTHER REMAINS',
    body: 'Beyond the battle, she is remembered less for the ending she brought than for what came after: reverence at Dakshineswar, Kalighat, Kamakhya and Tarapith, and in millions of homes on the night of Kali Pūjā.',
  },
]
