import LightRingButton from '../components/LightRingButton'
import { useReveal } from '../lib/hooks'
import styles from './Story.module.css'

const VALUES = [
  ['Calm', 'Every light, sound and screen is designed to lower the temperature of a room, not compete for attention.'],
  ['Engineered', 'Sensors and software do the plant care, so the object can stay simple: walnut, glass, light.'],
  ['Alive', 'A real plant, growing. The point was never a gadget. It was a bit of life you can keep.'],
]

const TIMELINE = [
  { date: '2024 · Autumn', title: 'The dead basil', body: 'A dorm-room windowsill, three plants lost in one semester. The idea starts as a sketch.' },
  { date: '2025 · Spring', title: 'Prototype 01', body: 'A jam jar, an Arduino and a moisture probe. It kept a pothos alive through exam season.' },
  { date: '2025 · Autumn', title: 'Walnut + glass', body: 'The first real enclosure. We added the halo light, the speaker and the wrap screen.' },
  { date: '2026 · Summer', title: 'Kickstarter', body: 'Over $15,000 raised from people who also cannot keep plants alive.', live: true },
  { date: '2027 · Spring', title: 'First units ship', body: 'Estimated delivery to early backers. [placeholder]' },
]

const TEAM = [
  ['[Founder name]', 'Founder · Design + engineering'],
  ['[Name]', 'Hardware + sensors'],
  ['[Name]', 'Plant science'],
  ['[Name]', 'Software + app'],
]

export default function Story() {
  useReveal()
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.halo} aria-hidden />
        <div className="container">
          <span className="eyebrow" data-reveal>
            Our story
          </span>
          <h1 className="display-xl" data-reveal style={{ ['--d' as string]: 1 }}>
            We kept
            <br />
            killing <span className="glow-text">plants.</span>
          </h1>
          <p className="lede" data-reveal style={{ ['--d' as string]: 2 }}>
            So we built one that can't be killed by a busy week. Sproutly started in a student dorm and grew into an
            object that makes any room feel calmer.
          </p>
        </div>
      </section>

      <section className={`section ${styles.founder}`}>
        <div className={`container ${styles.founderGrid}`}>
          <div className={styles.portrait} data-reveal>
            <div className={styles.portraitRing} aria-hidden />
            <span className="mono">[ Founder photo ]</span>
          </div>
          <div className={styles.founderCopy}>
            <span className="eyebrow" data-reveal>
              From the founder
            </span>
            <blockquote data-reveal style={{ ['--d' as string]: 1 }}>
              “Every student I knew wanted plants in their room. Almost none of them could keep one alive past
              midterms.”
            </blockquote>
            <p data-reveal style={{ ['--d' as string]: 2 }}>
              [Placeholder founder story] I started Sproutly after watching the same thing happen every semester: a new
              plant on the desk, a few weeks of good intentions, then a brown stalk in the corner. The problem wasn't
              caring. It was time, light and remembering.
            </p>
            <p data-reveal style={{ ['--d' as string]: 3 }}>
              So I tried to take the upkeep out completely, and to make something beautiful enough that you would want
              it even without the plant. A light for the evening, a speaker for the rain sounds, a clock that doesn't
              glare at you at 3 am.
            </p>
            <span className={styles.sign} data-reveal style={{ ['--d' as string]: 4 }}>
              [Founder name], Founder
            </span>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <section className={`section ${styles.mission}`}>
        <div className="container">
          <span className="eyebrow" data-reveal>
            Mission
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            Make living things
            <br />
            <span className="glow-text">effortless</span> to live with.
          </h2>
          <div className={styles.values}>
            {VALUES.map(([title, body], i) => (
              <div key={title} className={styles.value} data-reveal style={{ ['--d' as string]: i }}>
                <span className="mono">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.timeline}`}>
        <div className="container">
          <span className="eyebrow" data-reveal>
            Timeline
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            From jam jar
            <br />
            to walnut.
          </h2>
          <ol className={styles.track}>
            {TIMELINE.map((t, i) => (
              <li key={t.title} data-reveal data-live={t.live || undefined} style={{ ['--d' as string]: i }}>
                <span className={styles.node} aria-hidden />
                <span className="mono">{t.date}</span>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <hr className="divider" />

      <section className={`section ${styles.team}`}>
        <div className="container">
          <span className="eyebrow" data-reveal>
            The team
          </span>
          <ul className={styles.teamGrid}>
            {TEAM.map(([name, role], i) => (
              <li key={i} data-reveal style={{ ['--d' as string]: i }}>
                <div className={styles.avatar} aria-hidden />
                <strong>{name}</strong>
                <small>{role}</small>
              </li>
            ))}
          </ul>
          <div className={styles.cta} data-reveal>
            <LightRingButton to="/kickstarter">Back the project</LightRingButton>
            <LightRingButton to="/product" variant="ghost">
              See how it works
            </LightRingButton>
          </div>
        </div>
      </section>
    </>
  )
}
