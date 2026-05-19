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

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoaderGone(true), 2400)
    return () => clearTimeout(t)
  }, [])

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      {!loaderGone && (
        <div className="page-loader">
          <div className="loader-logo">NH.</div>
          <div className="loader-bar"></div>
        </div>
      )}

      <div className="scroll-progress" style={{ width: `${progress}%` }}></div>

      <div className="blob-bg">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
        <div className="blob blob4"></div>
        <div className="blob blob5"></div>
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
