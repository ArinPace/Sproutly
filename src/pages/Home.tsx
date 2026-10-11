import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SceneCanvas from '../three/Scene'
import { createExplode } from '../three/useExplode'
import LightRingButton from '../components/LightRingButton'
import StatCounter from '../components/StatCounter'
import FeatureCard from '../components/FeatureCard'
import Marquee from '../components/Marquee'
import AiSection from '../components/AiSection'
import { MOODS, prefersReducedMotion, setRingColor, useRingColor } from '../lib/store'
import { useNow, useReveal } from '../lib/hooks'
import styles from './Home.module.css'

/** Scroll progress through the hero -> explode amount. */
function explodeCurve(p: number) {
  if (p < 0.1) return 0
  if (p < 0.44) return (p - 0.1) / 0.34
  if (p < 0.76) return 1
  if (p < 0.94) return 1 - (p - 0.76) / 0.18
  return 0
}

const stageOf = (p: number) => (p < 0.12 ? 0 : p < 0.3 ? 1 : p < 0.85 ? 2 : 3)

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const reduced = useMemo(prefersReducedMotion, [])
  const navigate = useNavigate()
  const state = useMemo(
    () =>
      createExplode(reduced ? 1 : 0, {
        autoSpin: !reduced,
        frame: reduced ? 0 : 1,
        interactive: true,
        onSelect: (id) => navigate(`/product?part=${id}`),
      }),
    [reduced, navigate],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.dataset.stage = '2'
      return
    }
    el.dataset.stage = '0'
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress
        const e = explodeCurve(p)
        state.target = e
        const n = stageOf(p)
        state.frame = n === 0 || n === 3 ? 1 : 0
        const stage = String(n)
        if (el.dataset.stage !== stage) el.dataset.stage = stage
        el.style.setProperty('--p', p.toFixed(4))
        if (pctRef.current) pctRef.current.textContent = String(Math.round(e * 100)).padStart(3, '0')
      },
    })
    return () => st.kill()
  }, [state, reduced])

  return (
    <section ref={ref} className={styles.hero} data-reduced={reduced || undefined}>
      <div className={styles.sticky}>
        <SceneCanvas state={state} mode="hero" className={styles.canvas} />

        <div className={styles.overlay}>
          <div className={`${styles.stage} ${styles.s0} ${styles.heroCopy}`}>
            <div className={styles.heroHead}>
              <span className="eyebrow">Self-sustaining plant system</span>
              <h1 className={styles.headline}>
                Ambience, <em>alive.</em>
              </h1>
            </div>
            <div className={styles.heroFoot}>
              <p>
                A living plant that waters itself, lights your room, plays your sounds and quietly keeps time,
                sealed in walnut and glass.
              </p>
              <div className={styles.ctas}>
                <LightRingButton to="/kickstarter">Pre-order now</LightRingButton>
                <LightRingButton to="/product" variant="ghost">
                  Explore it
                </LightRingButton>
              </div>
            </div>
          </div>

          <div className={`${styles.stage} ${styles.s3} ${styles.heroCopy}`}>
            <div className={styles.heroHead}>
              <span className="eyebrow">Back together</span>
              <h2 className={styles.headline}>
                Grown, <em>not maintained.</em>
              </h2>
            </div>
            <div className={styles.heroFoot}>
              <p>Nine layers working quietly so the only thing you have to do is enjoy it.</p>
            </div>
          </div>

          <div className={`${styles.stage} ${styles.s0} ${styles.badge}`}>
            <span className={styles.badgeValue}>$15k+</span>
            <span className={styles.badgeLabel}>raised on Kickstarter</span>
          </div>

          <div className={`${styles.stage} ${styles.s1} ${styles.caption}`}>
            <span className="eyebrow">Exploded view</span>
            <h2>Nine layers. One calm object.</h2>
            <p>Walnut, glass and quiet engineering. Every layer does one job.</p>
          </div>

          <div className={styles.hud}>
            <span className="mono">
              EXPLODE <b ref={pctRef}>{reduced ? '100' : '000'}</b>%
            </span>
            <span className={styles.progress}>
              <i />
            </span>
            <span className={`mono ${styles.hint}`}>Scroll</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Problem() {
  return (
    <section className={`section ${styles.problem}`}>
      <div className="container">
        <div className={styles.problemHead}>
          <span className="eyebrow" data-reveal>
            The problem
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            Students love plants.
            <br />
            <span className={styles.muted}>Plants don't love student life.</span>
          </h2>
        </div>
        <div className={styles.stats}>
          <div data-reveal>
            <StatCounter
              value={92}
              label="of students say they'd have trouble keeping a plant alive."
              detail="Late nights, weekends away, exam season. Plants don't keep student hours."
            />
          </div>
          <div data-reveal style={{ ['--d' as string]: 1 }}>
            <StatCounter
              value={85}
              delay={150}
              label="would love a plant as decor in their space."
              detail="Green makes a room feel lived-in. Nobody wants a dead one on their desk, though."
            />
          </div>
          <div data-reveal style={{ ['--d' as string]: 2 }}>
            <StatCounter
              value={80}
              delay={300}
              label="say upkeep is the main reason they don't get one."
              detail="So we took the upkeep out."
            />
          </div>
        </div>
        <p className={styles.source}>Source: Sproutly student survey [placeholder: n = ___, 2026]</p>
      </div>
    </section>
  )
}

function WaterVisual() {
  return (
    <div className={styles.water}>
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden>
        <path className={styles.wave1} d="M0 60 Q 25 50 50 60 T 100 60 T 150 60 T 200 60 T 250 60 T 300 60 V120 H0Z" />
        <path className={styles.wave2} d="M0 66 Q 25 58 50 66 T 100 66 T 150 66 T 200 66 T 250 66 T 300 66 V120 H0Z" />
      </svg>
      <span className="mono">Reservoir 72%</span>
    </div>
  )
}

function Swatches() {
  const color = useRingColor()
  return (
    <div className={styles.swatches}>
      {MOODS.map((m) => (
        <button
          key={m.id}
          className={styles.swatch}
          style={{ ['--c' as string]: m.color }}
          data-active={color === m.color || undefined}
          onClick={() => setRingColor(m.color)}
          aria-label={`${m.name} light`}
        />
      ))}
    </div>
  )
}

function Equalizer() {
  return (
    <div className={styles.eq} aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <i key={i} style={{ ['--i' as string]: i }} />
      ))}
    </div>
  )
}

