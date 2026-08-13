/**
 * Every image reference in the experience lives here — nowhere else.
 *
 * Sourcing: classical public-domain paintings (Raja Ravi Varma, c. 1890s—1900s)
 * and freely-licensed temple photography, served directly from Wikimedia
 * Commons via `Special:FilePath` (a stable redirect to the current file,
 * no hash-path guessing required). This keeps the deity's visual
 * representation dignified, painterly and historically grounded rather
 * than generic stock photography or AI-generated imagery.
 *
 * `credit.source` always points at the original Commons file page so
 * attribution stays intact — see <CreditsFooter> for where it surfaces.
 */

const COMMONS_FILE = 'https://commons.wikimedia.org/wiki/Special:FilePath'
const COMMONS_PAGE = 'https://commons.wikimedia.org/wiki/File:'

function wiki(file: string, width = 1800) {
  return `${COMMONS_FILE}/${encodeURIComponent(file)}?width=${width}`
}

export interface ImageAsset {
  /** Resolved, hotlinkable image URL. */
  src: string
  /** Descriptive alt text — always written, never decorative-empty by default. */
  alt: string
  /** CSS object-position, art-directing which part of the frame stays in view when cropped. */
  position: string
  credit: {
    title: string
    author: string
    license: string
    source: string
  }
}

function asset(
  file: string,
  alt: string,
  position: string,
  credit: ImageAsset['credit'],
  width?: number,
): ImageAsset {
  return { src: wiki(file, width), alt, position, credit: { ...credit, source: `${COMMONS_PAGE}${encodeURIComponent(file)}` } }
}

export const images = {
  kali: {
    /** The primary revelation portrait — used for the eyes / reveal / hero sequence. */
    primary: asset(
      'Kali_by_Raja_Ravi_Varma.jpg',
      'A classical painted portrait of Maa Kali, dark-complexioned, many-armed, garlanded, standing in cosmic darkness.',
      '50% 22%',
      {
        title: 'Kali',
        author: 'Raja Ravi Varma (c. 1900)',
        license: 'Public domain',
        source: '',
      },
      2000,
    ),
    /** Alternate portrait — used for the dance / form / mother sequences for visual variety. */
    secondary: asset(
      'Raja_Ravi_Varma_-_Kali.jpg',
      'A painted study of Maa Kali in a dark cosmic setting, adorned with a garland and crescent moon.',
      '50% 18%',
      { title: 'Kali (study)', author: 'Raja Ravi Varma', license: 'Public domain', source: '' },
      2000,
    ),
    /** A calmer register — Kali seated, Kangra miniature style. Used for the warm "Mother" mood. */
    seated: asset(
      'Kali_Sitting_on_Shiva,_18th_Century,_Kangra.jpg',
      'An 18th-century Kangra miniature painting of Kali seated in calm repose, holding a sword, scissors, a skull-cup and a mirror.',
      '48% 30%',
      {
        title: 'Kali Sitting on Shiva (18th century, Kangra)',
        author: 'Museum of Kangra Art, Dharamshala — photo: Brahmavadini',
        license: 'CC BY-SA 4.0',
        source: '',
      },
      2200,
    ),
  },

  goddesses: {
    durga: asset(
      'Durga_by_Raja_Ravi_Varma.jpg',
      'Goddess Durga depicted in classical Indian painting, seated in radiant composure.',
      '50% 20%',
      { title: 'Durga', author: 'Raja Ravi Varma', license: 'Public domain', source: '' },
    ),
    parvati: asset(
      'An_Oleograph_of_Shiva,_Parvati_and_Nandi_by_Raja_Ravi_Varma.jpg',
      'Parvati depicted alongside Shiva and Nandi in a classical Indian oleograph.',
      '62% 25%',
      {
        title: 'Shiva, Parvati and Nandi',
        author: 'Raja Ravi Varma',
        license: 'Public domain',
        source: '',
      },
    ),
    lakshmi: asset(
      'Raja_Ravi_Varma,_Goddess_Lakshmi,_1896.jpg',
      'Goddess Lakshmi seated on a lotus, painted in classical Indian style, 1896.',
      '50% 15%',
      { title: 'Goddess Lakshmi (1896)', author: 'Raja Ravi Varma', license: 'Public domain', source: '' },
    ),
    saraswati: asset(
      'Saraswati_by_Raja_Ravi_Varma.jpg',
      'Goddess Saraswati with a veena, painted in classical Indian style.',
      '50% 18%',
      { title: 'Saraswati', author: 'Raja Ravi Varma', license: 'Public domain', source: '' },
    ),
  },

  temples: {
    dakshineswar: asset(
      'Dakshineswar_Ma_Kali_Temple.JPG',
      'The nine-spired Dakshineswar Kali Temple on the eastern bank of the Hooghly River, West Bengal.',
      '50% 55%',
      { title: 'Dakshineswar Kali Temple', author: 'Sarkar 1234', license: 'CC BY-SA 3.0', source: '' },
    ),
    kalighat: asset(
      'Kalighat_temple_with_bazzar.JPG',
      'Kalighat Kali Temple in Kolkata, one of the most revered Shakti Peethas.',
      '50% 45%',
      { title: 'Kalighat Kali Temple', author: 'Balajijagadesh', license: 'CC BY-SA 3.0', source: '' },
    ),
    kamakhya: asset(
      'Kamakhya_Temple,_Guwahati.jpg',
      'Kamakhya Temple atop Nilachal Hill, Guwahati, Assam — a major Shakti Peetha.',
      '50% 50%',
      { title: 'Kamakhya Temple, Guwahati', author: 'Wikimedia Commons contributor', license: 'CC BY-SA', source: '' },
    ),
    tarapith: asset(
      'Tarapith_Tarama_Temple.jpg',
      'Tarapith Temple in Birbhum district, West Bengal, dedicated to Tara, a form of the Divine Mother.',
      '50% 50%',
      { title: 'Tarapith Tarama Temple', author: 'Wikimedia Commons contributor', license: 'CC BY-SA', source: '' },
    ),
  },
} as const

export type ImageKey = keyof typeof images
