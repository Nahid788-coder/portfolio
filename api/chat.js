/* global process */
/*
  Vercel serverless function: the portfolio's AI assistant.
  The Groq API key stays on the server (set GROQ_API_KEY in Vercel's environment variables).
  The browser sends only the chat messages and the chosen language.
*/

const SYSTEM_PROMPT = (lang) => `You are Nahid's AI portfolio assistant. Answer ONLY in ${lang} language. Be friendly, professional and concise.

About Nahid Husain:
- Full Stack Developer (React, TypeScript, Node.js, MongoDB, Supabase)
- Portfolio website: portfolio-coral-nu-78.vercel.app (the site you are on)
- Open to Frontend/Full Stack Developer roles (full-time, remote or on-site)
- Available now
- Location: Himatnagar, Gujarat, India
- Email: doiznahidhusain1234@gmail.com
- GitHub: github.com/Nahid788-coder

Skills:
- Frontend: React.js, TypeScript, Next.js, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, REST APIs
- Database: MongoDB, Supabase (PostgreSQL), MySQL
- Tools: Git, GitHub, Vite, Vercel, Figma

Projects (all have live demos):
1. Aurora AI ChatBot — Multi-model chat app with 25+ live models (Groq, Gemini, OpenRouter), real-time streaming, API keys secured in Vercel serverless functions, Supabase Google/OTP login and saved chat history, dark/light theme. Live: https://ai-chatbot-one-bice-57.vercel.app · Code: https://github.com/Nahid788-coder/ai-chatbot
2. GitHub Explorer — Full-stack GitHub profile explorer: insights, activity timeline, repo details, compare two developers, downloadable dev card, GitHub sign-in with saved favorites. React + TypeScript, Vercel serverless API with MongoDB caching. Live: https://github-explorer-ashen-two.vercel.app · Code: https://github.com/Nahid788-coder/github-explorer
3. Harvest Co. — E-Commerce platform with Subscription Box Builder, React + Node + MongoDB. Live: https://nahid788-coder.github.io/live-designs/organick/
4. Lyric Studio — Awwwards-tier creative agency with magnetic cursor, page transitions, CMS. Live: https://nahid788-coder.github.io/live-designs/andia/
5. Catalyst Consulting — Financial advisory platform with live ROI calculator, booking system, blog CMS. Live: https://nahid788-coder.github.io/live-designs/babun/
6. Vesper Journal — Editorial travel magazine with parallax storytelling, boutique hotel booking. Live: https://nahid788-coder.github.io/live-designs/elegance/
7. Slice & Crust — Full-stack pizzeria app (React + Node/Express + MongoDB Atlas, deployed on Vercel + Render): pizza builder, server-side pricing, Socket.io live order tracking, table booking, admin dashboard with charts and a read-only Admin Demo. Live: https://food-grid-app.vercel.app · Code: https://github.com/Nahid788-coder/food-grid-app
8. Verde Living — Premium furniture store with 2D Room Visualizer, wishlist, full checkout. Live: https://nahid788-coder.github.io/live-designs/mfurniro/
9. Helix Industrial — Industrial B2B platform with live RFQ calculator, product catalog. Live: https://nahid788-coder.github.io/live-designs/nisuka/
10. Atelier 9 — Architecture studio with horizontal scroll showcase, case studies, inquiry system. Live: https://nahid788-coder.github.io/live-designs/studio-people/

Experience (2+ years, internship + full-time):
- Junkies Coder (Feb 2026 – present): Prompt Engineer. Full-stack apps (React, Next.js, Node.js, MongoDB), a vehicle/logo detection pipeline in Python + TypeScript (results in 9–11 seconds per image), redesigned Giviz (Flutter app on Google Play; fixed 15 bugs, built a leaderboard module), AI face-swap and virtual try-on for the Zeeper Flutter app.
- Xipra Technology (Jan 2025 – Jan 2026): Full Stack Engineer (intern, then full-time). Delivered 3 client web apps on the MERN stack with PostgreSQL.
English level: Professional (B2)
Open to: Full-time roles, remote or on-site

If asked about hiring or contact, share email: doiznahidhusain1234@gmail.com
Keep answers short (2-4 sentences). Do not answer anything unrelated to Nahid or his work. Do not mention relocation, visas, or any specific country he wants to move to.`;

const LANGS = ['English', 'हिंदी', 'Deutsch', 'العربية', 'Français', 'Español'];
// Preferred chat models, best first. Groq retires models over time, so the list the
// account can actually use is fetched from Groq and these are only a preference order.
const PREFERRED = [/gpt-oss-120b/, /llama-4-maverick/, /llama-3\.3-70b/, /qwen3?-.*32b/, /kimi-k2/, /gpt-oss-20b/, /llama-4-scout/, /llama-3\.1-8b/, /llama/];
const NOT_CHAT = /whisper|tts|guard|playai|orpheus|compound|prompt-guard|safeguard|embed|vision/;
let cachedModels = null;
let cachedAt = 0;
let modelsRequest = null; // requests that arrive together share one lookup

function pickModels(key) {
  if (cachedModels && Date.now() - cachedAt < 10 * 60 * 1000) return Promise.resolve(cachedModels);
  modelsRequest ??= fetchModels(key).finally(() => { modelsRequest = null; });
  return modelsRequest;
}

async function fetchModels(key) {
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
    const data = await r.json();
    const ids = (data?.data || []).filter((m) => m.active !== false).map((m) => m.id).filter((id) => !NOT_CHAT.test(id));
    const ranked = [];
    PREFERRED.forEach((re) => ids.filter((id) => re.test(id) && !ranked.includes(id)).forEach((id) => ranked.push(id)));
    ids.forEach((id) => { if (!ranked.includes(id)) ranked.push(id); });
    if (ranked.length) {
      cachedModels = ranked.slice(0, 3);
      cachedAt = Date.now();
      return cachedModels;
    }
  } catch { /* fall through */ }
  return ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
}

export default async function handler(req, res) {
  const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_KEY;

  // GET /api/chat: a health check that says whether a key is set (never the key itself)
  if (req.method === 'GET' || req.method === 'HEAD') {
    const models = key ? await pickModels(key) : [];
    return res.status(200).json({ ok: true, keyConfigured: Boolean(key), models });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!key) return res.status(503).json({ error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const lang = LANGS.includes(body?.lang) ? body.lang : 'English';
  const history = Array.isArray(body?.messages) ? body.messages : [];
  const messages = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'bad_request' });
  }

  let lastError = 'upstream_error';
  for (const model of await pickModels(key)) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: SYSTEM_PROMPT(lang) }, ...messages],
          max_tokens: 400,
          temperature: 0.6,
        }),
      });
      const data = await r.json().catch(() => ({}));
      const reply = data?.choices?.[0]?.message?.content;
      if (r.ok && reply) return res.status(200).json({ reply: reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim() });
      if (r.status === 404) cachedModels = null;
      if (r.status === 401 || r.status === 403) return res.status(502).json({ error: 'bad_key' });
      lastError = r.status === 429 ? 'rate_limited' : `upstream_${r.status}`;
      // try the next model (for example if this one was retired or is overloaded)
    } catch {
      lastError = 'network';
    }
  }
  return res.status(502).json({ error: lastError });
}
