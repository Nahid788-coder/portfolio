import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { LANGUAGES } from './i18n/translations';

function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const { lang, setLang, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                                <a href={`#${id}`} onClick={e => scrollToSection(e, id)}>{label}</a>
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
