import { useState, useRef, useEffect } from 'react';

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const SYSTEM_PROMPT = (lang) => `You are Nahid's AI portfolio assistant. Answer ONLY in ${lang} language. Be friendly, professional and concise.

About Nahid Husain:
- Full Stack Developer (React, TypeScript, Node.js, MongoDB, Supabase)
- Portfolio website: nahid788-coder.github.io/portfolio (or the current site you are on)
- Looking for Frontend/Full Stack Developer jobs in Germany (visa sponsorship needed)
- Available from June 2026
- Location: India → Germany (ready to relocate)
- Email: doiznahidhusain1234@gmail.com
- GitHub: github.com/Nahid788-coder

Skills:
- Frontend: React.js, TypeScript, Next.js, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, REST APIs
- Database: MongoDB, Supabase (PostgreSQL), MySQL
- Tools: Git, GitHub, Vite, Vercel, Figma

Projects (all have live demos):
1. AI ChatBot — Multi-model chat app (Groq, Gemini APIs), Google login, Supabase auth & history, OTP verification. Live: https://ai-chatbot-one-bice-57.vercel.app
2. GitHub Explorer — Search any GitHub user, view repos, stats, languages. Built with React + TypeScript. Live: https://github-explorer-ashen-two.vercel.app
3. Harvest Co. — E-Commerce platform with Subscription Box Builder, React + Node + MongoDB. Live: https://nahid788-coder.github.io/live-designs/organick/
4. Lyric Studio — Awwwards-tier creative agency with magnetic cursor, page transitions, CMS. Live: https://nahid788-coder.github.io/live-designs/andia/
5. Catalyst Consulting — Financial advisory platform with live ROI calculator, booking system, blog CMS. Live: https://nahid788-coder.github.io/live-designs/babun/
6. Vesper Journal — Editorial travel magazine with parallax storytelling, boutique hotel booking. Live: https://nahid788-coder.github.io/live-designs/elegance/
7. Slice & Crust — Pizzeria app with Razorpay payments, Socket.io live order tracking, admin dashboard. Live: https://nahid788-coder.github.io/live-designs/pizza/
8. Verde Living — Premium furniture store with 2D Room Visualizer, wishlist, full checkout. Live: https://nahid788-coder.github.io/live-designs/mfurniro/
9. Helix Industrial — Industrial B2B platform with live RFQ calculator, product catalog. Live: https://nahid788-coder.github.io/live-designs/nisuka/
10. Atelier 9 — Architecture studio with horizontal scroll showcase, case studies, inquiry system. Live: https://nahid788-coder.github.io/live-designs/studio-people/

Experience: 2+ years building full-stack web applications
English level: Professional (B2)
Open to: Full-time, on-site Berlin/Germany

If asked about hiring or contact, share email: doiznahidhusain1234@gmail.com
Keep answers short (2-4 sentences). Do not answer anything unrelated to Nahid or his work.`;

function Assistant() {
  const [open, setOpen] = useState(false);
  const [langSelected, setLangSelected] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const bottomRef = useRef(null);

  // Show hint bubble after 3s, hide after 6s (only once)
  useEffect(() => {
    const show = setTimeout(() => setShowHint(true), 3000);
    const hide = setTimeout(() => setShowHint(false), 9000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  // Hide hint when chat is opened
  const handleFabClick = () => {
    setShowHint(false);
    setOpen(o => !o);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const selectLanguage = (lang) => {
    setSelectedLang(lang);
    setLangSelected(true);
    const greetings = {
      en: "Hi! I'm Nahid's AI assistant 👋 Ask me anything about his skills, projects, or how to hire him!",
      hi: "नमस्ते! मैं Nahid का AI assistant हूँ 👋 उनकी skills, projects या hiring के बारे में पूछें!",
      de: "Hallo! Ich bin Nahids KI-Assistent 👋 Fragen Sie mich zu seinen Fähigkeiten, Projekten oder wie Sie ihn einstellen können!",
      ar: "مرحباً! أنا مساعد Nahid الذكي 👋 اسألني عن مهاراته ومشاريعه أو كيفية توظيفه!",
      fr: "Bonjour! Je suis l'assistant IA de Nahid 👋 Posez-moi des questions sur ses compétences, projets ou comment l'embaucher!",
      es: "¡Hola! Soy el asistente de IA de Nahid 👋 ¡Pregúntame sobre sus habilidades, proyectos o cómo contratarlo!",
    };
    setMessages([{ role: 'assistant', content: greetings[lang.code] }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT(selectedLang.label) },
            ...messages,
            userMsg,
          ],
          max_tokens: 200,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, try again!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const reset = () => {
    setLangSelected(false);
    setSelectedLang(null);
    setMessages([]);
    setInput('');
  };

  return (
    <>
      {/* Hint Bubble */}
      {showHint && !open && (
        <div className="ai-hint-bubble">
          <span>👋 Ask me anything about Nahid!</span>
          <button className="ai-hint-close" onClick={() => setShowHint(false)}>×</button>
        </div>
      )}

      {/* Floating Button */}
      <button className="ai-fab" onClick={handleFabClick} aria-label="AI Assistant">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
        {!open && <span className="ai-fab-ping" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-avatar">N</div>
              <div>
                <div className="ai-chat-title">Nahid's Assistant</div>
                <div className="ai-chat-status">
                  <span className="ai-online-dot" /> Online
                </div>
              </div>
            </div>
            {langSelected && (
              <button className="ai-lang-reset" onClick={reset} title="Change language">
                {selectedLang.flag} <span className="ai-lang-reset-label">Change</span>
              </button>
            )}
          </div>

          {/* Language Select */}
          {!langSelected ? (
            <div className="ai-lang-select">
              <p className="ai-lang-title">Choose your language</p>
              <div className="ai-lang-grid">
                {LANGUAGES.map(lang => (
                  <button key={lang.code} className="ai-lang-btn" onClick={() => selectLanguage(lang)}>
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="ai-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-msg ai-msg--${msg.role}`}>
                    {msg.role === 'assistant' && <div className="ai-msg-avatar">N</div>}
                    <div className="ai-msg-bubble">{msg.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="ai-msg ai-msg--assistant">
                    <div className="ai-msg-avatar">N</div>
                    <div className="ai-msg-bubble ai-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="ai-input-wrap">
                <input
                  className="ai-input"
                  placeholder={`Message in ${selectedLang.label}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button className="ai-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Assistant;
