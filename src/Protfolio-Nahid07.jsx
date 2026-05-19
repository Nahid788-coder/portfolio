import { useState, useEffect, useRef } from 'react';
import { useReveal } from './hooks';

function useStairReveal(count) {
  const refs = useRef([]);
  useEffect(() => {
    const observers = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(80px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.13}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.13}s`;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [count]);
  return refs;
}

function Protfolio() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const headRef = useReveal();
    const filterRef = useReveal();
    const gridRef = useReveal();
    const cardRefs = useStairReveal(filtered.length);

    const BASE = 'https://nahid788-coder.github.io/live-designs';
    const projects = [
        {
            image: '/image/organick.png',
            title: 'Organick',
            category: 'Web Design',
            link: `${BASE}/organick/`,
            description: 'Premium organic food store website offering fresh, healthy, and sustainably sourced products with a clean, appetizing design.',
            technologies: ['HTML', 'CSS', 'Bootstrap', 'Responsive'],
            features: ['Responsive Design', 'Product Catalog', 'Shopping Cart', 'User Auth'],
            featured: true,
        },
        {
            image: '/image/andia.png',
            title: 'Andia',
            category: 'Agency',
            link: `${BASE}/andia/`,
            description: 'Super cool design agency website with stunning portfolio showcases and creative service offerings.',
            technologies: ['HTML', 'CSS', 'Grid', 'Responsive'],
            features: ['Parallax Effects', 'Portfolio Gallery', 'Contact Form', 'Animations'],
        },
        {
            image: '/image/babun.png',
            title: 'Babun',
            category: 'Business',
            link: `${BASE}/babun/`,
            description: 'Professional business consulting website with solutions to address financial issues and help businesses grow.',
            technologies: ['HTML', 'CSS', 'Grid', 'Responsive'],
            features: ['Service Listings', 'Team Section', 'Testimonials', 'Booking'],
        },
        {
            image: '/image/elegance.png',
            title: 'Elegance',
            category: 'Web Design',
            link: `${BASE}/elegance/`,
            description: 'Awesome parallax template featuring 100% responsive flat design with retina-ready graphics.',
            technologies: ['HTML', 'CSS', 'Responsive'],
            features: ['Parallax Scrolling', 'Portfolio Section', 'Team Members', 'Retina Ready'],
            featured: true,
        },
        {
            image: '/image/pizza.png',
            title: 'Pizza Restaurant',
            category: 'Business',
            link: `${BASE}/pizza/`,
            description: 'Delicious pizza restaurant website with appetizing design, featuring menu cards and table booking functionality.',
            technologies: ['HTML', 'CSS', 'Grid', 'Responsive'],
            features: ['Online Menu', 'Table Booking', 'Gallery', 'Location Map'],
        },
        {
            image: '/image/mfurniro.png',
            title: 'MFurniro',
            category: 'E-Commerce',
            link: `${BASE}/mfurniro/`,
            description: 'Modern furniture e-commerce website helping customers discover new collections with an elegant shopping experience.',
            technologies: ['HTML', 'CSS', 'Bootstrap', 'Responsive'],
            features: ['Product Filtering', 'Wishlist', 'Checkout', 'Reviews'],
        },
        {
            image: '/image/nisuka.png',
            title: 'Nisuka',
            category: 'Business',
            link: `${BASE}/nisuka/`,
            description: 'Industrial company website committed to delivering excellence in products and solutions for various industries.',
            technologies: ['HTML', 'CSS', 'Grid', 'Responsive'],
            features: ['Product Showcase', 'Solutions Page', 'Why Choose Us', 'Portal'],
        },
        {
            image: '/image/studio-people.png',
            title: 'Studio People',
            category: 'Agency',
            link: `${BASE}/studio-people/`,
            description: 'Professional acoustics and interior design studio website with superior sound quality and elegant spaces.',
            technologies: ['HTML', 'CSS', 'Bootstrap', 'Responsive'],
            features: ['Project Gallery', 'Service Details', 'Image Slider', 'Contact'],
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
                            <a href={selectedProject.link} className="modal-btn" target="_blank" rel="noopener noreferrer">
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
