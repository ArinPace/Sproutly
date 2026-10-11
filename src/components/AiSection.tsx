import { useEffect, useMemo, useState } from 'react'
import styles from './AiSection.module.css'

const STEPS = [
  ['01', 'Sense', 'Six sensors read light, soil moisture, pH, water level, temperature and humidity every 60 seconds.'],
  ['02', 'Predict', 'An on-device model forecasts how fast the soil will dry and how much light the plant will still need today.'],
  ['03', 'Act', 'It sets the grow light level and doses water in 5 ml steps, then re-measures before doing anything else.'],
  ['04', 'Learn', 'Every result tunes the model to your plant, your room and your routine. It takes about 14 days.'],
] as const

const LOG = [
  ['07:00', 'Sunrise ramp started. Grow light 0 → 35 % over 30 min.'],
  ['09:14', 'Window light detected (18,400 lux). Grow light dimmed to 12 %.'],
  ['11:02', 'Soil 41 %. Forecast to hit stress line by 15:40. Dosing 40 ml in 8 steps.'],
  ['11:09', 'Soil back to 52 % after 35 ml. Stopped early, 5 ml saved.'],
  ['13:30', 'Clouds rolled in. Natural light down 64 %. Grow light up to 58 %.'],
  ['18:45', 'Daily light at 13.6 / 15.0 mol. Topping up 50 min at 40 %.'],
  ['22:30', 'Alarm set for 07:30. Grow light off, room handed to the halo.'],
  ['03:00', 'pH 6.4, stable. Drying curve updated: warm room, 3 % faster.'],
] as const

/* ---------- Light chart: 24 h of natural + grow light against the plant's target ---------- */
const LW = 600
const LH = 220
const PEAK = 1000
const TARGET = 430

function natural(h: number) {
  const sun = Math.max(0, Math.sin((Math.PI * (h - 6.5)) / 13)) * 780
  const cloud = 1 - 0.62 * Math.exp(-(((h - 13.6) / 0.8) ** 2))
  return sun * cloud
}

function target(h: number) {
  if (h < 7 || h > 22) return 0
  const up = Math.min(1, (h - 7) / 0.6)
  const down = Math.min(1, (22 - h) / 0.6)
  return TARGET * Math.min(up, down)
}

const lx = (h: number) => (h / 24) * LW
const ly = (v: number) => LH - (v / PEAK) * LH

