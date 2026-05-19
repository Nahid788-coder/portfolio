import { useState, useEffect, useRef } from 'react';
import { useReveal } from './hooks';

function Protfolio() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const headRef = useReveal();
    const filterRef = useReveal();
    const gridRef = useReveal();
    const cardRefs = useRef([]);

    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, filtered.length);
        const observers = [];
        cardRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.opacity = '0';
            el.style.transform = 'translateY(70px)';
            el.style.transition = `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`;
            const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    obs.unobserve(el);
                }
            }, { threshold: 0.08 });
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [filtered.length]);

    const BASE = 'https://nahid788-coder.github.io/live-designs';
    const projects = [
        {
            image: '/image/organick.png',
            title: 'Harvest Co.',
            category: 'E-Commerce',
            link: `${BASE}/organick/`,
            description: 'Premium farm-to-table organic produce platform with Subscription Box Builder (pick size, frequency, items with live price). Full-stack — React + Node + MongoDB. Editorial cream + sage + terracotta palette.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Subscription Box Builder', 'Product Catalog', 'Recipes CMS', 'Admin Dashboard'],
            featured: true,
        },
        {
            image: '/image/andia.png',
            title: 'Lyric Studio',
            category: 'Agency',
            link: `${BASE}/andia/`,
            description: 'Awwwards-tier creative agency platform with custom magnetic cursor, awwwards-style page transitions, case studies, careers, and admin dashboard. Built full-stack with React + Node + MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Custom Magnetic Cursor', 'Page Transitions', 'Case Studies CMS', 'Careers + Admin'],
        },
        {
            image: '/image/babun.png',
            title: 'Catalyst Consulting',
            category: 'Business',
            link: `${BASE}/babun/`,
            description: 'Premium financial advisory platform with interactive ROI calculator (live area chart with sliders), service booking, blog, and admin analytics dashboard. Full-stack — React + Node + MongoDB + JWT.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Recharts'],
            features: ['Live ROI Calculator', 'Booking System', 'Blog CMS', 'Admin Dashboard'],
        },
        {
            image: '/image/elegance.png',
            title: 'Vesper Journal',
            category: 'Web Design',
            link: `${BASE}/elegance/`,
            description: 'Editorial travel magazine + boutique stays platform with parallax storytelling (text + images move at different speeds), long-form articles, hotel booking with auto-tax, and admin newsroom dashboard. Full-stack — React + Node + MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Parallax Storytelling', 'Boutique Stays Booking', 'Editorial CMS', 'Newsroom Dashboard'],
            featured: true,
        },
        {
            image: '/image/pizza.png',
            title: 'Slice & Crust',
            category: 'Business',
            link: `${BASE}/pizza/`,
            description: 'Wood-fired pizzeria full-stack app with Pizza Customizer (size/crust/sauce/toppings), Razorpay payments, Socket.io live order tracking, table booking, and admin charts dashboard.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Razorpay', 'Socket.io'],
            features: ['Pizza Customizer', 'Razorpay Payments', 'Live Order Tracking', 'Admin Dashboard'],
        },
        {
            image: '/image/mfurniro.png',
            title: 'Verde Living',
            category: 'E-Commerce',
            link: `${BASE}/mfurniro/`,
            description: 'Premium furniture e-commerce with Room Visualizer (drag-drop furniture in 2D room), wishlist, reviews, full checkout flow, and admin product management. Light editorial theme.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Room Visualizer', 'Wishlist + Reviews', 'Full Checkout', 'Product CMS'],
        },
        {
            image: '/image/nisuka.png',
            title: 'Helix Industrial',
            category: 'Business',
            link: `${BASE}/nisuka/`,
            description: 'Industrial B2B platform with multi-step RFQ Calculator (live pricing with material/finish/lead-time multipliers + animated breakdown bars), product catalog, case studies, and sales pipeline dashboard. Bold modernist palette with extra animations. Full-stack — React + Node + MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Live RFQ Calculator', 'Product Catalog', 'Case Studies', 'Pipeline Dashboard'],
        },
        {
            image: '/image/studio-people.png',
            title: 'Atelier 9',
            category: 'Agency',
            link: `${BASE}/studio-people/`,
            description: 'Brutalist architecture & acoustics studio platform with sticky horizontal scroll showcase (no GSAP), project case studies, press archive, inquiries, and admin console. Black + bone editorial.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Framer Motion'],
            features: ['Horizontal Scroll Showcase', 'Project Detail Pages', 'Press Archive', 'Inquiry CMS'],
        },
    ];

    const filters = ['All', 'Web Design', 'Agency', 'Business', 'E-Commerce'];
    const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);

    const openModal = (p) => { setSelectedProject(p); document.body.style.overflow = 'hidden'; };
    const closeModal = () => { setSelectedProject(null); document.body.style.overflow = 'auto'; };

    return (
        <section className="protfolio" id="portfolio">
            <div className="protfolio-heading reveal" ref={headRef}>
                <div className="section-tag">
                    <i className="fa-solid fa-layer-group"></i> Portfolio
                </div>
                <h1 className="section-title">My Recent <span>Works</span></h1>
                <p className="section-subtitle">A collection of projects I've built and designed</p>
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

            <div className="portfolio-grid" ref={gridRef}>
                {filtered.map((project, index) => (
                    <div
                        className={`portfolio-item ${project.featured ? 'featured' : ''}`}
                        key={index}
                        ref={el => cardRefs.current[index] = el}
                    >
                        <img src={project.image} alt={project.title} />
                        <div className="portfolio-overlay">
                            <span className="portfolio-category">{project.category}</span>
                            <h3>{project.title}</h3>
                            <div className="portfolio-links">
                                <button onClick={() => openModal(project)} className="eye-btn" aria-label="View project">
                                    <i className="fa-solid fa-eye"></i>
                                </button>
                            </div>
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
                            <button className="modal-btn" onClick={() => alert("🚀 Coming Soon! Live demo will be available shortly.")}>
                                <i className="fa-solid fa-arrow-up-right-from-square"></i> View Live
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Protfolio;
