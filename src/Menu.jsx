import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { LANGUAGES } from './i18n/translations';

function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [active, setActive] = useState('home');
    const { lang, setLang, t } = useLanguage();

    useEffect(() => {
        // a little hysteresis so the bar doesn't flicker between states near the top
        const handleScroll = () => setScrolled(prev => (prev ? window.scrollY > 24 : window.scrollY > 64));
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // scroll spy: highlight the link of the section in view
    useEffect(() => {
        const ids = ['home', 'about', 'skills', 'work', 'portfolio', 'contact'];
        let raf = 0;
        const update = () => {
            raf = 0;
            const line = window.innerHeight * 0.4;
            let current = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            // at the very bottom the last section wins even if it is short
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
            setActive(current);
        };
        const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    // Close lang dropdown on outside click
    useEffect(() => {
        const close = (e) => {
            if (!e.target.closest('.lang-switcher')) setLangOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    const navItems = [
        ['home', t.nav.home],
        ['about', t.nav.about],
        ['skills', t.nav.skills],
        ['work', t.nav.services],
        ['portfolio', t.nav.work],
        ['contact', t.nav.contact],
    ];

    const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

    return (
        <nav className={`menu ${scrolled ? 'scrolled' : ''}`}>
            <div className="menu-logo glitch" data-text="NH.">
                NH<span>.</span>
            </div>
            <div className="menu-rightbar">
                <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                    <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>
                <div className={`menubar ${isMenuOpen ? 'active' : ''}`}>
                    <ul>
                        {navItems.map(([id, label]) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className={active === id ? 'is-active' : undefined}
                                    aria-current={active === id ? 'location' : undefined}
                                    onClick={e => scrollToSection(e, id)}
                                >{label}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Language Switcher */}
                <div className="lang-switcher">
                    <button
                        className="lang-current-btn"
                        onClick={() => setLangOpen(o => !o)}
                        aria-label="Select language"
                    >
                        <span className="lang-flag">{currentLang.flag}</span>
                        <span className="lang-code">{lang.toUpperCase()}</span>
                        <svg viewBox="0 0 10 6" width="10" height="6" fill="currentColor" style={{ opacity: 0.6 }}>
                            <path d="M0 0l5 6 5-6z"/>
                        </svg>
                    </button>
                    {langOpen && (
                        <div className="lang-dropdown">
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.code}
                                    className={`lang-option ${l.code === lang ? 'active' : ''}`}
                                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                                >
                                    <span>{l.flag}</span>
                                    <span>{l.label}</span>
                                    {l.code === lang && <span className="lang-check">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Menu;
