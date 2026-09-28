import { useEffect, useState, lazy, Suspense } from 'react'
import './App.css'
import './animations.css'
import '@fontsource-variable/geist'
import './theme-liquid.css'
import './section-motion.css'
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
const Scene3D = lazy(() => import('./Scene3D'))
const LoaderN = lazy(() => import('./LoaderN'))
import { LanguageProvider } from './context/LanguageContext'

function App() {
  const progressRef = useScrollProgress()
  const [loaderGone, setLoaderGone] = useState(false)
  const [loaderPhase, setLoaderPhase] = useState('symbol') // symbol | cover | hold | reveal
  const [symbolVisible, setSymbolVisible] = useState(false)
  const [nReady, setNReady] = useState(false)
  const [nTimedOut, setNTimedOut] = useState(false)

  // if the 3D N can't load (no WebGL, slow network), don't hold the page forever
  useEffect(() => {
    const t = setTimeout(() => setNTimedOut(true), 3500)
    return () => clearTimeout(t)
  }, [])

  const start = nReady || nTimedOut

  useEffect(() => {
    if (!start) return
    // hero entrance animations wait for this (see section-motion.css)
    document.documentElement.classList.add('hero-go')
    // timeline starts when the 3D glass N is on screen:
    // 0ms    → symbol fades IN (N spins in)
    // 1250ms → panels slide IN (cover), symbol fades out
    // 1950ms → hold
    // 2350ms → panels slide OUT (reveal)
    // 3150ms → loader removed
    const t0 = setTimeout(() => setSymbolVisible(true),  30)
    const t1 = setTimeout(() => setLoaderPhase('cover'), 1300)
    const t2 = setTimeout(() => setLoaderPhase('hold'),  2000)
    const t3 = setTimeout(() => setLoaderPhase('reveal'),2400)
    const t4 = setTimeout(() => setLoaderGone(true),     3200)
    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout)
  }, [start])

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
            <Suspense fallback={null}>
              <LoaderN onReady={() => setNReady(true)} />
            </Suspense>
          </div>
        </>
      )}

      {/* ── PAGE CONTENT ───────────────────────────── */}
      <Suspense fallback={<div className="scene3d scene3d--fallback" aria-hidden="true" />}>
        <Scene3D />
      </Suspense>
      <div className="scroll-progress" ref={progressRef}></div>

      <LanguageProvider>
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
      </LanguageProvider>
    </>
  )
}

export default App
