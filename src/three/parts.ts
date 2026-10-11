/**
 * Shared geometry + explode config. All values are in model units with the
 * base sitting on y = 0 and a radius of ~1. `blender/build_sproutly.py`
 * mirrors these numbers, so keep the two in sync.
 */
export const DIMS = {
  base: { y0: 0, y1: 0.92, r: 1 },
  screen: { y: 0.55, h: 0.27, arc: 1.3 },
  reservoir: { y0: 0.12, y1: 0.58, r: 0.72 },
  deck: { y0: 0.92, y1: 1.2, r: 0.97, soilR: 0.88, floorH: 0.03, drainH: 0.05, soilH: 0.17 },
  glass: { y0: 1.2, y1: 3.1, r: 0.94 },
  plant: { y0: 1.19, bloom: 2.5 },
  grow: { y0: 3.1, y1: 3.23, r: 1, lightR: 0.8 },
  ring: { y0: 3.23, y1: 3.32, r: 0.985 },
  electronics: { y0: 3.36, y1: 3.42, r: 0.86 },
  lid: { y0: 3.32, y1: 3.74, r: 1 },
} as const

export const MODEL_CENTER = 1.87

export type PartId = 'lid' | 'electronics' | 'ring' | 'grow' | 'glass' | 'plant' | 'deck' | 'reservoir' | 'base'

export type PartDef = {
  id: PartId
  index: string
  name: string
  caption: string
  description: string
  specs: [string, string][]
  /** Vertical travel when fully exploded. */
  offset: number
  /** Extra spin (radians) when fully exploded. */
  rot: number
  /** Assembled height of the annotation anchor. */
  labelY: number
  side: 1 | -1
}

export const PARTS: PartDef[] = [
  {
    id: 'lid',
    index: '01',
    name: 'Walnut crown',
    caption: 'Touch + light sensor',
    description:
      'A solid walnut crown with a smoked-glass touch surface. An ambient light sensor under the glass reads your room so the halo and grow light adjust on their own.',
    specs: [
      ['Material', 'FSC walnut, oil finish'],
      ['Controls', 'Capacitive touch surface'],
      ['Sensor', 'Ambient light sensor'],
    ],
    offset: 2.0,
    rot: 0.4,
    labelY: 3.62,
    side: 1,
  },
  {
    id: 'electronics',
    index: '02',
    name: 'Core board',
    caption: 'Brains, quietly',
    description:
      'The control board reads every sensor, runs the light engine and audio, and talks to the Sproutly app over Wi-Fi and Bluetooth.',
    specs: [
      ['Connectivity', 'Wi-Fi 6, Bluetooth 5.3'],
      ['Sensors read', 'Light, moisture, pH, water level'],
      ['Updates', 'Over-the-air'],
    ],
    offset: 1.45,
    rot: -0.35,
    labelY: 3.47,
    side: -1,
  },
  {
    id: 'ring',
    index: '03',
    name: 'Halo light ring',
    caption: '16M colours, mood only',
    description:
      'A thin strip of light wrapped around a walnut core that sets the mood for the room: warm for evenings, green for focus, blue to wind down.',
    specs: [
      ['LEDs', '48 RGBW'],
      ['Brightness', 'Up to 450 lm'],
      ['Modes', 'Mood, focus, sunrise, sleep'],
    ],
    offset: 1.0,
    rot: 0,
    labelY: 3.35,
    side: 1,
  },
  {
    id: 'grow',
    index: '04',
    name: 'Grow light',
    caption: 'Full spectrum, plant-strength',
    description:
      'A walnut band under the halo holds a full-spectrum LED panel that shines straight down on the plant. Plants need far more light than people do to make energy, so this runs on its own day cycle, separate from the mood light.',
    specs: [
      ['Output', 'Up to 15,000 lm'],
      ['PPFD', 'Up to 600 µmol/m²/s'],
      ['Schedule', 'Auto 14 h day cycle, follows the light sensor'],
    ],
    offset: 0.6,
    rot: -0.15,
    labelY: 3.23,
    side: -1,
  },
  {
    id: 'glass',
    index: '05',
    name: 'Borosilicate chamber',
    caption: 'A sealed micro-climate',
    description:
      'A tall, clear borosilicate chamber that holds humidity in, so the plant lives in its own stable little climate.',
    specs: [
      ['Glass', '3 mm borosilicate'],
      ['Climate', 'Passive humidity loop'],
      ['Clarity', 'Optical clear, UV stable'],
    ],
    offset: 0.3,
    rot: 0,
    labelY: 2.85,
    side: 1,
  },
  {
    id: 'plant',
    index: '06',
    name: 'The living part',
    caption: 'Hand-picked, low-light',
    description:
      'Each Sproutly ships with a hardy, low-light plant chosen to thrive in the chamber. Swap it whenever you like.',
    specs: [
      ['Plant', 'Fittonia, peperomia, pothos or calathea'],
      ['Care', 'None. Really.'],
      ['Refills', 'Seed pods available'],
    ],
    offset: 0.05,
    rot: 0.2,
    labelY: 2.5,
    side: -1,
  },
  {
    id: 'deck',
    index: '07',
    name: 'Living soil bed',
    caption: 'Moisture + pH sensing',
    description:
      'A walnut tub holding a deep bed of real potting soil over a clay-pebble drainage layer. Soil-moisture and pH probes sit in the roots and tell Sproutly exactly when, and how much, to water.',
    specs: [
      ['Soil', 'Coco-coir + perlite, clay drainage'],
      ['Sensors', 'Soil moisture, pH'],
      ['Status', 'Single LED indicator'],
    ],
    offset: -0.35,
    rot: 0.15,
    labelY: 1.1,
    side: 1,
  },
  {
    id: 'reservoir',
    index: '08',
    name: 'Self-watering reservoir',
    caption: 'Water-level sensing',
    description:
      'A hidden reservoir and silent micro-pump wick water up to the roots only when the soil needs it. A water-level sensor warns you long before it runs dry.',
    specs: [
      ['Capacity', '1.2 L'],
      ['Between refills', 'Up to 6 weeks'],
      ['Sensor', 'Water level, low-water alert'],
    ],
    offset: -0.9,
    rot: 0.3,
    labelY: 0.4,
    side: 1,
  },
  {
    id: 'base',
    index: '09',
    name: 'Acoustic base + display',
    caption: '360° speaker, wrap screen',
    description:
      'A perforated walnut base hides a 360° speaker, with a curved screen set into the wood. It shows time, date, temperature, alarms and live plant stats.',
    specs: [
      ['Driver', '10 W full range, 360°'],
      ['Display', 'Curved, hidden-until-lit'],
      ['Shows', 'Time, date, temp, alarm, plant stats'],
    ],
    offset: -1.9,
    rot: -0.2,
    labelY: 0.3,
    side: -1,
  },
]

export const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p])) as Record<PartId, PartDef>

export const PART_IDS = PARTS.map((p) => p.id)
