function Footer() {
    const year = new Date().getFullYear();

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h2>NH.</h2>
                        <p>
                            Full Stack Developer passionate about building clean, modern web applications.
                            Always learning, always building.
                        </p>
                        <div className="footer-social">
                            <a href="https://github.com/Nahid788-coder" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <i className="fa-brands fa-github"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/nahid-husain-doi-15160b1a9/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <i className="fa-brands fa-linkedin-in"></i>
                            </a>
                            <a href="mailto:doiznahidhusain1234@gmail.com" aria-label="Email">
                                <i className="fa-solid fa-envelope"></i>
                            </a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Navigation</h4>
                        {[['home','Home'],['about','About'],['skills','Skills'],['portfolio','Portfolio']].map(([id, label]) => (
                            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{label}</a>
                        ))}
                    </div>

                    <div className="footer-col">
                        <h4>Services</h4>
                        <a href="#work" onClick={e => { e.preventDefault(); scrollTo('work'); }}>Front-End Dev</a>
                        <a href="#work" onClick={e => { e.preventDefault(); scrollTo('work'); }}>Back-End Dev</a>
                        <a href="#work" onClick={e => { e.preventDefault(); scrollTo('work'); }}>Mobile Apps</a>
                        <a href="#contact" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Consultancy</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {year} Nahid Husain. All rights reserved.</p>
                    <p>Made with <span>♥</span> using React + Vite</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
