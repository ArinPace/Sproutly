import type { PartId } from '../three/parts'

export type PartDetail = {
  /** Headline numbers: value, unit, label. */
  stats: [string, string, string][]
  how: string[]
  why: string
  specs: [string, string][]
}

export const PART_DETAILS: Record<PartId, PartDetail> = {
  lid: {
    stats: [
      ['12', 'zones', 'Capacitive touch controls'],
      ['120k', 'lux', 'Light sensor range'],
      ['±0.2', '°C', 'Room temperature accuracy'],
    ],
    how: [
      'The crown is turned from a single block of FSC walnut and finished with hard-wax oil. Set into the top is a Ø 153 mm smoked-glass touch panel with 12 capacitive zones: play/pause, volume ring, skip, alarm, mood, and a quick "water now" override.',
      'Underneath the glass sits the ambient light sensor that the AI relies on most. It reads everything from candlelight to direct sun (0.01 to 120,000 lux), so Sproutly knows how much natural light the plant has already had today. A combined temperature and humidity sensor sits beside it.',
    ],
    why: 'Everything you touch day to day lives here, so you never need your phone for the basics. And because the light sensor faces the room, it can tell the difference between "the room is dim" and "the plant is in shadow".',
    specs: [
      ['Material', 'Solid FSC walnut, hard-wax oil'],
      ['Touch panel', 'Ø 153 mm smoked glass, 12 zones'],
      ['Ambient light', '0.01 – 120,000 lux'],
      ['Temp / humidity', '±0.2 °C, ±2 % RH'],
      ['Height', '42 mm'],
    ],
  },
  electronics: {
    stats: [
      ['6', 'sensors', 'Read every 60 seconds'],
      ['2 TOPS', '', 'On-device AI processor'],
      ['0', 'cloud', 'Needed to keep the plant alive'],
    ],
    how: [
      'The core board is the brain. A dual-core application processor with a small neural accelerator runs Sproutly\'s plant model locally, reading all six sensors once a minute and deciding what the light and pump should do next.',
      'It also drives the 105-LED grow array and the 48-LED halo ring, handles audio, and talks to the app over Wi-Fi 6 and Bluetooth 5.3. Firmware and plant profiles update over the air.',
    ],
    why: 'Keeping the AI on the device means Sproutly keeps caring for the plant even if your Wi-Fi drops, and your sensor data never has to leave your room.',
    specs: [
      ['Processor', 'Dual-core 1.2 GHz + 2 TOPS NPU'],
      ['Memory', '2 GB RAM, 16 GB storage'],
      ['Wireless', 'Wi-Fi 6, Bluetooth 5.3'],
      ['Sensor polling', 'Every 60 s'],
      ['Updates', 'Over-the-air firmware + plant profiles'],
    ],
  },
  ring: {
    stats: [
      ['16.7M', 'colours', 'Full RGBW mixing'],
      ['450', 'lm', 'Peak mood brightness'],
      ['1', '%', 'Lowest dim level'],
    ],
    how: [
      'A thin strip of 48 RGBW LEDs runs around a solid walnut core, behind an opal diffuser so you see a soft line of light rather than dots. It\'s tuned for people, not plants: warm 1800 K for evenings up to crisp 6500 K, plus any colour you like.',
      'It runs the five preset moods (Hearth, Canopy, Tide, Ember, Dusk), a 30-minute sunrise alarm, and a sleep fade. It dims all the way down to 1 % so it works as a night light.',
    ],
    why: 'Mood lighting and grow lighting have opposite jobs. Keeping them separate means the room can be dim and cosy while the plant still gets the light it needs.',
    specs: [
      ['LEDs', '48 RGBW, opal diffuser'],
      ['Brightness', 'Up to 450 lm'],
      ['White range', '1800 – 6500 K'],
      ['Dimming', '1 – 100 %, flicker-free'],
      ['Modes', '5 moods, sunrise alarm, sleep fade'],
    ],
  },
  grow: {
    stats: [
      ['15,000', 'lm', 'Peak grow light output'],
      ['600', 'µmol/m²/s', 'Peak PPFD at the leaves'],
      ['105', 'LEDs', 'Full spectrum array'],
    ],
    how: [
      'Plants need far more light than people do. A bright office is about 500 lux; a plant growing well wants the equivalent of tens of thousands. So the underside of the walnut band holds a dedicated 105-LED full-spectrum panel that peaks at 15,000 lumens, aimed straight down into the chamber.',
      'The spectrum is 5000 K white with extra 450 nm royal blue for compact leaves and 660 nm deep red for photosynthesis and flowering. The AI almost never runs it at full power. It works out how much light the plant still needs today and adds only that, ramping up and down like a real sunrise.',
    ],
    why: 'Most indoor plants die slowly from too little light, not too little water. This panel means your plant gets a full day of light even on a desk far from any window.',
    specs: [
      ['Output', 'Up to 15,000 lm'],
      ['PPFD', 'Up to 600 µmol/m²/s at canopy'],
      ['Spectrum', '5000 K white + 450 nm blue + 660 nm red'],
      ['CRI', '95+'],
      ['Daily light target', '12 – 17 mol/m²/day (set per plant)'],
      ['Schedule', 'AI-controlled, follows your sleep window'],
    ],
  },
  glass: {
    stats: [
      ['190', 'mm', 'Chamber height'],
      ['3', 'mm', 'Borosilicate wall'],
      ['70–85', '% RH', 'Humidity held inside'],
    ],
    how: [
      'The chamber is a single 190 mm tube of 3.3 borosilicate glass with a 3 mm wall, the same kind of glass used in lab equipment. It\'s optically clear and won\'t yellow or cloud under the grow light.',
      'Sealed between the walnut tub and the grow band, it traps the moisture the plant breathes out. That creates a stable little micro-climate at 70 to 85 % humidity, which tropical houseplants love and dorm rooms rarely have.',
    ],
    why: 'Higher humidity means the plant loses less water through its leaves, so it needs less watering and stays greener. The glass also keeps dust, pets and curious fingers out.',
    specs: [
      ['Glass', '3.3 borosilicate, 3 mm wall'],
      ['Size', 'Ø 188 × 190 mm'],
      ['Volume', '5.2 L'],
      ['Humidity', 'Holds 70 – 85 % RH'],
      ['Care', 'Lifts off for cleaning, dishwasher safe'],
    ],
  },
  plant: {
    stats: [
      ['4', 'species', 'Starter plants to choose from'],
      ['180', 'mm', 'Max height in the chamber'],
      ['0', 'minutes', 'Of care per week'],
    ],
    how: [
      'Each Sproutly ships with a living starter plant chosen to love the chamber: fittonia, peperomia, pothos or a miniature calathea. Each has its own plant profile that tells the AI its ideal light, moisture and pH.',
      'When you want something new, swap in a seed pod or any small plant and pick its profile in the app. Sproutly re-tunes itself to the new plant over its first two weeks.',
    ],
    why: 'Picking plants that suit the space is half of keeping them alive. The profile is the other half, so Sproutly never treats a fern like a succulent.',
    specs: [
      ['Starter options', 'Fittonia, peperomia, pothos, mini calathea'],
      ['Max height', '180 mm'],
      ['Profiles', '40+ plants in the app'],
      ['Refills', 'Seed pods, sold separately'],
    ],
  },
  deck: {
    stats: [
      ['1.1', 'L', 'Living soil'],
      ['±2', '%', 'Soil moisture accuracy'],
      ['±0.1', 'pH', 'pH accuracy'],
    ],
    how: [
      'The soil sits in a walnut tub that the glass rests on. Inside is 1.1 L of coco-coir and perlite (70/30) over a layer of clay pebbles that keeps the roots from sitting in water.',
      'Two probes reach into the root zone. A capacitive soil-moisture sensor reads how wet the roots really are, not just the surface, and a pH probe watches for the slow drift that tells you the soil needs refreshing. A small LED on the front of the tub glows green when everything is in range.',
    ],
    why: 'Watering by schedule is how most plants drown. Measuring at the roots lets Sproutly water only when the plant actually needs it.',
    specs: [
      ['Soil', '1.1 L coco-coir + perlite (70/30)'],
      ['Drainage', '10 mm clay pebble layer'],
      ['Moisture sensor', 'Capacitive, ±2 %'],
      ['pH sensor', 'Range 4 – 9, ±0.1 pH'],
      ['Status', 'Front LED: green / amber / red'],
    ],
  },
  reservoir: {
    stats: [
      ['1.2', 'L', 'Hidden water tank'],
      ['6', 'weeks', 'Between refills'],
      ['5', 'ml', 'Smallest watering dose'],
    ],
    how: [
      'A 1.2 L tank is hidden inside the base. When the AI decides the plant needs water, a near-silent 28 dB micro-pump pushes it up to a drip ring in the roots in 5 ml steps, then waits and re-measures before adding more.',
      'A water-level sensor tracks the tank to ±3 mm. You get a gentle alert on the screen and in the app when it drops to 15 %, which is usually about a week of water left.',
    ],
    why: 'Tiny, measured doses mean the soil never swings from bone-dry to soaked. And six weeks between refills means you can go home for the holidays and come back to a happy plant.',
    specs: [
      ['Capacity', '1.2 L'],
      ['Between refills', 'Up to 6 weeks'],
      ['Pump', 'Micro-diaphragm, 28 dB'],
      ['Dose size', '5 ml steps'],
      ['Level sensor', '±3 mm, low alert at 15 %'],
    ],
  },
  base: {
    stats: [
      ['10', 'W', '360° full-range speaker'],
      ['85', 'dB', 'Max volume'],
      ['2.9', 'in', 'Curved wrap display'],
    ],
    how: [
      'The base is perforated walnut wrapped around a 10 W full-range driver and a passive radiator, firing in all directions so the room sounds the same wherever you sit. It handles 60 Hz to 20 kHz: rain, lo-fi, podcasts or your own playlists over Bluetooth.',
      'Set into the wood is a 2.9-inch curved display that disappears when it\'s off. It shows the time, date, room temperature, your next alarm and live plant vitals: soil moisture, pH, light and water level.',
    ],
    why: 'It replaces the speaker, alarm clock and plant app you would otherwise need, so your desk ends up with one beautiful object instead of four.',
    specs: [
      ['Driver', '10 W full-range + passive radiator'],
      ['Frequency', '60 Hz – 20 kHz'],
      ['Max volume', '85 dB @ 1 m'],
      ['Display', '2.9 in curved, hidden-until-lit'],
      ['Shows', 'Time, date, temp, alarm, plant vitals'],
    ],
  },
}
