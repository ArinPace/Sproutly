import { useState, type FormEvent } from 'react'
import LightRingButton from '../components/LightRingButton'
import { useReveal } from '../lib/hooks'
import styles from './Kickstarter.module.css'

const TIERS = [
  {
    name: 'Seedling',
    price: 25,
    note: 'Support the project',
    perks: ['Name on the backer wall', 'Sproutly sticker pack', 'Behind-the-scenes updates'],
  },
  {
    name: 'Early Bird',
    price: 149,
    note: 'Limited · 200 left',
    perks: ['One Sproutly unit', 'Starter plant pod + soil', 'Hearth & Canopy mood packs', 'Ships first'],
    featured: true,
  },
  {
    name: 'Sproutly',
    price: 189,
    note: 'Most backed',
    perks: ['One Sproutly unit', 'Starter plant pod + soil', 'All 5 mood packs'],
  },
  {
    name: 'Roommates',
    price: 349,
    note: 'Two units, two rooms',
    perks: ['Two Sproutly units', 'Two plant pods + soil', 'Linked moods across both', 'Save $29'],
  },
]

const FAQ = [
  [
    'When will Sproutly ship?',
    'We are targeting spring 2027 for early backers. Monthly updates go out to everyone on the list. [placeholder]',
  ],
  [
    'Do I need to water it at all?',
    'Only the reservoir: about every six weeks, depending on the plant and your room. The moisture and water-level sensors tell you (and the screen shows it) well before it runs low.',
  ],
  [
    'What plants work in it?',
    'Low-light, compact plants do best: pothos, fittonia, peperomia, small ferns and flowering pods. Each unit ships with a hand-picked starter pod.',
  ],
  [
    'Does it need the app?',
    'No. The walnut top is a full touch control panel for the light, sound, alarm and plant care. The app adds schedules, playlists and plant history.',
  ],
  [
    'Is the glass safe?',
    'The chamber is borosilicate glass, the same material used for lab and cookware. It is thick, heat-resistant and much tougher than standard glass.',
  ],
  ['Do you ship internationally?', 'Yes, to most countries. Shipping is calculated after the campaign. [placeholder]'],
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <ul className={styles.faq}>
      {FAQ.map(([q, a], i) => (
        <li key={q} data-open={open === i || undefined} data-reveal style={{ ['--d' as string]: i }}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{q}</span>
            <i aria-hidden />
          </button>
          <div className={styles.answer}>
            <p>{a}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Signup() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (email.includes('@')) setDone(true)
  }
  return (
    <div className={styles.signup} data-done={done || undefined} data-reveal>
      <div className={styles.signupRing} aria-hidden />
      <span className="eyebrow">Stay in the loop</span>
      <h2 className="display-m">
        Get first dibs
        <br />
        on the next batch.
      </h2>
      {done ? (
        <div className={styles.success} role="status">
          <span className={styles.check} aria-hidden />
          <p>
            You're on the list. We'll write to <b>{email}</b> when the next batch opens.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className={styles.form}>
          <input
            type="email"
            required
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
          />
          <LightRingButton type="submit">Notify me</LightRingButton>
        </form>
      )}
      <small className="mono">No spam. One email per milestone.</small>
    </div>
  )
}

export default function Kickstarter() {
  useReveal()
  const raised = 15240
  const goal = 10000
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow" data-reveal>
            Live on Kickstarter
          </span>
          <h1 className="display-xl" data-reveal style={{ ['--d' as string]: 1 }}>
            Back the
            <br />
            <span className="glow-text">calm.</span>
          </h1>
          <div className={styles.funding} data-reveal style={{ ['--d' as string]: 2 }}>
            <div className={styles.stat}>
              <strong>${raised.toLocaleString()}</strong>
              <span className="mono">pledged of ${goal.toLocaleString()} goal</span>
            </div>
            <div className={styles.stat}>
              <strong>[212]</strong>
              <span className="mono">backers</span>
            </div>
            <div className={styles.stat}>
              <strong>[18]</strong>
              <span className="mono">days to go</span>
            </div>
          </div>
          <div className={styles.bar} data-reveal style={{ ['--d' as string]: 3 }}>
            <i style={{ width: `${Math.min(100, (raised / 25000) * 100)}%` }} />
            <span className={styles.goalMark} style={{ left: `${(goal / 25000) * 100}%` }}>
              <em className="mono">Funded ✓</em>
            </span>
            <span className={styles.stretch}>
              <em className="mono">Stretch: $25k · walnut + oak finish</em>
            </span>
          </div>
        </div>
      </section>

      <section className={`section ${styles.tiersSection}`}>
        <div className="container">
          <span className="eyebrow" data-reveal>
            Rewards
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            Pick your pledge.
          </h2>
          <div className={styles.tiers}>
            {TIERS.map((t, i) => (
              <article
                key={t.name}
                className={styles.tier}
                data-featured={t.featured || undefined}
                data-reveal
                style={{ ['--d' as string]: i }}
              >
                <header>
                  <span className="mono">{t.note}</span>
                  <h3>{t.name}</h3>
                  <div className={styles.price}>
                    <sup>$</sup>
                    {t.price}
                  </div>
                </header>
                <ul>
                  {t.perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <LightRingButton href="https://www.kickstarter.com" variant={t.featured ? 'solid' : 'ghost'}>
                  Pledge ${t.price}
                </LightRingButton>
              </article>
            ))}
          </div>
          <p className={styles.note}>*Prices and rewards are placeholders.</p>
        </div>
      </section>

      <hr className="divider" />

      <section className={`section ${styles.faqSection}`}>
        <div className={`container ${styles.faqGrid}`}>
          <div>
            <span className="eyebrow" data-reveal>
              FAQ
            </span>
            <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
              Good
              <br />
              questions.
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      <section className={styles.signupSection}>
        <div className="container">
          <Signup />
        </div>
      </section>
    </>
  )
}
