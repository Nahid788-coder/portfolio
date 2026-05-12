import { useState, useEffect } from 'react';

function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    return (
        <nav className={`menu ${scrolled ? 'scrolled' : ''}`} id="home">
            <div className="menu-logo glitch" data-text="NH.">
                NH<span>.</span>
            </div>
            <div className="menu-rightbar">
                <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                    <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>
                <div className={`menubar ${isMenuOpen ? 'active' : ''}`}>
                    <ul>
                        {[['home','Home'],['about','About'],['skills','Skills'],['work','Services'],['portfolio','Work'],['contact','Contact']].map(([id, label]) => (
                            <li key={id}>
                                <a href={`#${id}`} onClick={e => scrollToSection(e, id)}>{label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Menu;
