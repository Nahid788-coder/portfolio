import { useState, useEffect, useRef } from 'react';
import { useReveal } from './hooks';

function Protfolio() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const headRef = useReveal();
    const filterRef = useReveal();
    const rowRefs = useRef([]);

    const BASE = 'https://nahid788-coder.github.io/live-designs';
    const projects = [
        {
            image: '/image/github-explorer.png',
            title: 'AI ChatBot',
            category: 'TypeScript',
            link: 'https://ai-chatbot-one-bice-57.vercel.app',
            description: 'Multi-model AI chat app with 10+ free AI models (Groq, Gemini), Google login, email/phone auth, OTP verification, and full chat history saved to Supabase database.',
            technologies: ['React', 'TypeScript', 'Supabase', 'Groq API', 'Gemini API'],
            features: ['10+ AI Models', 'Google Login + OTP Auth', 'Chat History (Supabase)', 'Real-time Streaming'],
        },
        {
            image: '/image/ai-chatbot.png',
            title: 'GitHub Explorer',
            category: 'TypeScript',
            link: 'https://github-explorer-ashen-two.vercel.app',
            description: 'GitHub profile explorer built with React + TypeScript. Search any GitHub user to view their profile, repositories, stars, languages, and activity stats in real-time.',
            technologies: ['React', 'TypeScript', 'GitHub API', 'Vite'],
            features: ['User Profile Search', 'Repository Explorer', 'Language Filter', 'Sort by Stars / Updated'],
        },
        {
            image: '/image/organick.png',
            title: 'Harvest Co.',
            category: 'E-Commerce',
            link: `${BASE}/organick/`,
            description: 'Farm-to-table organic produce platform with a Subscription Box Builder — live pricing, size & frequency picker. Full-stack React + Node + MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Subscription Box Builder', 'Product Catalog', 'Recipes CMS', 'Admin Dashboard'],
        },
        {
            image: '/image/andia.png',
            title: 'Lyric Studio',
            category: 'Agency',
            link: `${BASE}/andia/`,
            description: 'Awwwards-tier creative agency with magnetic cursor, animated page transitions, case study CMS, careers section, and full admin dashboard.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Magnetic Cursor', 'Page Transitions', 'Case Studies CMS', 'Careers + Admin'],
        },
        {
            image: '/image/babun.png',
            title: 'Catalyst Consulting',
            category: 'Business',
            link: `${BASE}/babun/`,
            description: 'Financial advisory platform with an interactive ROI calculator (live area chart + sliders), service booking, blog CMS, and analytics dashboard.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Recharts'],
            features: ['Live ROI Calculator', 'Booking System', 'Blog CMS', 'Admin Analytics'],
        },
        {
            image: '/image/elegance.png',
            title: 'Vesper Journal',
            category: 'Web Design',
            link: `${BASE}/elegance/`,
            description: 'Editorial travel magazine with parallax storytelling, long-form article CMS, boutique hotel booking with auto-tax, and newsroom admin dashboard.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Parallax Storytelling', 'Boutique Booking', 'Editorial CMS', 'Newsroom Dashboard'],
        },
        {
            image: '/image/pizza.png',
            title: 'Slice & Crust',
            category: 'Business',
            link: `${BASE}/pizza/`,
            description: 'Pizzeria app with full Pizza Customizer, Razorpay payments, Socket.io live order tracking, table booking system, and admin charts dashboard.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
            features: ['Pizza Customizer', 'Razorpay Payments', 'Live Order Tracking', 'Admin Dashboard'],
        },
        {
            image: '/image/mfurniro.png',
            title: 'Verde Living',
            category: 'E-Commerce',
            link: `${BASE}/mfurniro/`,
            description: 'Premium furniture store with a drag-and-drop 2D Room Visualizer, wishlist, reviews, full checkout flow, and admin product management.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['2D Room Visualizer', 'Wishlist + Reviews', 'Full Checkout', 'Product CMS'],
        },
        {
            image: '/image/nisuka.png',
            title: 'Helix Industrial',
            category: 'Business',
            link: `${BASE}/nisuka/`,
            description: 'Industrial B2B platform with a multi-step RFQ Calculator, live pricing breakdowns, product catalog, case studies, and sales pipeline dashboard.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Live RFQ Calculator', 'Product Catalog', 'Case Studies', 'Pipeline Dashboard'],
        },
        {
            image: '/image/studio-people.png',
            title: 'Atelier 9',
            category: 'Agency',
            link: `${BASE}/studio-people/`,
            description: 'Architecture & acoustics studio with sticky horizontal scroll showcase, project case studies, press archive, inquiry system, and admin console.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Horizontal Scroll', 'Project Case Studies', 'Press Archive', 'Inquiry CMS'],
        },
    ];

    const filters = ['All', 'TypeScript', 'Web Design', 'Agency', 'Business', 'E-Commerce'];
    const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);

    useEffect(() => {
        rowRefs.current = rowRefs.current.slice(0, filtered.length);
        const observers = [];
        rowRefs.current.forEach((el, i) => {
            if (!el) return;
            el.classList.remove('row-visible');
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 0.09}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 0.09}s`;
            const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.addEventListener('transitionend', () => {
                        el.style.opacity = '';
                        el.style.transform = '';
                        el.style.transition = '';
                        el.classList.add('row-visible');
                    }, { once: true });
                    obs.unobserve(el);
                }
            }, { threshold: 0.06 });
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [filtered.length]);

    const openModal = (p) => { setSelectedProject(p); document.body.style.overflow = 'hidden'; };
    const closeModal = () => { setSelectedProject(null); document.body.style.overflow = 'auto'; };

    return (
        <section className="protfolio" id="portfolio">
            <div className="protfolio-heading reveal" ref={headRef}>
                <div className="section-tag">
                    <i className="fa-solid fa-layer-group"></i> Portfolio
                </div>
                <h1 className="section-title">Selected <span>Projects</span></h1>
                <p className="section-subtitle">Full-stack applications I've designed, engineered, and shipped</p>
            </div>

            <div className="portfolio-filter reveal" ref={filterRef}>
                {filters.map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="portfolio-list">
                {filtered.map((project, index) => (
                    <div
                        className={`p-row ${index % 2 !== 0 ? 'p-row--reverse' : ''}`}
                        key={project.title}
                        ref={el => rowRefs.current[index] = el}
                    >
                        <div className="p-row__img">
                            <img src={project.image} alt={project.title} loading="lazy" />
                            <span className="p-row__num">{String(index + 1).padStart(2, '0')}</span>
                        </div>

                        <div className="p-row__body">
                            <span className="p-row__cat">{project.category}</span>
                            <h3 className="p-row__title">{project.title}</h3>
                            <p className="p-row__desc">{project.description}</p>
                            <div className="p-row__tech">
                                {project.technologies.map((t, i) => (
                                    <span key={i}>{t}</span>
                                ))}
                            </div>
                            <button onClick={() => openModal(project)} className="p-row__btn">
                                View Project
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProject && (
                <div className="project-modal-overlay" onClick={closeModal}>
                    <div className="project-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="modal-image">
                            <img src={selectedProject.image} alt={selectedProject.title} />
                        </div>
                        <div className="modal-content">
                            <span className="modal-category">{selectedProject.category}</span>
                            <h2>{selectedProject.title}</h2>
                            <p className="modal-description">{selectedProject.description}</p>
                            <div className="modal-section">
                                <h4><i className="fa-solid fa-code"></i> Technologies</h4>
                                <div className="tech-tags">
                                    {selectedProject.technologies.map((t, i) => (
                                        <span key={i} className="tech-tag">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-section">
                                <h4><i className="fa-solid fa-star"></i> Key Features</h4>
                                <ul className="features-list">
                                    {selectedProject.features.map((f, i) => (
                                        <li key={i}><i className="fa-solid fa-check"></i> {f}</li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                className="modal-btn"
                                href={selectedProject.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fa-solid fa-arrow-up-right-from-square"></i> View Live
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Protfolio;
