import { useRef, useState } from 'react';

/*
  3D flip card for a project.
  Drag or swipe sideways and the card turns over in that direction;
  the back holds the full details and the live link.
  Buttons do the same for keyboard and tap users.
*/
const FLIP_AT = 70;      // px of drag needed to flip
const DRAG_TO_DEG = 0.6; // how far the card follows the finger while dragging

export default function FlipCard({ project, index, p, cardRef }) {
  const [angle, setAngle] = useState(0);   // always a multiple of 180 at rest
  const [drag, setDrag] = useState(null);  // live drag offset in degrees
  const start = useRef(null);
  const moved = useRef(false);

  const showingBack = Math.round(angle / 180) % 2 !== 0;

  const flip = (dir) => setAngle((a) => a + dir * 180);

  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('a, button')) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: null };
    moved.current = false;
  };
  const onPointerMove = (e) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
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

  const live = drag !== null;
  const rot = angle + (drag || 0);

  return (
    <div
      className={`p-flip${live ? ' is-dragging' : ''}${showingBack ? ' is-back' : ''}`}
      ref={cardRef}
      onPointerDown={onPointerDown}
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
