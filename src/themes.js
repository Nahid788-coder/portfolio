/*
  Colour themes. One place for both the page (CSS variables) and the 3D scene.
  Pick a theme by changing DEFAULT_THEME, or preview any theme with ?theme=<name> in the URL.
*/

export const DEFAULT_THEME = 'mocha';

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

export const THEMES = {
  /* warm coffee and milk (first version) */
  mocha: {
    label: 'Mocha',
    css: {
      bg: '#eae0d2', ink: '#2a1b12', ink2: '#5c4332', muted: '#6f5746',
      accent: '#7a4b2e', accentLight: '#a56f47', accent2: '#c08a5b', accentMid: '#8a5a3b',
      btnTop: '#54351f', btnTopHover: '#6b4428', btnBotHover: '#3a2418',
      glint1: '#e8c9a5', glint2: '#d9ab7e', onDark: '#fbf3e8',
      glassHi: '#fffdfa', glassLo: '#fff8f0', shadow: '#4a2c1a',
    },
    scene: {
      base: '#ece2d4', c1: '#e9cca9', c2: '#c99a70', c3: '#9e6b4a',
      tintA: '#b8845a', tintB: '#c99a6e', sky: '#fff4e6', ground: '#8a5a3b', rim: '#e9b98a', glass: '#fffaf3',
    },
  },

  /* pearl white and ocean blue: the most "water" look */
  ocean: {
    label: 'Pearl Ocean',
    css: {
      bg: '#e7eef3', ink: '#0d2234', ink2: '#2f4c66', muted: '#566f85',
      accent: '#1c6aa3', accentLight: '#3d8fcc', accent2: '#6fb8e0', accentMid: '#2b7cb8',
      btnTop: '#1d4f7a', btnTopHover: '#2a6597', btnBotHover: '#123655',
      glint1: '#bfe3f7', glint2: '#8ccbeb', onDark: '#f2f8fc',
      glassHi: '#fdfeff', glassLo: '#f1f7fb', shadow: '#12304a',
    },
    scene: {
      base: '#e9f0f5', c1: '#cfe6f3', c2: '#8fc8e6', c3: '#3f8cc4',
      tintA: '#5aa7d6', tintB: '#8fcbea', sky: '#f4fbff', ground: '#2b6a96', rim: '#9fd6f2', glass: '#f7fcff',
    },
  },

  /* soft sage green and sand: calm, natural */
  sage: {
    label: 'Sage',
    css: {
      bg: '#e6eae1', ink: '#16231a', ink2: '#3c5242', muted: '#5f7466',
      accent: '#3b7552', accentLight: '#5f9c76', accent2: '#9cc4a0', accentMid: '#4a855f',
      btnTop: '#2f5c41', btnTopHover: '#3d7253', btnBotHover: '#1e3d2b',
      glint1: '#d6ead3', glint2: '#b0d3b0', onDark: '#f3f8f2',
      glassHi: '#fefffd', glassLo: '#f4f8f1', shadow: '#1d3325',
    },
    scene: {
      base: '#e8ece3', c1: '#dde7d2', c2: '#a9c9a3', c3: '#6a9d7b',
      tintA: '#79ad88', tintB: '#a8cfae', sky: '#f7fff4', ground: '#3f6b4f', rim: '#c3e3bd', glass: '#fbfffa',
    },
  },

  /* lavender and violet with a peach glow: modern, techy */
  iris: {
    label: 'Iris',
    css: {
      bg: '#ebe8f3', ink: '#1b1630', ink2: '#453c66', muted: '#6a6288',
      accent: '#5a49c2', accentLight: '#7f70de', accent2: '#b9adf0', accentMid: '#6756cf',
      btnTop: '#3e3190', btnTopHover: '#5041ab', btnBotHover: '#2a2066',
      glint1: '#ddd6fb', glint2: '#f3c9b8', onDark: '#f6f4ff',
      glassHi: '#fefdff', glassLo: '#f6f3fc', shadow: '#241c4a',
    },
    scene: {
      base: '#ece9f4', c1: '#f1d3c6', c2: '#b9adec', c3: '#7c6bd4',
      tintA: '#9585ec', tintB: '#c3b8f5', sky: '#fbf9ff', ground: '#4b3e9a', rim: '#f2c4b2', glass: '#fbfaff',
    },
  },
};

export function getThemeName() {
  try {
    const q = new URLSearchParams(window.location.search).get('theme');
    if (q && THEMES[q]) return q;
  } catch { /* ignore */ }
  return DEFAULT_THEME;
}

export function getTheme() {
  return THEMES[getThemeName()];
}

/* Write the theme's CSS variables onto <html>. Runs once at startup. */
export function applyTheme() {
  const { css } = getTheme();
  const r = document.documentElement.style;
  const set = (k, v) => r.setProperty(k, v);
  set('--bg', css.bg);
  set('--ink', css.ink);
  set('--ink-2', css.ink2);
  set('--text', css.ink);
  set('--text-muted', css.muted);
  set('--accent', css.accent);
  set('--accent-light', css.accentLight);
  set('--accent2', css.accent2);
  set('--accent3', css.accent);
  set('--accent-mid', css.accentMid);
  set('--btn-top', css.btnTop);
  set('--btn-top-hover', css.btnTopHover);
  set('--btn-bot-hover', css.btnBotHover);
  set('--glint1', css.glint1);
  set('--glint2', css.glint2);
  set('--on-dark', css.onDark);
  set('--ink-rgb', hexToRgb(css.ink));
  set('--ink2-rgb', hexToRgb(css.ink2));
  set('--accent-rgb', hexToRgb(css.accent));
  set('--accent-light-rgb', hexToRgb(css.accentLight));
  set('--shadow-rgb', hexToRgb(css.shadow));
  set('--glass-hi-rgb', hexToRgb(css.glassHi));
  set('--glass-lo-rgb', hexToRgb(css.glassLo));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', css.bg);
}
