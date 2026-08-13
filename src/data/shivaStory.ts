import type { StoryChapter } from './stories'

/**
 * The read-not-scroll-jacked telling that follows the cinematic — everything
 * the journey showed (the mountain, the water, the third eye, the lingam,
 * the storm, the stillness) has a story behind it, and the experience
 * itself never stops to explain any of it. This is where that happens.
 * Accounts of Shiva vary widely by region, lineage and text — several
 * traditions are named explicitly rather than flattened into one telling,
 * matching how kaliOrigin (data/stories.ts) already handles this.
 */
export const shivaOrigin: StoryChapter[] = [
  {
    id: 'ascetic',
    index: '01',
    heading: 'THE ASCETIC ON THE MOUNTAIN',
    body: 'Long before he is a figure in a story, Shiva is a stillness on Kailash — meditating across spans of time the other gods do not have words for. Devotional tradition holds that the mountain and the ascetic seated on it stop being two separate things to describe.',
  },
  {
    id: 'ganga',
    index: '02',
    heading: 'GANGA IN HIS HAIR',
    body: "The river Ganga was to descend from the heavens to the earth — but her full force would have shattered the ground she fell on. In the Puranic account, Shiva let her fall into his matted hair first, breaking the weight of her descent into a hundred quieter streams before she ever touched the world.",
    tradition: 'Puranic tradition',
  },
  {
    id: 'neelkanth',
    index: '03',
    heading: 'THE POISON HE DID NOT SWALLOW',
    body: 'When the gods and demons churned the cosmic ocean for its treasures, the first thing to rise was Halahala — a poison strong enough to end all creation. Shiva drank it, and stopped it in his throat rather than letting it pass further. The throat is said to have stayed blue ever after: Neelkanth, "the blue-throated one".',
    tradition: 'Samudra Manthan, Puranic tradition',
  },
  {
    id: 'thirdeye',
    index: '04',
    heading: 'THE THIRD EYE',
    body: "Between his brows sits an eye that is not for seeing the way the other two are. Some tellings describe it opening once, briefly, to reduce Kama — desire itself — to ash. It is closed through almost all of the stories about him for the same reason it stays closed through almost all of this one: what it looks at does not survive being looked at carelessly.",
  },
  {
    id: 'lingam',
    index: '05',
    heading: 'A FORM BEYOND FORM',
    body: 'In most temples, Shiva is not approached as a body at all. He is worshipped as a lingam — a shape with no face, no limbs, nothing to recognize as a person — precisely because what he represents is held to exceed any one shape. Several of the most revered lingams in India are described as swayambhu: not carved, but self-manifested, found already present in the rock.',
    tradition: 'Shaiva devotional tradition',
  },
  {
    id: 'raudra',
    index: '06',
    heading: 'RAUDRA',
    body: 'Raudra is not Shiva losing his composure — it is the storm that forms when composure is total. Thunderheads gather, wind strips the mountain bare, lightning finds the peak again and again, and at the center of all of it he does not move. The world grows loud. He does not.',
  },
  {
    id: 'stillness',
    index: '07',
    heading: 'THE STILLNESS AT THE CENTER',
    body: "He is also Nataraja, the lord of a dance vast enough to end and remake the universe on its own rhythm. The two images are not in tension: a wheel turns because its center does not. Every story told about him — the river, the poison, the storm, the dance — moves. He is what all of it moves around.",
  },
]