function ClockVisual() {
  const now = useNow(1000)
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return (
    <div className={styles.clockVis}>
      <span>
        {hh}
        <i>:</i>
        {mm}
      </span>
      <small className="mono">22°C · Alarm 07:30 · pH 6.4</small>
    </div>
  )
}

function Features() {
  return (
    <section className={`section ${styles.features}`}>
      <div className="container">
        <div className={styles.featuresHead}>
          <span className="eyebrow" data-reveal>
            The solution
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            A plant that looks
            <br />
            after <span className="glow-text">itself.</span>
          </h2>
          <p className="lede" data-reveal style={{ ['--d' as string]: 2 }}>
            Sproutly takes care of the plant, and the plant makes your room feel calmer. Everything else it does is
            about the atmosphere of your space.
          </p>
        </div>
        <div className={styles.bento}>
          <FeatureCard
            index="01 / Self-sustaining"
            title="Waters itself."
            body="Six sensors and an on-device AI decide when to water and exactly how much, in 5 ml doses from a hidden 1.2 L reservoir. Refill every six weeks, not every few days."
            stat={{ value: '6 wks', label: 'between refills*' }}
            className={styles.wide}
          >
            <WaterVisual />
          </FeatureCard>
          <FeatureCard
            index="02 / Mood lighting"
            title="Sets the mood."
            body="A thin strip of light around a walnut ring shifts from warm hearth light to deep focus green. A separate 15,000 lm grow light feeds the plant."
          >
            <Swatches />
          </FeatureCard>
          <FeatureCard
            index="03 / Sound"
            title="Fills the room."
            body="A 10 W, 360° speaker hidden in the walnut base. Play rain, lo-fi or your own playlists over Bluetooth."
          >
            <Equalizer />
          </FeatureCard>
          <FeatureCard
            index="04 / Display + controls"
            title="Knows the room."
            body="A screen wrapped around the base shows the time, date, temperature, alarm and your plant's vitals. The walnut top is a touch panel for sound, alarms and care."
            className={styles.wide}
          >
            <ClockVisual />
          </FeatureCard>
        </div>
        <p className={styles.source}>*Final figures depend on plant, light and room conditions.</p>
      </div>
    </section>
  )
}

