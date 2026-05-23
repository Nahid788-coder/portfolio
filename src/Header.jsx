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

        const GRID = 72;
        let nodes = [], traces = [], raf;

        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const build = () => {
            nodes  = [];
            traces = [];
            const cols = Math.ceil(canvas.width  / GRID) + 1;
            const rows = Math.ceil(canvas.height / GRID) + 1;
            const map  = {};

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    if (Math.random() > 0.36) {
                        const n = {
                            x: c * GRID, y: r * GRID, c, r,
                            glow: Math.random() > 0.6,
                            phase: Math.random() * Math.PI * 2,
                            size: Math.random() > 0.8 ? 3 : 1.8,
                        };
                        nodes.push(n);
                        map[`${c},${r}`] = n;
                    }
                }
            }

            nodes.forEach(n => {
                const right  = map[`${n.c+1},${n.r}`];
                const bottom = map[`${n.c},${n.r+1}`];
                if (right  && Math.random() > 0.32)
                    traces.push({ a: n, b: right,  pulses: [], next: Math.random() * 3000 });
                if (bottom && Math.random() > 0.32)
                    traces.push({ a: n, b: bottom, pulses: [], next: Math.random() * 3000 });
            });
        };
        build();

        let last = 0;
        const draw = (now) => {
            const dt = Math.min(now - last, 60);
            last = now;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /* ── TRACES ── */
            traces.forEach(t => {
                /* base line */
                ctx.beginPath();
                ctx.moveTo(t.a.x, t.a.y);
                ctx.lineTo(t.b.x, t.b.y);
                ctx.strokeStyle = 'rgba(201,169,110,0.07)';
                ctx.lineWidth = 1;
                ctx.stroke();

                /* spawn pulses */
                t.next -= dt;
                if (t.next <= 0) {
                    t.pulses.push({ p: 0, spd: 0.00065 + Math.random() * 0.0009 });
                    t.next = 1800 + Math.random() * 4500;
                }

                /* move + draw pulses */
                t.pulses = t.pulses.filter(pk => pk.p < 1.05);
                t.pulses.forEach(pk => {
                    pk.p += pk.spd * dt;
                    const tp = Math.min(pk.p, 1);
                    const x  = t.a.x + (t.b.x - t.a.x) * tp;
                    const y  = t.a.y + (t.b.y - t.a.y) * tp;

                    /* glow halo */
                    const g = ctx.createRadialGradient(x, y, 0, x, y, 13);
                    g.addColorStop(0, 'rgba(223,192,144,0.65)');
                    g.addColorStop(1, 'rgba(201,169,110,0)');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI*2); ctx.fill();

                    /* trail */
                    const tx = x - (t.b.x - t.a.x) * 0.08;
                    const ty = y - (t.b.y - t.a.y) * 0.08;
                    const trail = ctx.createLinearGradient(tx, ty, x, y);
                    trail.addColorStop(0, 'rgba(201,169,110,0)');
                    trail.addColorStop(1, 'rgba(201,169,110,0.55)');
                    ctx.strokeStyle = trail;
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();

                    /* core dot */
                    ctx.fillStyle = '#dfc090';
                    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI*2); ctx.fill();
                });
            });

            /* ── NODES ── */
            nodes.forEach(n => {
                if (n.glow) {
                    const a = 0.12 + 0.18 * Math.sin(now * 0.0012 + n.phase);
                    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
                    g.addColorStop(0, `rgba(201,169,110,${a})`);
                    g.addColorStop(1, 'rgba(201,169,110,0)');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(n.x, n.y, 16, 0, Math.PI*2); ctx.fill();
                }
                /* node dot */
                ctx.fillStyle = `rgba(201,169,110,${n.glow ? 0.45 : 0.16})`;
                ctx.beginPath(); ctx.arc(n.x, n.y, n.size, 0, Math.PI*2); ctx.fill();

                /* cross hair on large nodes */
                if (n.size > 2) {
                    ctx.strokeStyle = 'rgba(201,169,110,0.22)';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(n.x - 7, n.y); ctx.lineTo(n.x + 7, n.y);
                    ctx.moveTo(n.x, n.y - 7); ctx.lineTo(n.x, n.y + 7);
                    ctx.stroke();
                }
            });

            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        const onResize = () => { resize(); build(); };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
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
