import { useEffect, useState } from 'react'
import './App.css'
import './animations.css'
import Menu from './Menu'
import Header from './Header'
import About from './About'
import Skill from './Skill'
import Work from './Work'
import Protfolio from './Protfolio'
import Contact from './Contact'
import Footer from './Footer'
import { useScrollProgress } from './hooks'

function App() {
  const progress = useScrollProgress()
  const [showTop, setShowTop] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const [loaderPhase, setLoaderPhase] = useState('symbol') // symbol | cover | hold | reveal
  const [symbolVisible, setSymbolVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // 80ms  → symbol fades IN
    // 1000ms → panels slide IN (cover), symbol fades out
    // 1700ms → hold
    // 2100ms → panels slide OUT (reveal)
    // 2900ms → loader removed
    const t0 = setTimeout(() => setSymbolVisible(true),  80)
    const t1 = setTimeout(() => setLoaderPhase('cover'), 1000)
    const t2 = setTimeout(() => setLoaderPhase('hold'),  1700)
    const t3 = setTimeout(() => setLoaderPhase('reveal'),2100)
    const t4 = setTimeout(() => setLoaderGone(true),     2900)
    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  /* symbol class logic */
  let symbolCls = 'lp-symbol'
  if (['cover','hold','reveal'].includes(loaderPhase)) symbolCls += ' lp-symbol--fade'
  else if (symbolVisible) symbolCls += ' lp-symbol--visible'

  /* panel class logic */
  const panelIn  = ['cover','hold'].includes(loaderPhase)
  const panelOut = loaderPhase === 'reveal'

  return (
    <>
      {/* ── LOADER ─────────────────────────────────── */}
      {!loaderGone && (
        <>
          {/* Black background */}
          <div className={`lp-bg${loaderPhase === 'reveal' ? ' lp-bg--out' : ''}`}></div>

          {/* Top panel */}
          <div className={`lp-panel lp-panel--top${panelIn ? ' lp-panel--in' : ''}${panelOut ? ' lp-panel--out' : ''}`}></div>

          {/* Bottom panel */}
          <div className={`lp-panel lp-panel--bottom${panelIn ? ' lp-panel--in' : ''}${panelOut ? ' lp-panel--out' : ''}`}></div>

          {/* N Symbol */}
          <div className={symbolCls}>
            <svg className="lp-n-svg" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="nGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Outer hexagon border */}
              <polygon
                points="50,2 96,27 96,88 50,113 4,88 4,27"
                fill="none" stroke="#c9a96e" strokeWidth="1.3"
                filter="url(#nGlowFilter)"
              />
              {/* Inner hex ring */}
              <polygon
                points="50,10 88,32 88,83 50,105 12,83 12,32"
                fill="none" stroke="#c9a96e" strokeWidth="0.5" opacity="0.4"
              />

              {/* N — left vertical bar */}
              <rect x="19" y="23" width="12" height="69" fill="#c9a96e" filter="url(#nGlowFilter)"/>
              {/* N — right vertical bar */}
              <rect x="69" y="23" width="12" height="69" fill="#c9a96e" filter="url(#nGlowFilter)"/>
              {/* N — diagonal stroke */}
              <line x1="25" y1="23" x2="75" y2="92"
                stroke="#c9a96e" strokeWidth="13" strokeLinecap="square"
                filter="url(#nGlowFilter)"
              />

              {/* Hex corner dots */}
              <circle cx="50"  cy="2"   r="2.5" fill="#c9a96e"/>
              <circle cx="96"  cy="27"  r="2.5" fill="#c9a96e"/>
              <circle cx="96"  cy="88"  r="2.5" fill="#c9a96e"/>
              <circle cx="50"  cy="113" r="2.5" fill="#c9a96e"/>
              <circle cx="4"   cy="88"  r="2.5" fill="#c9a96e"/>
              <circle cx="4"   cy="27"  r="2.5" fill="#c9a96e"/>
            </svg>
          </div>
        </>
      )}

      {/* ── PAGE CONTENT ───────────────────────────── */}
      <div className="scroll-progress" style={{ width: `${progress}%` }}></div>
      <div className="gradient-mesh"></div>

      <div className='main'>
        <Menu />
        <Header />
        <About />
        <Skill />
        <Work />
        <Protfolio />
        <Contact />
        <Footer />
      </div>

      <button
        className={`back-to-top ${showTop ? 'show' : ''}`}
        onClick={toTop}
        aria-label="Back to top"
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </>
  )
}

export default App