function MoodSection() {
  const color = useRingColor()
  const state = useMemo(() => createExplode(0, { spinSpeed: 0.22, autoSpin: !prefersReducedMotion() }), [])
  const active = MOODS.find((m) => m.color === color) ?? MOODS[0]
  return (
    <section className={styles.mood}>
      <div className={styles.moodGlow} aria-hidden />
      <div className={`container ${styles.moodGrid}`}>
        <div className={styles.moodCanvas}>
          <SceneCanvas state={state} mode="mood" labels={false} />
        </div>
        <div className={styles.moodCopy}>
          <span className="eyebrow" data-reveal>
            Mood lighting
          </span>
          <h2 className="display-m" data-reveal style={{ ['--d' as string]: 1 }}>
            Pick a mood.
            <br />
            Watch the room follow.
          </h2>
          <p className="lede" data-reveal style={{ ['--d' as string]: 2 }}>
            Tap the crown or use the app. The halo, the chamber and your walls all shift together. Try it below.
          </p>
          <ul className={styles.moodList} data-reveal style={{ ['--d' as string]: 3 }}>
            {MOODS.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setRingColor(m.color)}
                  data-active={m.id === active.id || undefined}
                  style={{ ['--c' as string]: m.color }}
                >
                  <span className={styles.moodDot} />
                  <span className={styles.moodName}>{m.name}</span>
                  <span className={styles.moodNote}>{m.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { n: '01', t: 'Fill', d: 'Top up the hidden reservoir. It takes about thirty seconds.' },
  { n: '02', t: 'Set', d: 'Pick a mood, a soundscape and an alarm, or leave it on auto.' },
  { n: '03', t: 'Forget', d: 'Sproutly handles water and light. You just enjoy the room.' },
]

function HowItWorks() {
  return (
    <section className={`section ${styles.how}`}>
      <div className="container">
        <span className="eyebrow" data-reveal>
          How it works
        </span>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s.n} className={styles.step} data-reveal style={{ ['--d' as string]: i }}>
              <span className="mono">{s.n}</span>
              <h3>{s.t}.</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function KickstarterBanner() {
  return (
    <section className={styles.ks}>
      <div className="container">
        <div className={styles.ksCard} data-reveal>
          <div className={styles.ksRing} aria-hidden />
          <div className={styles.ksTop}>
            <span className="eyebrow">Live on Kickstarter</span>
            <span className="mono">[placeholder] backers · [placeholder] days left</span>
          </div>
          <div className={styles.ksAmount}>
            <span>$15,000</span>
            <sup>+</sup>
          </div>
          <p className={styles.ksSub}>raised so far, from people who also can't keep plants alive.</p>
          <div className={styles.ksBar}>
            <i style={{ width: '60%' }} />
            <span className="mono">Next stretch goal: $25,000 [placeholder]</span>
          </div>
          <div className={styles.ctas}>
            <LightRingButton to="/kickstarter">Back Sproutly</LightRingButton>
            <LightRingButton to="/story" variant="ghost">
              Meet the team
            </LightRingButton>
          </div>
        </div>
      </div>
    </section>
  )
}

const QUOTES = [
  { q: 'It is the only plant I have ever owned that is still alive in week three.', a: '[Placeholder] — Backer, UCLA' },
  { q: 'The light ring on "Ember" is my whole evening routine now.', a: '[Placeholder] — Early tester' },
  { q: 'Looks like a design object. Sounds better than my speaker.', a: '[Placeholder] — Design blog' },
]

function Testimonials() {
  return (
    <section className={`section ${styles.quotes}`}>
      <div className="container">
        <span className="eyebrow" data-reveal>
          Early words
        </span>
        <div className={styles.quoteGrid}>
          {QUOTES.map((q, i) => (
            <figure key={i} className={styles.quote} data-reveal style={{ ['--d' as string]: i }}>
              <blockquote>“{q.q}”</blockquote>
              <figcaption className="mono">{q.a}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useReveal()
  return (
    <>
      <Hero />
      <Marquee items={['Self-watering', 'Mood light', '360° sound', 'Ambient clock', 'Walnut + glass', 'Zero upkeep']} />
      <Problem />
      <hr className="divider" />
      <Features />
      <AiSection />
      <MoodSection />
      <HowItWorks />
      <KickstarterBanner />
      <Testimonials />
    </>
  )
}
