import { useEffect } from 'react';
import { useReveal } from './hooks';
import { useLanguage } from './context/LanguageContext';
import SkillsGlobe from './SkillsGlobe';

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
    { icon: 'fa-brands fa-python', name: 'Python' },
    { icon: 'fa-solid fa-database', name: 'PostgreSQL' },
    { icon: 'fa-solid fa-plug', name: 'Socket.io' },
    { icon: 'fa-solid fa-key', name: 'JWT / OAuth' },
    { icon: 'fa-solid fa-comment-dots', name: 'Prompt Engineering' },
];

function Skill() {
    const headingRef = useReveal();
    const leftRef = useReveal();
    const rightRef = useReveal();
    const { t } = useLanguage();

    // run the orb waves only while the card is on screen
    useEffect(() => {
        const el = leftRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => el.classList.toggle('orbs-live', e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, [leftRef]);
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
                    <div className="skills-left skills-orbs reveal-left" ref={leftRef}>
                        <h3>{s.proficiency}</h3>
                        <ul className="orb-grid">
                            {skills.map((skill, i) => (
                                <li className="orb-item" key={skill.name} style={{ '--lv': skill.level, '--i': i }}>
                                    <div className="orb" role="img" aria-label={`${skill.name}: ${skill.level}%`}>
                                        <div className="orb-fill"><span className="orb-wave"></span><span className="orb-wave orb-wave--2"></span></div>
                                        <span className="orb-num">{skill.level}%</span>
                                    </div>
                                    <span className="orb-name">{skill.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="skills-right-globe reveal" ref={rightRef}>
                        <SkillsGlobe techs={TECHS} />
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