function lightPaths() {
  const hs = Array.from({ length: 241 }, (_, i) => i / 10)
  const nat = hs.map(natural)
  const grow = hs.map((h, i) => Math.max(0, target(h) - nat[i]))
  const top = hs.map((_, i) => nat[i] + grow[i])
  const line = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${lx(hs[i]).toFixed(1)} ${ly(v).toFixed(1)}`).join(' ')
  const area = (upper: number[], lower: number[]) =>
    `${line(upper)} ${lower
      .map((v, i) => [lx(hs[i]), ly(v)] as const)
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ')} Z`
  return {
    natural: area(nat, nat.map(() => 0)),
    grow: area(top, nat),
    targetLine: line(hs.map(target)),
  }
}

/* ---------- Water chart: a week of soil moisture with AI doses ---------- */
const WW = 600
const WH = 220
const STRESS = 38
const DOSE_AT = 42

function waterPaths() {
  const steps = 7 * 48
  const now = 5.3 * 48
  let m = 60
  const pts: [number, number][] = []
  const doses: [number, number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const day = i / 48
    const hour = (i % 48) / 2
    const daytime = hour > 8 && hour < 20 ? 1.5 : 0.6
    m -= 0.085 * daytime * (1 + 0.15 * Math.sin(day * 2.1))
    if (m <= DOSE_AT) {
      const ml = Math.round((58 - m) * 2.2)
      doses.push([day, m, ml])
      m = 58 + Math.sin(day) * 1.5
    }
    pts.push([day, m])
  }
  const x = (d: number) => (d / 7) * WW
  const y = (v: number) => WH - ((v - 25) / 45) * WH
  const toPath = (arr: [number, number][]) =>
    arr.map(([d, v], i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return {
    past: toPath(pts.slice(0, now + 1)),
    future: toPath(pts.slice(now)),
    doses: doses.map(([d, v, ml]) => ({ x: x(d), y: y(v), top: y(58), ml, future: d * 48 > now })),
    stressY: y(STRESS),
    doseY: y(DOSE_AT),
    nowX: x(now / 48),
  }
}

type Tab = 'light' | 'water'

function LightPanel() {
  const p = useMemo(lightPaths, [])
  return (
    <div className={styles.panel}>
      <div className={styles.copy}>
        <h3>Light, measured in what the plant actually uses.</h3>
        <p>
          Lumens are for people. Plants count photons. Every plant profile has a daily light target (its{' '}
          <em>daily light integral</em>), and Sproutly tracks how much of it the plant has had, minute by minute.
        </p>
        <ul>
          <li>
            <b>Reads the room.</b> The crown sensor measures window light from 0.01 to 120,000 lux, so free sunlight
            always counts first.
          </li>
          <li>
            <b>Fills only the gap.</b> The 15,000 lm grow light adds exactly what's missing. Clouds roll in, it brightens.
            Sun comes out, it backs off.
          </li>
          <li>
            <b>Respects your sleep.</b> It learns your alarm and bedtime and finishes the plant's day before you go to
            bed.
          </li>
        </ul>
      </div>
      <figure className={styles.chart}>
        <figcaption className="mono">
          Today · <span className={styles.kNat}>Natural 6.1</span> + <span className={styles.kGrow}>Grow 8.9</span> ={' '}
          <b>15.0 mol/m²</b> target
        </figcaption>
        <svg viewBox={`0 0 ${LW} ${LH + 26}`} role="img" aria-label="Natural light and grow light over 24 hours">
          <rect className={styles.sleep} x={0} y={0} width={lx(7)} height={LH} />
          <rect className={styles.sleep} x={lx(22.5)} y={0} width={LW - lx(22.5)} height={LH} />
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} className={styles.grid} x1={0} x2={LW} y1={LH * f} y2={LH * f} />
          ))}
          <path className={styles.natArea} d={p.natural} />
          <path className={styles.growArea} d={p.grow} />
          <path className={styles.targetLine} d={p.targetLine} />
          <text className={styles.note} x={lx(0.4)} y={18}>
            asleep · grow light off
          </text>
          <text className={styles.note} x={lx(12.4)} y={ly(TARGET) - 10}>
            clouds · grow light steps in
          </text>
          {[0, 6, 12, 18, 24].map((h) => (
            <text key={h} className={styles.axis} x={lx(h)} y={LH + 18} textAnchor={h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}>
              {String(h).padStart(2, '0')}:00
            </text>
          ))}
        </svg>
        <div className={styles.legend}>
          <span>
            <i className={styles.kNatDot} /> Natural light
          </span>
          <span>
            <i className={styles.kGrowDot} /> Grow light (AI)
          </span>
          <span>
            <i className={styles.kTargetDot} /> Plant's target
          </span>
        </div>
      </figure>
    </div>
  )
}

