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
import Assistant from './Assistant'

function App() {
  const progress = useScrollProgress()
  const [loaderGone, setLoaderGone] = useState(false)
  const [loaderPhase, setLoaderPhase] = useState('symbol') // symbol | cover | hold | reveal
  const [symbolVisible, setSymbolVisible] = useState(false)

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
            <svg className="lp-n-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Strong glow for N + circle */}
                <filter id="gA" x="-55%" y="-55%" width="210%" height="210%">
                  <feGaussianBlur stdDeviation="2.8" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                {/* Soft glow for diamonds */}
                <filter id="gB" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="1.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Faint fill inside circle */}
              <circle cx="50" cy="50" r="45" fill="rgba(201,169,110,0.04)"/>

              {/* Outer circle — the Avengers-style ring */}
              <circle cx="50" cy="50" r="45"
                fill="none" stroke="#c9a96e" strokeWidth="1.5"
                filter="url(#gA)"
              />

              {/* Inner ring — subtle depth */}
              <circle cx="50" cy="50" r="39.5"
                fill="none" stroke="#c9a96e" strokeWidth="0.5" opacity="0.28"
              />

              {/* 4 arc-gap indicators (like watch bezels) at compass points */}
              {/* Top arc gap */}
              <path d="M 41,5.5 A 45,45 0 0,1 59,5.5"
                fill="none" stroke="#070707" strokeWidth="3.5"/>
              {/* Bottom arc gap */}
              <path d="M 59,94.5 A 45,45 0 0,1 41,94.5"
                fill="none" stroke="#070707" strokeWidth="3.5"/>
              {/* Left arc gap */}
              <path d="M 5.5,41 A 45,45 0 0,0 5.5,59"
                fill="none" stroke="#070707" strokeWidth="3.5"/>
              {/* Right arc gap */}
              <path d="M 94.5,59 A 45,45 0 0,0 94.5,41"
                fill="none" stroke="#070707" strokeWidth="3.5"/>

              {/* Diamond markers at the 4 gap positions */}
              <polygon points="50,1  53.5,7  50,13  46.5,7"  fill="#c9a96e" filter="url(#gB)"/>
              <polygon points="50,99 53.5,93 50,87  46.5,93" fill="#c9a96e" filter="url(#gB)"/>
              <polygon points="1,50  7,46.5  13,50  7,53.5"  fill="#c9a96e" filter="url(#gB)"/>
              <polygon points="99,50 93,46.5 87,50  93,53.5" fill="#c9a96e" filter="url(#gB)"/>

              {/* ── N LETTERFORM ── */}
              {/* Single clean stroke path: angular miter joins = Avengers sharpness */}
              <path
                d="M 23,83 L 23,17 L 77,83 L 77,17"
                fill="none"
                stroke="#c9a96e"
                strokeWidth="11.5"
                strokeLinejoin="miter"
                strokeMiterlimit="28"
                strokeLinecap="square"
                filter="url(#gA)"
              />
            </svg>
          </div>
        </>
      )}

      {/* ── PAGE CONTENT ───────────────────────────── */}
      <div className="scroll-progress" style={{ width: `${progress}%` }}></div>
      <div className="gradient-mesh">
        <div className="gm-blob gm-blob1"></div>
        <div className="gm-blob gm-blob2"></div>
        <div className="gm-blob gm-blob3"></div>
      </div>

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

      <Assistant />
    </>
  )
}

export default App
