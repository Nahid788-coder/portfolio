import { useReveal, applyRipple } from './hooks';

function About() {
    const leftRef = useReveal();
    const rightRef = useReveal();

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "/Nahid_CV.pdf";
        link.download = "Nahid_CV.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const cards = [
        { icon: '🎓', title: 'Education', desc: 'Computer Engineering student with a strong foundation in software development.' },
        { icon: '💼', title: 'Experience', desc: 'Full Stack Developer Intern at Junkies Coder, building real-world applications.' },
        { icon: '🤖', title: 'AI Integration', desc: 'Leveraging AI & Prompt Engineering to accelerate development workflows.' },
        { icon: '📱', title: 'Mobile Dev', desc: 'Building cross-platform mobile apps using Flutter framework.' },
    ];

    return (
        <section className="about" id="about">
            <div className="about-grid">
                <div className="about-left reveal-left" ref={leftRef}>
                    <div className="section-tag">
                        <i className="fa-solid fa-user"></i> About Me
                    </div>
                    <h1 className="section-title">
                        Crafting <span>Digital</span><br />Experiences
                    </h1>
                    <p>
                        Hey! I'm Nahid — an enthusiastic Full Stack Developer who loves turning ideas
                        into clean, functional web applications. I'm currently interning at Junkies Coder,
                        where I work with React.js, Node.js, Next.js, SQL, and Flutter.
                    </p>
                    <p>
                        What sets me apart is my honest approach — I believe in accurately representing
                        my skills and continuously growing. I actively incorporate AI-assisted development
                        and Prompt Engineering into my workflow to build smarter and faster.
                    </p>
                    <button
                        onClick={(e) => { applyRipple(e); handleDownload(); }}
                        className="btn-primary ripple"
                        style={{ marginTop: '30px', border: 'none' }}
                    >
                        <i className="fa-solid fa-download"></i> Download CV
                    </button>
                </div>

                <div className="about-right reveal-stagger" ref={rightRef}>
                    {cards.map((card, i) => (
                        <div className="about-card glow-border" key={i}>
                            <span className="about-card-icon">{card.icon}</span>
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
