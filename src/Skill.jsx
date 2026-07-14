import { useReveal } from './hooks';
import { useLanguage } from './context/LanguageContext';

const TECHS = [
    { icon: 'fa-brands fa-react', name: 'React' },
    { icon: 'fa-solid fa-file-code', name: 'TypeScript' },
    { icon: 'fa-brands fa-node-js', name: 'Node.js' },
    { icon: 'fa-solid fa-layer-group', name: 'Next.js' },
    { icon: 'fa-solid fa-wind', name: 'Tailwind' },
    { icon: 'fa-solid fa-server', name: 'Express.js' },
    { icon: 'fa-solid fa-mobile-screen-button', name: 'Flutter' },
    { icon: 'fa-solid fa-database', name: 'MySQL' },
    { icon: 'fa-solid fa-leaf', name: 'MongoDB' },
    { icon: 'fa-solid fa-bolt-lightning', name: 'Supabase' },
    { icon: 'fa-solid fa-link', name: 'REST APIs' },
    { icon: 'fa-solid fa-wand-magic-sparkles', name: 'Framer Motion' },
    { icon: 'fa-brands fa-git-alt', name: 'Git' },
    { icon: 'fa-solid fa-robot', name: 'AI/LLM' },
    { icon: 'fa-solid fa-bolt', name: 'Vite' },
    { icon: 'fa-brands fa-figma', name: 'Figma' },
    { icon: 'fa-solid fa-cloud', name: 'Vercel' },
];

function Skill() {
    const headingRef = useReveal();
    const leftRef = useReveal();
    const rightRef = useReveal();
    const { t } = useLanguage();
    const s = t.skill;

    const skills = [
        { name: 'HTML / CSS', level: 95 },
        { name: 'JavaScript', level: 82 },
        { name: 'TypeScript', level: 78 },
        { name: 'React.js', level: 85 },
        { name: 'Tailwind CSS', level: 90 },
        { name: 'Node.js', level: 70 },
        { name: 'Express.js', level: 72 },
        { name: 'Next.js', level: 68 },
        { name: 'SQL / MongoDB', level: 75 },
        { name: 'Supabase', level: 70 },
        { name: 'REST APIs', level: 82 },
        { name: 'Framer Motion', level: 75 },
        { name: 'Flutter', level: 72 },
        { name: 'Git / GitHub', level: 85 },
        { name: 'Figma', level: 65 },
    ];

    const marqueeItems = [
        'React', 'Next.js', 'Node.js', 'Flutter', 'JavaScript',
        'TypeScript', 'MongoDB', 'MySQL', 'Tailwind', 'Express',
        'AI / LLM', 'Prompt Engineering', 'Git', 'Vite', 'Supabase',
        'Framer Motion', 'REST APIs', 'Figma', 'Vercel',
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
                        <i className="fa-solid fa-code"></i> {s.tag}
                    </div>
                    <h1 className="section-title">{s.title}</h1>
                    <p className="section-subtitle">{s.subtitle}</p>
                </div>

                <div className="skills-container">
                    <div className="skills-left reveal-left" ref={leftRef}>
                        <h3>{s.proficiency}</h3>
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
                        {TECHS.map((tech, i) => (
                            <div className="tech-pill" key={i} onMouseMove={handlePillMove}>
                                <i className={`${tech.icon} tech-pill-icon`}></i>
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
