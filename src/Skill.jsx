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
    const rightRef = useReveal();
    const { t } = useLanguage();

    const s = t.skill;


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

                <div className="skills-container skills-container--globe">
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
