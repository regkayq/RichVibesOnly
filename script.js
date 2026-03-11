/* ============================================================
   RichVibesOnly — Landing Page Scripts
   ============================================================ */

// ----- NAV SCROLL STATE -----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ----- MOBILE MENU -----
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

// ----- INTERSECTION OBSERVER — FADE UP -----
const fadeEls = document.querySelectorAll('.stat');

fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

fadeEls.forEach(el => observer.observe(el));

// ----- WAITLIST FORM -----
const form = document.getElementById('waitlistForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.querySelector('input').value;

  // Swap form with success message
  form.outerHTML = `
    <div class="waitlist-success">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      You're on the list! We'll be in touch soon.
    </div>`;
});

// ----- HERO CARDS — scroll-driven cascade fall -----
(function initHeroFly() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // All cards fall downward — staggered so secondary goes first, then main, then tertiary.
  // The slight horizontal drift + rotation makes each card feel unique.
  const items = [
    { el: document.querySelector('.showcase-card--secondary'), tx:  55, ty: 600, rot:  13, delay: 0    },
    { el: document.querySelector('.float-badge--2'),           tx: -30, ty: 460, rot: -18, delay: 0.06 },
    { el: document.querySelector('.showcase-card--main'),      tx: -25, ty: 520, rot:  -9, delay: 0.14 },
    { el: document.querySelector('.showcase-card--tertiary'),  tx: -50, ty: 480, rot:   8, delay: 0.24 },
    { el: document.querySelector('.float-badge--1'),           tx:  40, ty: 400, rot:  20, delay: 0.09 },
  ].filter(c => c.el);

  // Cubic ease-in — starts slow like gravity, then accelerates
  function easeIn(t) { return t * t * t; }

  function update() {
    const scrollFrac = Math.max(0, Math.min(1, window.scrollY / (hero.offsetHeight * 0.60)));

    items.forEach(({ el, tx, ty, rot, delay }) => {
      // Each card starts its fall after its personal delay threshold
      const local = Math.max(0, Math.min(1, (scrollFrac - delay) / (1 - delay)));
      const p     = easeIn(local);

      el.style.transform = `translate(${tx * p}px, ${ty * p}px) rotate(${rot * p}deg) scale(${1 - 0.06 * p})`;
      el.style.opacity   = String(Math.max(0, 1 - p * 1.3));
      el.style.filter    = p > 0.5 ? `blur(${(p - 0.5) * 10}px)` : 'none';
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());

// ----- HOW IT WORKS — step spotlight loop -----
(function initStepSpotlight() {
  const steps = Array.from(document.querySelectorAll('.step'));
  if (steps.length < 2) return;

  let current = 0;

  function advance() {
    steps[current].classList.remove('step--spotlight');
    current = (current + 1) % steps.length;
    steps[current].classList.add('step--spotlight');
  }

  // Start on first step immediately
  steps[current].classList.add('step--spotlight');
  setInterval(advance, 2400);
}());

// ----- SECTION REVEAL — 3D stagger enter / blur-collapse exit -----
(function initSectionReveal() {
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const easeInQuart  = t => t * t * t * t;
  const STAGGER      = 0.24; // fraction of scroll range dedicated to stagger

  function createReveal(sectionEl, itemEls) {
    if (!sectionEl || !itemEls.length) return;
    const n = itemEls.length;

    function update() {
      const rect = sectionEl.getBoundingClientRect();
      const vh   = window.innerHeight;
      const sH   = sectionEl.offsetHeight;

      // enterRaw: 1 = section fully below fold, 0 = section top at mid-viewport
      const enterRaw = Math.max(0, Math.min(1, rect.top / (vh * 0.65)));
      // exitRaw:  0 = section in view, 1 = section has scrolled above fold
      const exitRaw  = Math.max(0, Math.min(1, -rect.top / (sH * 0.65)));

      itemEls.forEach((el, i) => {
        if (!el) return;
        const sf = n > 1 ? i / (n - 1) : 0; // stagger fraction 0…1

        if (exitRaw > 0) {
          // EXIT — first card leads, compress upward with blur
          const ep = easeInQuart(Math.max(0, Math.min(1, exitRaw - sf * 0.12)));
          el.style.transform = `translateY(${-48 * ep}px) scale(${1 - 0.07 * ep}) rotateX(${-5 * ep}deg)`;
          el.style.opacity   = String(Math.max(0, 1 - ep * 1.7));
          el.style.filter    = ep > 0.3 ? `blur(${(ep - 0.3) * 5}px)` : 'none';
        } else {
          // ENTER — rise from below with 3D forward tilt, staggered
          const rawVis = (1 - enterRaw) - sf * STAGGER;
          const ep     = easeOutQuart(Math.max(0, Math.min(1, rawVis / (1 - STAGGER))));
          el.style.transform = `translateY(${72 * (1 - ep)}px) scale(${0.88 + 0.12 * ep}) rotateX(${15 * (1 - ep)}deg)`;
          el.style.opacity   = String(Math.min(1, ep * 1.35));
          el.style.filter    = 'none';
        }
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  createReveal(document.querySelector('.how'),          Array.from(document.querySelectorAll('.step')));
  createReveal(document.querySelector('.categories'),   Array.from(document.querySelectorAll('.cat-card')));
  createReveal(document.querySelector('.testimonials'), Array.from(document.querySelectorAll('.review-card')));
}());

// ----- PARALLAX — subtle hero background -----
const heroBg = document.querySelector('.hero__bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
}

// ----- NUMBER COUNTER ANIMATION (stats bar) -----
function animateCount(el, target, suffix = '') {
  const start = 0;
  const duration = 1600;
  const step = (timestamp) => {
    if (!el._startTime) el._startTime = timestamp;
    const progress = Math.min((timestamp - el._startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Observe stats bar
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const statsObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const strongs = statsBar.querySelectorAll('strong');
      // 50,000+  |  200+  |  Up to 90%  |  4.9★
      const targets = [
        { el: strongs[0], val: 50000, suffix: '+' },
        { el: strongs[1], val: 200, suffix: '+' },
        { el: strongs[2], static: 'Up to 90%' },
        { el: strongs[3], static: '4.9★' },
      ];
      targets.forEach(t => {
        if (t.static) {
          t.el.textContent = t.static;
        } else {
          animateCount(t.el, t.val, t.suffix);
        }
      });
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statsObserver.observe(statsBar);
}
