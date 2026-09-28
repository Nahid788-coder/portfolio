import { useEffect, useRef } from 'react';

/*
  A draggable 3D globe of skill chips (plain DOM, no WebGL).
  Chips sit on a Fibonacci sphere; the one facing you is highlighted.
  Drag sideways to spin it, let go and it keeps turning on its own.
*/
export default function SkillsGlobe({ techs }) {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chips = [...stage.querySelectorAll('.globe-chip')];
    const n = chips.length;
    const pts = chips.map((el, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, el, w: 0, h: 0 };
    });
    const measure = () => pts.forEach((p) => { p.w = p.el.offsetWidth; p.h = p.el.offsetHeight; });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    const auto = reduced ? 0 : 0.004;
    let rx = -0.3, ry = 0, vx = 0, vy = auto;
    let dragging = false, lx = 0, ly = 0;
    const down = (e) => { dragging = true; lx = e.clientX; ly = e.clientY; };
    const move = (e) => {
      if (!dragging) return;
      vy = (e.clientX - lx) * 0.006;
      vx = (e.clientY - ly) * -0.004;
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => { dragging = false; };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '120px' });
    io.observe(stage);

    let front = null;
    const draw = () => {
      const W = stage.clientWidth, H = stage.clientHeight;
      // stretch into an oval on wide boxes so the chips use the full width
      const Ry = H * 0.38;
      const Rx = Math.min(W * 0.42, Ry * 1.9, W / 2 - 64);
      const R = Ry;
      const f = R * 2.6;
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
      let best = null, bestZ = -9;
      pts.forEach((p) => {
        const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
        const sc = f / (f - z2 * R);
        const depth = (z2 + 1) / 2;
        p.el.style.transform = `translate(${x1 * Rx * sc - p.w / 2}px, ${y2 * Ry * sc - p.h / 2}px) scale(${0.6 + 0.5 * depth})`;
        p.el.style.opacity = (0.2 + 0.8 * depth).toFixed(3);
        p.el.style.zIndex = String(Math.round(depth * 100));
        if (z2 > bestZ) { bestZ = z2; best = p; }
      });
      if (best !== front) {
        front?.el.classList.remove('is-front');
        best?.el.classList.add('is-front');
        front = best;
      }
    };

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      if (!dragging) {
        vy += (auto - vy) * 0.02;
        vx *= 0.94;
      }
      ry += vy;
      rx = Math.max(-1.1, Math.min(1.1, rx + vx));
      draw();
    };
    draw();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [techs.length]);

  return (
    <div className="skills-globe" ref={stageRef} aria-label="Technologies I work with">
      <div className="globe-core" aria-hidden="true"></div>
      {techs.map((tech) => (
        <span className="globe-chip" key={tech.name}>
          <i className={tech.icon} aria-hidden="true"></i> {tech.name}
        </span>
      ))}
    </div>
  );
}