function WaterPanel() {
  const p = useMemo(waterPaths, [])
  return (
    <div className={styles.panel}>
      <div className={styles.copy}>
        <h3>Water before the plant is thirsty, never after.</h3>
        <p>
          Timers water on schedule, whether the plant needs it or not. Sproutly learns how fast your soil dries (warm
          rooms, sunny days and bigger leaves all speed it up) and forecasts when it will hit the plant's stress line.
        </p>
        <ul>
          <li>
            <b>When.</b> It waters a few hours before the forecast stress point, so the roots never go dry.
          </li>
          <li>
            <b>How much.</b> The dose is the predicted shortfall, pumped in 5 ml steps. After each step it waits,
            re-measures, and stops as soon as the roots are back in range.
          </li>
          <li>
            <b>What else.</b> pH drift and an unusually fast drying rate flag problems like root rot or a draught
            weeks before you'd see them on the leaves.
          </li>
        </ul>
      </div>
      <figure className={styles.chart}>
        <figcaption className="mono">
          Soil moisture · last 5 days + <span className={styles.kGrow}>forecast</span>
        </figcaption>
        <svg viewBox={`0 0 ${WW} ${WH + 26}`} role="img" aria-label="Soil moisture over a week with watering doses">
          <rect className={styles.stress} x={0} y={p.stressY} width={WW} height={WH - p.stressY} />
          <line className={styles.doseLine} x1={0} x2={WW} y1={p.doseY} y2={p.doseY} />
          <text className={styles.note} x={8} y={p.stressY + 18}>
            stress zone
          </text>
          <text className={styles.note} x={8} y={p.doseY - 8}>
            AI waters here
          </text>
          <line className={styles.now} x1={p.nowX} x2={p.nowX} y1={0} y2={WH} />
          <text className={styles.note} x={p.nowX + 6} y={16}>
            now
          </text>
          <path className={styles.moist} d={p.past} />
          <path className={styles.forecast} d={p.future} />
          {p.doses.map((d, i) => (
            <g key={i} className={d.future ? styles.doseFuture : styles.dose}>
              <line x1={d.x} x2={d.x} y1={d.y} y2={d.top} />
              <circle cx={d.x} cy={d.top} r={4} />
              <text x={d.x} y={d.top - 10} textAnchor="middle">
                +{d.ml} ml
              </text>
            </g>
          ))}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
            <text key={d} className={styles.axis} x={(i + 0.5) * (WW / 7)} y={WH + 18} textAnchor="middle">
              {d}
            </text>
          ))}
        </svg>
        <div className={styles.legend}>
          <span>
            <i className={styles.kMoistDot} /> Measured at the roots
          </span>
          <span>
            <i className={styles.kGrowDot} /> Forecast + planned dose
          </span>
        </div>
      </figure>
    </div>
  )
}

function DecisionLog() {
  const [n, setN] = useState(4)
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), 2600)
    return () => clearInterval(id)
  }, [])
  const rows = Array.from({ length: 4 }, (_, i) => LOG[(n - 4 + i) % LOG.length])
  return (
    <div className={styles.log}>
      <header className="mono">
        <i /> Decision log · live
      </header>
      <ol>
        {rows.map(([t, msg], i) => (
          <li key={`${n}-${i}`} data-new={i === 3 || undefined}>
            <span className="mono">{t}</span>
            {msg}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function AiSection() {
  const [tab, setTab] = useState<Tab>('light')
  return (
    <section className={`section ${styles.ai}`} id="intelligence">
      <div className={styles.glow} aria-hidden />
      <div className="container">
        <div className={styles.head}>
          <span className="eyebrow" data-reveal>
            Sproutly Intelligence
          </span>
          <h2 className="display-l" data-reveal style={{ ['--d' as string]: 1 }}>
            It learns your plant.
            <br />
            <span className="glow-text">Then it takes over.</span>
          </h2>
          <p className="lede" data-reveal style={{ ['--d' as string]: 2 }}>
            A small AI model runs on Sproutly itself. It watches every sensor, predicts what your plant needs next, and
            decides how bright the grow light should be and exactly when, and how much, to water.
          </p>
        </div>

        <ol className={styles.steps}>
          {STEPS.map(([i, t, d], k) => (
            <li key={i} data-reveal style={{ ['--d' as string]: k }}>
              <span className="mono">{i}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>

        <div className={styles.tabs} role="tablist" data-reveal>
          {(['light', 'water'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} data-active={tab === t || undefined} onClick={() => setTab(t)}>
              {t === 'light' ? 'Grow light' : 'Watering'}
            </button>
          ))}
        </div>

        <div className={styles.stage} data-reveal>
          <div key={tab} className={styles.swap}>
            {tab === 'light' ? <LightPanel /> : <WaterPanel />}
          </div>
        </div>

        <div className={styles.bottom}>
          <DecisionLog />
          <div className={styles.facts}>
            {[
              ['38 %', 'less water than timer-based watering*'],
              ['14 days', 'to fully learn a new plant'],
              ['100 %', 'on-device. Works offline, data stays home'],
            ].map(([v, l], i) => (
              <div key={l} data-reveal style={{ ['--d' as string]: i }}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.footnote}>*Projected from prototype testing. Final figures depend on plant and room.</p>
      </div>
    </section>
  )
}
