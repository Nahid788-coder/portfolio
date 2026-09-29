import { useState, useEffect, useRef } from 'react';
import { useReveal } from './hooks';
import { useLanguage } from './context/LanguageContext';
import FlipCard from './FlipCard';

function Protfolio() {
    const [activeFilter, setActiveFilter] = useState('All');
    const headRef = useReveal();
    const filterRef = useReveal();
    const rowRefs = useRef([]);
    const { t } = useLanguage();
    const p = t.portfolio;

    const BASE = 'https://nahid788-coder.github.io/live-designs';
    const projects = [
        {
            image: '/image/aurora-chat.webp',
            title: 'Aurora AI ChatBot',
            category: 'TypeScript',
            link: 'https://ai-chatbot-one-bice-57.vercel.app',
            description: 'Multi-model AI chat app with 25+ live models (Groq, Gemini, OpenRouter), real-time streaming replies, Markdown and code blocks. API keys stay secure behind Vercel serverless functions; Supabase handles Google/OTP login and saved chat history.',
            technologies: ['React', 'TypeScript', 'Supabase', 'Vercel Functions', 'Groq / Gemini API'],
            features: ['25+ Live AI Models', 'Real-time Streaming', 'Secure Server-side API Keys', 'Searchable Chat History'],
        },
        {
            image: '/image/slice-and-crust.webp',
            title: 'Slice & Crust',
            category: 'Business',
            link: 'https://food-grid-app.vercel.app',
            description: 'Full-stack pizzeria app, live with its own API: pizza builder, cart and checkout with server-side pricing, Socket.io live order tracking, table booking, and an admin dashboard with charts (try the read-only Admin Demo).',
            technologies: ['React', 'Node.js', 'Express', 'MongoDB Atlas', 'Socket.io'],
            features: ['Pizza Customizer', 'Live Order Tracking', 'Secure Server Pricing', 'Admin Dashboard + Demo'],
        },
        {
            image: '/image/github-explorer.png',
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
    const filtered = activeFilter === 'All' ? projects : projects.filter(proj => proj.category === activeFilter);

    useEffect(() => {
        rowRefs.current = rowRefs.current.slice(0, filtered.length);
        const observers = [];
        rowRefs.current.forEach((el, i) => {
            if (!el) return;
            // rows swing in from their image side, like cards turning toward you
            const side = i % 2 ? 1 : -1;
            el.classList.remove('row-visible', 'row-in');
            el.style.opacity = '0';
            el.style.transform = `perspective(1400px) translateX(${side * 110}px) rotateY(${-side * 16}deg) scale(0.96)`;
            el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.05s, transform 1s cubic-bezier(0.22,1,0.36,1) 0.05s';
            const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('row-in');
                    el.style.opacity = '1';
                    el.style.transform = 'perspective(1400px) translateX(0) rotateY(0) scale(1)';
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


    return (
        <section className="protfolio" id="portfolio">
            <div className="protfolio-heading reveal" ref={headRef}>
                <div className="section-tag">
                    <i className="fa-solid fa-layer-group"></i> {p.tag}
                </div>
                <h1 className="section-title">{p.titleMain} <span>{p.titleSpan}</span></h1>
                <p className="section-subtitle">{p.subtitle}</p>
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
                    <FlipCard
                        key={project.title}
                        project={project}
                        index={index}
                        p={p}
                        cardRef={el => rowRefs.current[index] = el}
                    />
                ))}
            </div>

        </section>
    );
}

export default Protfolio;
