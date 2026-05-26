import { useReveal } from './hooks';
import { useLanguage } from './context/LanguageContext';

function Work() {
    const headRef = useReveal();
    const gridRef = useReveal();
    const { t } = useLanguage();
    const w = t.work;

    const handleTilt = (e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-12px)`;
    };
    const resetTilt = (e) => {
        e.currentTarget.style.transform = '';
    };

    return (
        <section className="work" id="work">
            <div className="work-inner">
                <div className="work-heading reveal" ref={headRef}>
                    <div className="section-tag">
                        <i className="fa-solid fa-briefcase"></i> {w.tag}
                    </div>
                    <h1 className="section-title">{w.titleMain} <span>{w.titleSpan}</span></h1>
                    <p className="section-subtitle">{w.subtitle}</p>
                </div>

                <div className="services-grid reveal-stagger" ref={gridRef}>
                    {w.services.map((s, i) => (
                        <div
                            className="service-card glow-border"
                            key={i}
                            onMouseMove={handleTilt}
                            onMouseLeave={resetTilt}
                        >
                            <div className="service-icon-wrap">
                                <span>{s.icon}</span>
                            </div>
                            <h2>{s.title}</h2>
                            <p>{s.desc}</p>
                            <div className="service-tags">
                                {s.tags.map((tag, j) => (
                                    <span className="service-tag" key={j}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Work;
