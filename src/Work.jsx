import { useReveal } from './hooks';

function Work() {
    const headRef = useReveal();
    const gridRef = useReveal();

    const services = [
        {
            icon: '🖥️',
            title: 'Front-End Development',
            description: 'Building responsive, interactive UIs with React.js and Next.js. Pixel-perfect designs with smooth animations and great UX.',
            tags: ['React.js', 'Next.js', 'CSS3', 'Tailwind'],
        },
        {
            icon: '⚙️',
            title: 'Back-End Development',
            description: 'Robust server-side applications using Node.js and Express, with REST API design and SQL/MongoDB database integration.',
            tags: ['Node.js', 'Express', 'MySQL', 'MongoDB'],
        },
        {
            icon: '📱',
            title: 'Mobile & Consultancy',
            description: 'Cross-platform mobile apps with Flutter and technical consultation to help you make informed decisions for your projects.',
            tags: ['Flutter', 'Dart', 'Strategy', 'AI Tools'],
        },
    ];

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
                        <i className="fa-solid fa-briefcase"></i> Services
                    </div>
                    <h1 className="section-title">What I <span>Do</span></h1>
                    <p className="section-subtitle">End-to-end development from concept to deployment</p>
                </div>

                <div className="services-grid reveal-stagger" ref={gridRef}>
                    {services.map((s, i) => (
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
                            <p>{s.description}</p>
                            <div className="service-tags">
                                {s.tags.map((t, j) => (
                                    <span className="service-tag" key={j}>{t}</span>
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
