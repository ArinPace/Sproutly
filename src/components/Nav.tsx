import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import LightRingButton from './LightRingButton'
import { useNow } from '../lib/hooks'
import styles from './Nav.module.css'

const LINKS = [
  { to: '/product', label: 'Product' },
  { to: '/story', label: 'Story' },
  { to: '/kickstarter', label: 'Back us' },
]

function Clock() {
  const now = useNow(1000)
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return (
    <span className={styles.clock} title="Sproutly keeps time too">
      <span className={styles.clockDot} />
      {hh}
      <span className={styles.colon}>:</span>
      {mm}
      <span className={styles.secs}>{ss}</span>
    </span>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={styles.nav} data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="Sproutly home">
          <Logo />
        </Link>
        <nav className={styles.links}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.right}>
          <Clock />
          <span className={styles.cta}>
            <LightRingButton to="/kickstarter">Pre-order</LightRingButton>
          </span>
          <button className={styles.burger} onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <span />
            <span />
          </button>
        </div>
      </div>
      <div className={styles.sheet}>
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to}>
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
