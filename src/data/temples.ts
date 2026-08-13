import { images, type ImageAsset } from './images'

export interface SacredPlace {
  id: string
  name: string
  location: string
  description: string
  image: ImageAsset
}

export const kaliTemples: SacredPlace[] = [
  {
    id: 'dakshineswar',
    name: 'DAKSHINESWAR',
    location: 'Dakshineswar, West Bengal — on the eastern bank of the Hooghly River',
    description:
      'Built in 1855 by Rani Rashmoni, this nine-spired temple became the spiritual home of the 19th-century mystic Ramakrishna Paramahamsa, whose devotion to Kali as the Universal Mother shaped how millions understand her worship today.',
    image: images.temples.dakshineswar,
  },
  {
    id: 'kalighat',
    name: 'KALIGHAT',
    location: 'Kolkata, West Bengal',
    description:
      'One of the fifty-one Shakti Peethas — sites where, according to tradition, a part of the goddess Sati’s body fell to earth. At Kalighat, it is said to be her right toe. The temple has stood at the heart of Kolkata’s spiritual life for centuries.',
    image: images.temples.kalighat,
  },
  {
    id: 'kamakhya',
    name: 'KAMAKHYA',
    location: 'Nilachal Hill, Guwahati, Assam',
    description:
      'One of the most significant Shakti Peethas, associated with the yoni of the Goddess. It hosts the Ambubachi Mela, honoring her generative power — a reminder that the same Shakti who destroys also creates.',
    image: images.temples.kamakhya,
  },
  {
    id: 'tarapith',
    name: 'TARAPITH',
    location: 'Birbhum district, West Bengal',
    description:
      'Dedicated to Tara, one of the ten Mahavidyas closely linked with Kali. Set beside a cremation ground, Tarapith is associated with the tantric saint Bamakhepa, who treated the boundary between life and death as sacred ground rather than something to fear.',
    image: images.temples.tarapith,
  },
]
