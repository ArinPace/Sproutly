import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import SceneCanvas from '../three/Scene'
import { createExplode } from '../three/useExplode'
import { PARTS, PART_BY_ID, type PartId } from '../three/parts'
import LightRingButton from '../components/LightRingButton'
import { prefersReducedMotion } from '../lib/store'
import { useReveal } from '../lib/hooks'
import { scrollToEl, scrollToTop } from '../lib/scroll'
import { PART_DETAILS } from '../content/partDetails'
import styles from './Product.module.css'

const SPECS: { group: string; rows: [string, string][] }[] = [
  {
    group: 'Body',
    rows: [
      ['Dimensions', 'Ø 200 × 375 mm'],
      ['Weight', '2.4 kg (empty)'],
      ['Materials', 'FSC walnut, borosilicate glass, anodised aluminium'],
    ],
  },
  {
    group: 'Plant care',
    rows: [
      ['Reservoir', '1.2 L, refill about every 6 weeks'],
      ['Grow light', 'Full spectrum, up to 15,000 lm, AI day cycle'],
      ['Sensors', 'Ambient light, soil moisture, pH, water level, temp + humidity'],
    ],
  },
  {
    group: 'Ambience',
    rows: [
      ['Halo light', '48 RGBW LEDs, 450 lm, 5 preset moods'],
      ['Audio', '360° 10 W driver + passive radiator'],
      ['Display', '2.9 in curved: time, date, temp, alarm, plant vitals'],
      ['Controls', 'Capacitive walnut-top panel + app'],
    ],
  },
  {
    group: 'Connectivity + power',
    rows: [
      ['Wireless', 'Wi-Fi 6, Bluetooth 5.3'],
      ['App', 'iOS + Android'],
      ['Power', 'USB-C PD, 100 W adapter included'],
    ],
  },
]

const IN_THE_BOX = [
  ['01', 'Sproutly unit', 'Assembled and tested'],
  ['02', 'Starter plant pod', 'Low-light, hand-picked'],
  ['03', 'Living soil pack', 'Pre-mixed with perlite'],
  ['04', 'Refill bottle', 'Fills the reservoir in one pour'],
  ['05', 'USB-C cable + 100 W adapter', '1.8 m braided'],
  ['06', 'Quick-start card', 'Up and running in five minutes'],
]

