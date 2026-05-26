import { useEffect } from 'react';
import { useTyped, useTilt, useMagnetic, useCounter, applyRipple } from './hooks';
import { useLanguage } from './context/LanguageContext';

/* Sub-component so key={lang} remounts only the typing animation */
function RoleTyper({ words, lang }) {
    const role = useTyped(words, { typeSpeed: 80, deleteSpeed: 40, pause: 1500 });
    return <span className="role-type">{role}</span>;
}

function Header() {
    const { lang, t } = useLanguage();
    const h = t.header;

    const cardTilt = useTilt(14);
    const hireRef = useMagnetic(0.3);
    const viewRef = useMagnetic(0.3);

    const [yearRef, yearVal] = useCounter(1, { suffix: '+' });
    const [projRef, projVal] = useCounter(8, { suffix: '+' });
    const [techRef, techVal] = useCounter(5, { suffix: '+' });

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
                            {h.badge}
                        </div>
                        <h1>
                            <span className="line1">{h.line1}</span>
                            <span className="line2 shine-text">{h.line2}</span>
                        </h1>
                        <h3>
                            {h.rolePrefix} <RoleTyper words={h.roles} key={lang} />
                        </h3>
                        <p>{h.para}</p>
                        <div className="header-btns">
                            <button
                                ref={hireRef}
                                className="btn-primary magnetic ripple"
                                onClick={(e) => { applyRipple(e); scrollTo('contact'); }}
                            >
                                <i className="fa-solid fa-paper-plane"></i> {h.hireBtn}
                            </button>
                            <button
                                ref={viewRef}
                                className="btn-secondary magnetic ripple"
                                onClick={(e) => { applyRipple(e); scrollTo('portfolio'); }}
                            >
                                <i className="fa-solid fa-eye"></i> {h.viewBtn}
                            </button>
                        </div>
                        <div className="header-stats">
                            <div className="stat-item" ref={yearRef}>
                                <div className="stat-num">{yearVal}</div>
                                <div className="stat-label">{h.statYear}</div>
                            </div>
                            <div className="stat-item" ref={projRef}>
                                <div className="stat-num">{projVal}</div>
                                <div className="stat-label">{h.statProjects}</div>
                            </div>
                            <div className="stat-item" ref={techRef}>
                                <div className="stat-num">{techVal}</div>
                                <div className="stat-label">{h.statTech}</div>
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
                    <span>{h.scroll}</span>
                    <div className="mouse"></div>
                </div>
            </header>
        </>
    );
}

export default Header;
