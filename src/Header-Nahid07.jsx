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

    useEffect(() => {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.6 + 0.4,
            opacity: Math.random() * 0.5 + 0.15,
            hue: Math.random() < 0.5 ? '108, 99, 255' : '255, 101, 132',
        }));

        let mouse = { x: -999, y: -999 };
        const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener('mousemove', onMove);

        let raf;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                const dxm = p.x - mouse.x, dym = p.y - mouse.y;
                const distM = Math.sqrt(dxm * dxm + dym * dym);
                if (distM < 130) {
                    const force = (130 - distM) / 130;
                    p.x += (dxm / distM) * force * 1.5;
                    p.y += (dym / distM) * force * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.hue}, ${p.opacity})`;
                ctx.fill();
            });

            particles.forEach((p, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p.x - p2.x, dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(108,99,255,${0.1 * (1 - dist / 130)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                });
            });
            raf = requestAnimationFrame(draw);
        }
        draw();

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

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
        const grow = () => follower.classList.add('grow');
        const shrink = () => follower.classList.remove('grow');
        window.addEventListener('mousemove', move);
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', grow);
            el.addEventListener('mouseleave', shrink);
        });

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
