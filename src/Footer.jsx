import { useLanguage } from './context/LanguageContext';

function Footer() {
    const year = new Date().getFullYear();
    const { lang, t } = useLanguage();
    const f = t.footer;

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h2>NH.</h2>
                        <p>{f.brandPara}</p>
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
                        <h4>{f.navigation}</h4>
                        {f.navLinks.map(([id, label]) => (
                            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{label}</a>
                        ))}
                    </div>

                    <div className="footer-col">
                        <h4>{f.services}</h4>
                        <a href="#work" onClick={e => { e.preventDefault(); scrollTo('work'); }}>{f.serviceLinks[0]}</a>
                        <a href="#work" onClick={e => { e.preventDefault(); scrollTo('work'); }}>{f.serviceLinks[1]}</a>
                        <a href="#work" onClick={e => { e.preventDefault(); scrollTo('work'); }}>{f.serviceLinks[2]}</a>
                        <a href="#contact" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>{f.serviceLinks[3]}</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {year} Nahid Husain. {lang === 'de' ? 'Alle Rechte vorbehalten.' : lang === 'fr' ? 'Tous droits réservés.' : lang === 'es' ? 'Todos los derechos reservados.' : lang === 'hi' ? 'सर्वाधिकार सुरक्षित।' : lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
                    <p>{f.madeWith.split('♥')[0]}<span>♥</span>{f.madeWith.split('♥')[1]}</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
