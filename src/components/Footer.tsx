import { Link } from 'react-router-dom'
import Logo from './Logo'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p>A self-sustaining plant system for calmer rooms. Designed for students, dorms and anyone who forgets to water things.</p>
          </div>
          <div className={styles.cols}>
            <div>
              <h4>Explore</h4>
              <Link to="/product">Product</Link>
              <Link to="/story">Our story</Link>
              <Link to="/kickstarter">Back us</Link>
            </div>
            <div>
              <h4>Connect</h4>
              <a href="#" aria-disabled>
                Instagram [placeholder]
              </a>
              <a href="#" aria-disabled>
                TikTok [placeholder]
              </a>
              <a href="mailto:hello@sproutly.example">hello@sproutly.example</a>
            </div>
            <div>
              <h4>Status</h4>
              <span className={styles.live}>
                <i /> Kickstarter: $15,000+ raised
              </span>
              <span>Shipping [placeholder: Spring 2027]</span>
            </div>
          </div>
        </div>
        <div className={styles.word} aria-hidden>
          sproutly
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Sproutly. All rights reserved.</span>
          <span className="mono">Grown, not maintained.</span>
        </div>
      </div>
    </footer>
  )
}
