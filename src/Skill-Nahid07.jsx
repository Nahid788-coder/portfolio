import { useReveal } from './hooks';

function Skill() {
    const headingRef = useReveal();
    const leftRef = useReveal();
    const rightRef = useReveal();

    const skills = [
        { name: 'HTML / CSS', level: 95 },
        { name: 'JavaScript', level: 82 },
        { name: 'React.js', level: 85 },
        { name: 'Node.js', level: 70 },
        { name: 'Next.js', level: 68 },
        { name: 'SQL / MongoDB', level: 75 },
        { name: 'Flutter', level: 72 },
        { name: 'Git / GitHub', level: 85 },
    ];

    const techs = [
        { icon: '⚛️', name: 'React' },
        { icon: '🟢', name: 'Node.js' },
        { icon: '▲', name: 'Next.js' },
        { icon: '🐦', name: 'Flutter' },
        { icon: '🗄️', name: 'MySQL' },
        { icon: '🍃', name: 'MongoDB' },
        { icon: '🐙', name: 'Git' },
        { icon: '🤖', name: 'AI/LLM' },
        { icon: '⚡', name: 'Vite' },
    ];

    const marqueeItems = [
        'React', 'Next.js', 'Node.js', 'Flutter', 'JavaScript',
        'TypeScript', 'MongoDB', 'MySQL', 'Tailwind', 'Express',
        'AI / LLM', 'Prompt Engineering', 'Git', 'Vite',
    ];

    const handlePillMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    return (
        <section className="skill" id="skills">
            <div className="skill-bg"></div>
            <div className="skill-inner">
                <div className="skill-heading reveal" ref={headingRef}>
                    <div className="section-tag">
                        <i className="fa-solid fa-code"></i> My Skills
                    </div>
                    <h1 className="section-title">Technologies I Work With</h1>
                    <p className="section-subtitle">Proficiency levels based on real project experience</p>
                </div>

                <div className="skills-container">
                    <div className="skills-left reveal-left" ref={leftRef}>
                        <h3>Proficiency</h3>
                        {skills.map((skill, i) => (
                            <div className="skill-item" key={i}>
                                <div className="skill-info">
                                    <h4>{skill.name}</h4>
                                    <span>{skill.level}%</span>
                                </div>
                                <div className="skill-bar">
                                    <div
                                        className="skill-progress"
                                        style={{ '--target-width': `${skill.level}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="skills-right reveal-stagger" ref={rightRef}>
                        {techs.map((tech, i) => (
                            <div className="tech-pill" key={i} onMouseMove={handlePillMove}>
                                <span className="tech-pill-icon">{tech.icon}</span>
                                <span className="tech-pill-name">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="marquee">
                    <div className="marquee-track">
                        {[...marqueeItems, ...marqueeItems].map((item, i) => (
                            <span className="marquee-item" key={i}>
                                <span className="dot-sep"></span>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Skill;