function Viewer({ selected, setSelected }: { selected: PartId | null; setSelected: (id: PartId | null) => void }) {
  const [amount, setAmount] = useState(1)
  const state = useMemo(
    () =>
      createExplode(1, {
        interactive: true,
        spinSpeed: 0.1,
        autoSpin: !prefersReducedMotion(),
        onSelect: (id) => setSelected(id),
      }),
    [],
  )
  const part = selected ? PART_BY_ID[selected] : null

  useEffect(() => {
    state.autoSpin = !selected && !prefersReducedMotion()
  }, [selected, state])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSlide = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setAmount(v)
    state.target = v
  }

  return (
    <section className={styles.viewer} data-open={part ? true : undefined}>
      <SceneCanvas state={state} mode="product" selected={selected} className={styles.canvas} />

      <header className={styles.head}>
        <span className="eyebrow">Product / Anatomy</span>
        <h1 className="display-m">
          Nine layers,
          <br />
          <span className="glow-text">one calm object.</span>
        </h1>
        <p className={styles.hint}>Click any part to see how it works.</p>
      </header>

      <div className={styles.controls}>
        <label className={styles.slider}>
          <span className="mono">ASSEMBLED</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={amount}
            onChange={onSlide}
            aria-label="Explode amount"
            style={{ ['--v' as string]: amount }}
          />
          <span className="mono">EXPLODED</span>
        </label>
        <div className={styles.chips}>
          {PARTS.map((p) => (
            <button
              key={p.id}
              className={styles.chip}
              data-active={selected === p.id || undefined}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
            >
              <span>{p.index}</span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <aside className={styles.panel} aria-hidden={!part}>
        {part && (
          <div key={part.id} className={styles.panelInner}>
            <button className={styles.close} onClick={() => setSelected(null)} aria-label="Close part details">
              ×
            </button>
            <span className={styles.panelIndex}>
              {part.index} / {String(PARTS.length).padStart(2, '0')}
            </span>
            <h2>{part.name}</h2>
            <p className={styles.panelCaption}>{part.caption}</p>
            <div className={styles.panelStats}>
              {PART_DETAILS[part.id].stats.map(([v, u, l]) => (
                <div key={l}>
                  <strong>
                    {v}
                    {u && <small>{u}</small>}
                  </strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
            <p className={styles.panelBody}>{part.description}</p>
            <dl className={styles.panelSpecs}>
              {part.specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <button
              className={styles.more}
              onClick={() => scrollToEl(document.getElementById(`part-${part.id}`))}
            >
              Full breakdown: how it works <i>↓</i>
            </button>
            <div className={styles.panelNav}>
              {(['prev', 'next'] as const).map((dir) => {
                const i = PARTS.findIndex((p) => p.id === part.id)
                const to = PARTS[(i + (dir === 'next' ? 1 : PARTS.length - 1)) % PARTS.length]
                return (
                  <button key={dir} onClick={() => setSelected(to.id)}>
                    {dir === 'prev' ? '←' : ''} {to.name} {dir === 'next' ? '→' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </aside>
    </section>
  )
}

function Breakdown({ onView }: { onView: (id: PartId) => void }) {
  return (
    <section className={`section ${styles.breakdown}`}>
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow" data-reveal>
            Part by part
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            Every layer,
            <br />
            <span className="glow-text">explained.</span>
          </h2>
        </div>
        <div className={styles.partList}>
          {PARTS.map((p) => {
            const d = PART_DETAILS[p.id]
            return (
              <article key={p.id} id={`part-${p.id}`} className={styles.partBlock} data-reveal>
                <header>
                  <span className="mono">
                    {p.index} / {String(PARTS.length).padStart(2, '0')}
                  </span>
                  <h3>{p.name}</h3>
                  <p className={styles.panelCaption}>{p.caption}</p>
                  <button className={styles.more} onClick={() => onView(p.id)}>
                    See it in 3D <i>↑</i>
                  </button>
                </header>
                <div className={styles.partBody}>
                  <div className={styles.partStats}>
                    {d.stats.map(([v, u, l]) => (
                      <div key={l}>
                        <strong>
                          {v}
                          {u && <small>{u}</small>}
                        </strong>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.partText}>
                    <h4 className="mono">How it works</h4>
                    {d.how.map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                    <blockquote>
                      <h4 className="mono">Why it matters</h4>
                      <p>{d.why}</p>
                    </blockquote>
                  </div>
                  <dl className={styles.panelSpecs}>
                    {d.specs.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function Product() {
  useReveal()
  const [params] = useSearchParams()
  const initial = params.get('part')
  const [selected, setSelected] = useState<PartId | null>(
    initial && initial in PART_BY_ID ? (initial as PartId) : null,
  )
  const view = (id: PartId) => {
    setSelected(id)
    scrollToTop()
  }
  return (
    <>
      <Viewer selected={selected} setSelected={setSelected} />
      <Breakdown onView={view} />
      <hr className="divider" />

      <section className={`section ${styles.specs}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow" data-reveal>
              Tech specs
            </span>
            <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
              The numbers
              <br />
              behind the calm.
            </h2>
          </div>
          <div className={styles.specGrid}>
            {SPECS.map((g, gi) => (
              <div key={g.group} className={styles.specGroup} data-reveal style={{ ['--d' as string]: gi }}>
                <h3 className="mono">{g.group}</h3>
                <dl>
                  {g.rows.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <p className={styles.note}>*Specs are pre-production targets and may change before shipping.</p>
        </div>
      </section>

      <hr className="divider" />

      <section className={`section ${styles.box}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow" data-reveal>
              What's in the box
            </span>
            <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
              Unbox, pour,
              <br />
              <span className="glow-text">forget.</span>
            </h2>
          </div>
          <ul className={styles.boxGrid}>
            {IN_THE_BOX.map(([i, name, note], k) => (
              <li key={i} data-reveal style={{ ['--d' as string]: k }}>
                <span className="mono">{i}</span>
                <strong>{name}</strong>
                <small>{note}</small>
              </li>
            ))}
          </ul>
          <div className={styles.cta} data-reveal>
            <LightRingButton to="/kickstarter">Pre-order Sproutly</LightRingButton>
            <LightRingButton to="/story" variant="ghost">
              Why we built it
            </LightRingButton>
          </div>
        </div>
      </section>
    </>
  )
}
