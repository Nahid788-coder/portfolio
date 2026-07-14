import { useReveal, applyRipple } from './hooks';
import { useLanguage } from './context/LanguageContext';

function About() {
    const leftRef = useReveal();
    const rightRef = useReveal();
    const { t } = useLanguage();
    const a = t.about;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "/Nahid_CV.pdf";
        link.download = "Nahid_CV.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section className="about" id="about">
            <div className="about-grid">
                <div className="about-left reveal-left" ref={leftRef}>
                    <div className="section-tag">
                        <i className="fa-solid fa-user"></i> {a.tag}
                    </div>
                    <h1 className="section-title">
                        {a.titleParts[0]} <span>{a.titleParts[1]}</span><br />{a.titleParts[2]}
                    </h1>
                    <p>{a.para1}</p>
                    <p>{a.para2}</p>
                    <button
                        onClick={(e) => { applyRipple(e); handleDownload(); }}
                        className="btn-primary ripple"
                        style={{ marginTop: '30px', border: 'none' }}
                    >
                        <i className="fa-solid fa-download"></i> {a.downloadBtn}
                    </button>
                </div>

                <div className="about-right reveal-stagger" ref={rightRef}>
                    {a.cards.map((card, i) => (
                        <div className="about-card glow-border" key={i}>
                            <i className={`fa-solid ${card.icon} about-card-icon`}></i>
                            <h4>{card.title}</h4>
                            <p>{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default About;
