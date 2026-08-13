import { images, type ImageAsset } from './images'

export interface Goddess {
  id: string
  name: string
  sanskrit: string
  epithet: string
  description: string
  /** Concept entries (Shakti) render a mandala motif instead of a portrait. */
  image: ImageAsset | null
}

export const goddesses: Goddess[] = [
  {
    id: 'kali',
    name: 'KALI',
    sanskrit: 'काली',
    epithet: 'The Power Beyond Time',
    description:
      'The dark, transformative face of the Goddess — destroyer of ignorance, protector of her devotees, and the anchor of this entire experience.',
    image: images.kali.primary,
  },
  {
    id: 'durga',
    name: 'DURGA',
    sanskrit: 'दुर्गा',
    epithet: 'The Invincible',
    description:
      'Formed, in the Devī Māhātmya tradition, from the combined energy of the gods to defeat the shape-shifting demon Mahishasura. Worshipped as the fierce, protective mother during Navratri and Durga Puja.',
    image: images.goddesses.durga,
  },
  {
    id: 'parvati',
    name: 'PARVATI',
    sanskrit: 'पार्वती',
    epithet: 'The Gentle Power',
    description:
      'Daughter of the mountains and consort of Shiva, representing devotion, patience and the union of stillness with strength. In Shakta tradition, her fiercer emanations include Durga and Kali.',
    image: images.goddesses.parvati,
  },
  {
    id: 'lakshmi',
    name: 'LAKSHMI',
    sanskrit: 'लक्ष्मी',
    epithet: 'The Radiant One',
    description:
      'Goddess of prosperity, fortune and beauty, seated on a lotus. Her arrival is honored every autumn at Diwali, when homes are lit to welcome her in.',
    image: images.goddesses.lakshmi,
  },
  {
    id: 'saraswati',
    name: 'SARASWATI',
    sanskrit: 'सरस्वती',
    epithet: 'The Keeper of Knowledge',
    description:
      'Goddess of wisdom, music and the arts, often shown with a veena and a swan. Students and artists invoke her before beginning new work.',
    image: images.goddesses.saraswati,
  },
  {
    id: 'shakti',
    name: 'SHAKTI',
    sanskrit: 'शक्ति',
    epithet: 'The Force Itself',
    description:
      'Not one goddess but the current running through all of them. Shaktism holds Shakti as the active, creative power of the universe — of which Durga, Parvati, Lakshmi, Saraswati and Kali are each a face.',
    image: null,
  },
]
