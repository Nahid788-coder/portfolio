import { useEffect, useRef, useState } from 'react';

/*
  "My Stack" card: tabs with a sliding glass pill, and a clean list of
  tools per tab. Levels come from Nahid's own proficiency numbers,
  shown as words and dots instead of percentages.
*/
const GROUPS = [
  {
    id: 'front',
    label: 'Frontend',
    items: [
      { name: 'React.js', icon: 'fa-brands fa-react', level: 85 },
      { name: 'Tailwind CSS', icon: 'fa-solid fa-wind', level: 90 },
      { name: 'HTML / CSS', icon: 'fa-brands fa-html5', level: 95 },
      { name: 'JavaScript', icon: 'fa-brands fa-js', level: 82 },
      { name: 'TypeScript', icon: 'fa-solid fa-file-code', level: 78 },
      { name: 'Framer Motion', icon: 'fa-solid fa-wand-magic-sparkles', level: 75 },
      { name: 'Next.js', icon: 'fa-solid fa-layer-group', level: 68 },
    ],
  },
  {
    id: 'back',
    label: 'Backend & Data',
    items: [
      { name: 'REST APIs', icon: 'fa-solid fa-link', level: 82 },
      { name: 'SQL / MongoDB', icon: 'fa-solid fa-database', level: 75 },
      { name: 'Express.js', icon: 'fa-solid fa-server', level: 72 },
      { name: 'Node.js', icon: 'fa-brands fa-node-js', level: 70 },
      { name: 'Supabase', icon: 'fa-solid fa-bolt-lightning', level: 70 },
    ],
  },
  {
    id: 'tools',
    label: 'Mobile & Tools',
    items: [
      { name: 'Git / GitHub', icon: 'fa-brands fa-git-alt', level: 85 },
      { name: 'Flutter', icon: 'fa-solid fa-mobile-screen-button', level: 72 },
      { name: 'Figma', icon: 'fa-brands fa-figma', level: 65 },
    ],
  },
];

const dotsFor = (level) => Math.max(1, Math.min(5, Math.round(level / 20)));
const wordFor = (dots) => (dots >= 5 ? 'Advanced' : dots === 4 ? 'Proficient' : 'Working knowledge');

export default function StackCard({ title }) {
  const [tab, setTab] = useState(0);
  const tabsRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const touched = useRef(false);
  const rootRef = useRef(null);

  // slide the glass pill under the active tab
  useEffect(() => {
    const measure = () => {
      const btn = tabsRef.current?.children[tab + 1];
      if (btn) setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tabsRef.current) ro.observe(tabsRef.current);
    return () => ro.disconnect();
  }, [tab]);

  // gently cycle the tabs while the card is on screen, until someone picks one
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.5 });
    if (rootRef.current) io.observe(rootRef.current);
    const id = setInterval(() => {
      if (visible && !touched.current) setTab((t) => (t + 1) % GROUPS.length);
    }, 5000);
    return () => { clearInterval(id); io.disconnect(); };
  }, []);

  const pick = (i) => { touched.current = true; setTab(i); };
  const group = GROUPS[tab];

  return (
    <div className="stack-card" ref={rootRef}>
      <div className="stack-head">
        <h3>{title}</h3>
        <span className="stack-count">{group.items.length} tools</span>
      </div>

      <div className="stack-tabs" role="tablist" ref={tabsRef}>
        <span className="stack-pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} aria-hidden="true" />
        {GROUPS.map((g, i) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`stack-tab-${g.id}`}
            aria-selected={i === tab}
            aria-controls="stack-panel"
            className={i === tab ? 'is-active' : ''}
            onClick={() => pick(i)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <ul className="stack-list" role="tabpanel" id="stack-panel" aria-labelledby={`stack-tab-${group.id}`} key={group.id}>
        {group.items.map((it, i) => {
          const d = dotsFor(it.level);
          return (
            <li className="stack-row" key={it.name} style={{ '--i': i }}>
              <span className="stack-icon"><i className={it.icon} aria-hidden="true"></i></span>
              <span className="stack-name">{it.name}</span>
              <span className="stack-level">{wordFor(d)}</span>
              <span className="stack-dots" aria-label={`${d} out of 5`}>
                {[0, 1, 2, 3, 4].map((k) => <i key={k} className={k < d ? 'on' : ''} />)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
