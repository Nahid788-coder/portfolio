import { useEffect, useRef, useState } from 'react';

/* ---------- SCROLL REVEAL ---------- */
export function useReveal(options = {}) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        if (options.once !== false) obs.unobserve(entry.target);
                    } else if (options.once === false) {
                        entry.target.classList.remove('in-view');
                    }
                });
            },
            { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px 0px -60px 0px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [options.threshold, options.rootMargin, options.once]);
    return ref;
}

/* ---------- ANIMATED COUNTER ---------- */
export function useCounter(target, { duration = 1600, suffix = '+' } = {}) {
    const ref = useRef(null);
    const [val, setVal] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const start = performance.now();
                        const tick = now => {
                            const t = Math.min(1, (now - start) / duration);
                            const eased = 1 - Math.pow(1 - t, 3);
                            setVal(Math.round(target * eased));
                            if (t < 1) requestAnimationFrame(tick);
                        };
                        requestAnimationFrame(tick);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [target, duration]);
    return [ref, `${val}${suffix}`];
}

/* ---------- 3D TILT ---------- */
export function useTilt(strength = 12) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf;
        const onMove = e => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(0)`;
            });
            el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
            el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
        };
        const onLeave = () => {
            cancelAnimationFrame(raf);
            el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
            cancelAnimationFrame(raf);
        };
    }, [strength]);
    return ref;
}

/* ---------- MAGNETIC BUTTON ---------- */
export function useMagnetic(strength = 0.35) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = e => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        };
        const onLeave = () => { el.style.transform = 'translate(0, 0)'; };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, [strength]);
    return ref;
}

/* ---------- TYPED ROLE ---------- */
export function useTyped(words, { typeSpeed = 90, deleteSpeed = 45, pause = 1400 } = {}) {
    const [text, setText] = useState('');
    const key = Array.isArray(words) ? words.join('|') : '';
    useEffect(() => {
        if (!key) return;
        const list = key.split('|');
        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;
        let timer;
        let cancelled = false;

        const tick = () => {
            if (cancelled) return;
            const current = list[wordIndex];
            if (!deleting) {
                charIndex++;
                setText(current.slice(0, charIndex));
                if (charIndex === current.length) {
                    deleting = true;
                    timer = setTimeout(tick, pause);
                    return;
                }
                timer = setTimeout(tick, typeSpeed);
            } else {
                charIndex--;
                setText(current.slice(0, charIndex));
                if (charIndex === 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % list.length;
                }
                timer = setTimeout(tick, deleteSpeed);
            }
        };
        timer = setTimeout(tick, typeSpeed);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [key, typeSpeed, deleteSpeed, pause]);
    return text;
}

/* ---------- SCROLL PROGRESS ---------- */
export function useScrollProgress() {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const total = h.scrollHeight - h.clientHeight;
            setPct(total > 0 ? (h.scrollTop / total) * 100 : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return pct;
}

/* ---------- SCROLL-SCRUBBED VIDEO (whole-page scroll range, eased) ---------- */
export function useScrollScrubVideo() {
    const videoRef = useRef(null);
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const targetProgress = () => {
            const h = document.documentElement;
            const total = h.scrollHeight - h.clientHeight;
            return Math.min(1, Math.max(0, total > 0 ? h.scrollTop / total : 0));
        };

        let raf;
        let current = 0;
        let ready = false;

        const tick = () => {
            if (ready && video.duration) {
                const target = targetProgress();
                current += (target - current) * 0.08;
                if (Math.abs(target - current) < 0.0005) current = target;
                video.currentTime = current * video.duration;
            }
            raf = requestAnimationFrame(tick);
        };

        const onReady = () => {
            ready = true;
            current = targetProgress();
        };

        // iOS Safari (and some mobile Chrome) won't decode/paint any frame
        // for a video that is only ever seeked, never played — kick off a
        // silent play+immediate-pause so the first frame actually renders.
        const kickstart = () => {
            const p = video.play();
            if (p && typeof p.then === 'function') {
                p.then(() => video.pause()).catch(() => {});
            } else {
                video.pause();
            }
        };

        if (video.readyState >= 1) { kickstart(); onReady(); }
        else video.addEventListener('loadedmetadata', () => { kickstart(); onReady(); }, { once: true });

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);
    return videoRef;
}

/* ---------- RIPPLE HANDLER ---------- */
export function applyRipple(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--ry', `${e.clientY - rect.top}px`);
    el.classList.remove('rippling');
    void el.offsetWidth;
    el.classList.add('rippling');
    setTimeout(() => el.classList.remove('rippling'), 700);
}
