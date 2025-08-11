(function () {
    const loaderEl = document.getElementById('app-loader');
    const minDisplayMs = 900;
    const bootStart = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    function hideLoader() {
        if (!loaderEl) return;
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const elapsed = now - bootStart;
        const delay = Math.max(0, minDisplayMs - elapsed);
        setTimeout(() => {
            loaderEl.classList.add('is-hidden');
            setTimeout(() => loaderEl.remove(), 650);
        }, delay);
    }

    try {
        const params = new URLSearchParams(window.location.search);
        if (params.has('skiploader')) {
            hideLoader();
        } else if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader);
        }
    } catch (_e) {
        window.addEventListener('load', hideLoader);
    }

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card) => {
        let raf = 0;
        card.addEventListener('mousemove', (e) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y / rect.height - 0.5) * -6).toFixed(2);
                const ry = ((x / rect.width - 0.5) * 6).toFixed(2);
                card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    const ctaBtn = document.getElementById('cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            ripple(ctaBtn);
        });
    }

    function ripple(target) {
        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${target.clientWidth / 2 - radius}px`;
        circle.style.top = `${target.clientHeight / 2 - radius}px`;
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.background = 'rgba(124,156,255,0.35)';
        circle.style.transform = 'scale(0)';
        circle.style.opacity = '0.9';
        circle.style.pointerEvents = 'none';
        circle.style.transition = 'transform 500ms ease, opacity 500ms ease';
        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(circle);
        requestAnimationFrame(() => {
            circle.style.transform = 'scale(2)';
            circle.style.opacity = '0';
        });
        setTimeout(() => circle.remove(), 520);
    }

    // --- Simple i18n ---
    const I18N_STORAGE_KEY = 'skylab:i18n:lang';
    const defaultLang = 'en';
    const supportedLangs = ['en', 'tr'];

    async function loadTranslations(lang) {
        try {
            const res = await fetch(`/i18n/${lang}.json`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to load i18n');
            return res.json();
        } catch (e) {
            console.error(e);
            return {};
        }
    }

    function applyTranslations(dict) {
        const nodes = document.querySelectorAll('[data-i18n]');
        nodes.forEach((node) => {
            const key = node.getAttribute('data-i18n');
            const attr = node.getAttribute('data-i18n-attr');
            const value = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dict);
            if (typeof value === 'undefined') return;
            if (attr) {
                node.setAttribute(attr, value);
            } else {
                node.textContent = value;
            }
        });
    }

    function detectInitialLang() {
        const stored = localStorage.getItem(I18N_STORAGE_KEY);
        if (stored && supportedLangs.includes(stored)) return stored;
        const nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        if (nav.toLowerCase().startsWith('tr')) return 'tr';
        return defaultLang;
    }

    async function setLang(lang) {
        if (!supportedLangs.includes(lang)) lang = defaultLang;
        const dict = await loadTranslations(lang);
        applyTranslations(dict);
        localStorage.setItem(I18N_STORAGE_KEY, lang);
        updateLangToggle(lang);
        document.documentElement.setAttribute('lang', lang);
    }

    function updateLangToggle(active) {
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            const isActive = btn.getAttribute('data-lang') === active;
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
    });

    // Initialize language after content is ready
    setLang(detectInitialLang());
})();


