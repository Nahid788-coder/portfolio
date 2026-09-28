import { useEffect, useRef, useState } from 'react';

/*
  3D flip card for a project.
  Flip it over in the direction you move:
    - mouse: just sweep the cursor across the card quickly (no click needed),
    - touchpad: two-finger swipe sideways,
    - phone: swipe sideways; click-drag also works.
  The back holds the full details and the live link. Buttons do the same for keyboard users.
*/
const FLIP_AT = 70;      // px of drag needed to flip
const DRAG_TO_DEG = 0.6; // how far the card follows the finger while dragging
const SWEEP_PX = 150;    // mouse sweep: horizontal travel needed...
const SWEEP_MS = 320;    // ...within this time
const COOLDOWN_MS = 1000;

export default function FlipCard({ project, index, p, cardRef }) {
  const [angle, setAngle] = useState(0);   // always a multiple of 180 at rest
  const [drag, setDrag] = useState(null);  // live drag offset in degrees
  const start = useRef(null);
  const moved = useRef(false);
  const rootRef = useRef(null);
  const trail = useRef([]);
  const lastFlip = useRef(0);
  const [lean, setLean] = useState(0); // small hover lean that hints at the gesture

  const showingBack = Math.round(angle / 180) % 2 !== 0;

  const flip = (dir) => {
    lastFlip.current = performance.now();
    trail.current = [];
    setLean(0);
    setAngle((a) => a + dir * 180);
  };

  // mouse sweep (no button pressed): fast sideways movement flips the card
  const onMouseSweep = (e) => {
    if (e.pointerType !== 'mouse' || e.buttons !== 0) return;
    const now = performance.now();
    const r = e.currentTarget.getBoundingClientRect();
    setLean(((e.clientX - r.left) / r.width - 0.5) * 10);
    if (now - lastFlip.current < COOLDOWN_MS) return;
    const t = trail.current;
    t.push({ x: e.clientX, y: e.clientY, t: now });
    while (t.length && now - t[0].t > SWEEP_MS) t.shift();
    const dx = e.clientX - t[0].x, dy = e.clientY - t[0].y;
    if (Math.abs(dx) > SWEEP_PX && Math.abs(dx) > Math.abs(dy) * 2) flip(dx > 0 ? 1 : -1);
  };

  // state classes are toggled directly, so classes added by the section's
  // entrance observer (row-in, row-visible) survive re-renders
  useEffect(() => {
    rootRef.current?.classList.toggle('is-dragging', drag !== null);
    rootRef.current?.classList.toggle('is-back', showingBack);
  }, [drag, showingBack]);

  // touchpad two-finger swipe (horizontal wheel)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let acc = 0, timer = 0;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (performance.now() - lastFlip.current < COOLDOWN_MS) return;
      acc += e.deltaX;
      clearTimeout(timer);
      timer = setTimeout(() => { acc = 0; }, 200);
      if (Math.abs(acc) > 60) {
        const dir = acc > 0 ? -1 : 1; // fingers moving left scroll right
        acc = 0;
        lastFlip.current = performance.now();
        setLean(0);
        setAngle((a) => a + dir * 180);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); clearTimeout(timer); };
  }, []);

  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('a, button')) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: null };
    moved.current = false;
  };
  const onPointerMove = (e) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) { onMouseSweep(e); return; }
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (s.locked === null && Math.hypot(dx, dy) > 8) {
      // decide once: sideways = flip gesture, up/down = let the page scroll
      s.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (s.locked === 'x') e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (s.locked !== 'x') return;
    moved.current = true;
    setDrag(Math.max(-150, Math.min(150, dx * DRAG_TO_DEG)));
  };
  const end = (e) => {
    const s = start.current;
    start.current = null;
    if (!s || s.locked !== 'x') { setDrag(null); return; }
    const dx = e.clientX - s.x;
    setDrag(null);
    if (Math.abs(dx) > FLIP_AT) flip(dx > 0 ? 1 : -1);
  };

  const rot = angle + (drag ?? lean);

  return (
    <div
      className="p-flip"
      ref={(el) => { rootRef.current = el; cardRef(el); }}
      onPointerDown={onPointerDown}
      onPointerLeave={() => { trail.current = []; setLean(0); }}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="p-flip__inner" style={{ transform: `rotateY(${rot}deg)` }}>
        {/* front */}
        <div className={`p-row p-face p-face--front ${index % 2 !== 0 ? 'p-row--reverse' : ''}`} aria-hidden={showingBack} inert={showingBack}>
          <div className="p-row__img">
            <img src={project.image} alt={project.title} loading="lazy" draggable="false" />
            <span className="p-row__num">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className="p-row__body">
            <span className="p-row__cat">{project.category}</span>
            <h3 className="p-row__title">{project.title}</h3>
            <p className="p-row__desc">{project.description}</p>
            <div className="p-row__tech">
              {project.technologies.map((tech) => <span key={tech}>{tech}</span>)}
            </div>
            <div className="p-row__actions">
              <button type="button" onClick={() => flip(index % 2 ? -1 : 1)} className="p-row__btn">
                {p.viewProject}
                <i className="fa-solid fa-rotate"></i>
              </button>
              <span className="p-flip__hint" aria-hidden="true">
                <i className="fa-solid fa-arrows-left-right"></i> {p.swipeHint}
              </span>
            </div>
          </div>
        </div>

        {/* back */}
        <div className="p-face p-face--back" aria-hidden={!showingBack} inert={!showingBack}>
          <div className="p-back__main">
            <span className="p-row__cat">{p.aboutProject}</span>
            <h3 className="p-back__title">{project.title}</h3>
            <p className="p-back__desc">{project.description}</p>
            <h4 className="p-back__label"><i className="fa-solid fa-code"></i> {p.technologies}</h4>
            <div className="p-row__tech">
              {project.technologies.map((tech) => <span key={tech}>{tech}</span>)}
            </div>
          </div>
          <div className="p-back__side">
            <h4 className="p-back__label"><i className="fa-solid fa-star"></i> {p.keyFeatures}</h4>
            <ul className="p-back__features">
              {project.features.map((f) => <li key={f}><i className="fa-solid fa-check"></i> {f}</li>)}
            </ul>
            <div className="p-back__actions">
              <a className="p-back__live" href={project.link} target="_blank" rel="noopener noreferrer">
                <i className="fa-solid fa-arrow-up-right-from-square"></i> {p.viewLive}
              </a>
              <button type="button" className="p-row__btn" onClick={() => flip(index % 2 ? 1 : -1)}>
                <i className="fa-solid fa-rotate-left"></i> {p.flipBack}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
