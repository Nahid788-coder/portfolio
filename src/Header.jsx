import { useEffect } from 'react';
import { useTyped, useTilt, useMagnetic, useCounter, applyRipple } from './hooks';

const ROLE_WORDS = ['Full Stack Developer', 'AI Enthusiast', 'React.js Engineer', 'Mobile App Builder'];

function Header() {
    const role = useTyped(ROLE_WORDS, { typeSpeed: 80, deleteSpeed: 40, pause: 1500 });

    const cardTilt = useTilt(14);
    const hireRef = useMagnetic(0.3);
    const viewRef = useMagnetic(0.3);

    const [yearRef, yearVal] = useCounter(1, { suffix: '+' });
    const [projRef, projVal] = useCounter(8, { suffix: '+' });
    const [techRef, techVal] = useCounter(5, { suffix: '+' });

    // canvas not used in this theme

    useEffect(() => {
        if (window.matchMedia('(hover: none)').matches) return;
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        const follower = document.createElement('div');
        follower.className = 'cursor-follower';
        document.body.appendChild(cursor);
        document.body.appendChild(follower);

        let fx = 0, fy = 0, animating = false;
        const move = e => {
            cursor.style.left = e.clientX - 6 + 'px';
            cursor.style.top = e.clientY - 6 + 'px';
            if (!animating) {
                animating = true;
                const tick = () => {
                    fx += (parseFloat(cursor.style.left) - 14 - fx) * 0.12;
                    fy += (parseFloat(cursor.style.top) - 14 - fy) * 0.12;
                    follower.style.left = fx + 'px';
                    follower.style.top = fy + 'px';
                    requestAnimationFrame(tick);
                };
                tick();
            }
        };
        window.addEventListener('mousemove', move);
        return () => {
            window.removeEventListener('mousemove', move);
            cursor.remove();
            follower.remove();
        };
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <canvas id="bg-canvas"></canvas>
            <header className="header">
                <div className="header-bg-orb orb1"></div>
                <div className="header-bg-orb orb2"></div>
                <div className="header-bg-orb orb3"></div>

                <div className="header-content">
                    <div className="header-left">
                        <div className="header-badge">
                            <span className="dot"></span>
                            Available for freelance work
                        </div>
                        <h1>
                            <span className="line1">Hi, I'm Nahid</span>
                            <span className="line2 shine-text">Husain.</span>
                        </h1>
                        <h3>
                            I'm a <span className="role-type">{role}</span>
                        </h3>
                        <p>
                            I build high-performance web applications with modern technologies.
                            Passionate about clean code, great UX, and leveraging AI to ship faster.
                        </p>
                        <div className="header-btns">
                            <button
                                ref={hireRef}
                                className="btn-primary magnetic ripple"
                                onClick={(e) => { applyRipple(e); scrollTo('contact'); }}
                            >
                                <i className="fa-solid fa-paper-plane"></i> Hire Me
                            </button>
                            <button
                                ref={viewRef}
                                className="btn-secondary magnetic ripple"
                                onClick={(e) => { applyRipple(e); scrollTo('portfolio'); }}
                            >
                                <i className="fa-solid fa-eye"></i> View Work
                            </button>
                        </div>
                        <div className="header-stats">
                            <div className="stat-item" ref={yearRef}>
                                <div className="stat-num">{yearVal}</div>
                                <div className="stat-label">Year Exp.</div>
                            </div>
                            <div className="stat-item" ref={projRef}>
                                <div className="stat-num">{projVal}</div>
                                <div className="stat-label">Projects</div>
                            </div>
                            <div className="stat-item" ref={techRef}>
                                <div className="stat-num">{techVal}</div>
                                <div className="stat-label">Tech Stack</div>
                            </div>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="hero-3d-wrapper">
                            <div className="orbit-ring"></div>
                            <div className="orbit-ring r2"></div>
                            <div className="hero-3d-card tilt" ref={cardTilt}>
                                <div className="hero-card-inner">
                                    <span className="hero-card-icon tilt-inner">⚡</span>
                                </div>
                            </div>
                            <div className="hero-floating-chip chip1">
                                <span className="chip-dot green"></span>
                                React.js
                            </div>
                            <div className="hero-floating-chip chip2">
                                <span className="chip-dot blue"></span>
                                Node.js
                            </div>
                            <div className="hero-floating-chip chip3">
                                <span className="chip-dot pink"></span>
                                Next.js
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scroll-indicator" onClick={() => scrollTo('about')}>
                    <span>Scroll</span>
                    <div className="mouse"></div>
                </div>
            </header>
        </>
    );
}

export default Header;
