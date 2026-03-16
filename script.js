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
  form.outerHTML = `
    <div class="waitlist-success">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      You're on the list! We'll be in touch soon.
    </div>`;
});

// ----- HERO WORDMARK — shrinks into nav logo on scroll -----
(function initWordmarkShrink() {
  const wordmark = document.getElementById('heroWordmark');
  const navLogo  = document.getElementById('navLogo');
  if (!wordmark || !navLogo) return;

  function update() {
    // Transition completes over the first 45% of viewport height
    const raw = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.45)));

    // Wordmark shrinks upward and fades — ease-in gives it weight
    const scale = Math.max(0.1, 1 - 0.88 * raw);
    wordmark.style.transform = `scale(${scale})`;
    wordmark.style.opacity   = String(Math.max(0, 1 - raw * 1.8));

    // Nav logo fades in as wordmark disappears
    navLogo.style.opacity = String(Math.min(1, raw * 2.4));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());

// ----- HOW IT WORKS — step spotlight loop -----
(function initStepSpotlight() {
  const steps = Array.from(document.querySelectorAll('.step'));
  if (steps.length < 2) return;

  const CELEBRATE_STEP = 2; // 0-indexed → step 3
  const EMOJIS = ['🎉','✨','💫','🎊','🌟','🥂','🎈','⭐','🏆','💥'];

  function burstConfetti(stepEl) {
    EMOJIS.forEach((emoji, i) => {
      const el = document.createElement('span');
      el.className = 'confetti-burst';
      el.textContent = emoji;
      const angle = (i / EMOJIS.length) * 2 * Math.PI;
      const dist = 90 + Math.random() * 60;
      el.style.setProperty('--tx', `${Math.round(Math.cos(angle) * dist)}px`);
      el.style.setProperty('--ty', `${Math.round(Math.sin(angle) * dist)}px`);
      el.style.setProperty('--delay', `${i * 0.06}s`);
      stepEl.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    });
  }

  let current = 0;
  function advance() {
    steps[current].classList.remove('step--spotlight');
    current = (current + 1) % steps.length;
    steps[current].classList.add('step--spotlight');
    if (current === CELEBRATE_STEP) burstConfetti(steps[current]);
  }

  steps[current].classList.add('step--spotlight');
  setInterval(advance, 2400);
}());

// ----- SECTION REVEAL — 3D stagger enter / blur-collapse exit -----
(function initSectionReveal() {
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const easeInQuart  = t => t * t * t * t;
  const STAGGER      = 0.24;

  function createReveal(sectionEl, itemEls) {
    if (!sectionEl || !itemEls.length) return;
    const n = itemEls.length;

    function update() {
      const rect = sectionEl.getBoundingClientRect();
      const vh   = window.innerHeight;
      const sH   = sectionEl.offsetHeight;

      const enterRaw = Math.max(0, Math.min(1, rect.top / (vh * 0.65)));
      const exitRaw  = Math.max(0, Math.min(1, -rect.top / (sH * 0.65)));

      itemEls.forEach((el, i) => {
        if (!el) return;
        const sf = n > 1 ? i / (n - 1) : 0;

        if (exitRaw > 0) {
          const ep = easeInQuart(Math.max(0, Math.min(1, exitRaw - sf * 0.12)));
          el.style.transform = `translateY(${-48 * ep}px) scale(${1 - 0.07 * ep}) rotateX(${-5 * ep}deg)`;
          el.style.opacity   = String(Math.max(0, 1 - ep * 1.7));
          el.style.filter    = ep > 0.3 ? `blur(${(ep - 0.3) * 5}px)` : 'none';
        } else {
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

  createReveal(document.querySelector('.fresh-drops'),  Array.from(document.querySelectorAll('.drop-card')));
  createReveal(document.querySelector('.how'),          Array.from(document.querySelectorAll('.step')));
  createReveal(document.querySelector('.categories'),   Array.from(document.querySelectorAll('.cat-card')));
  createReveal(document.querySelector('.testimonials'), Array.from(document.querySelectorAll('.review-card')));
}());

// ----- PARALLAX — hero background image -----
const heroBgImg = document.getElementById('heroBgImg');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    heroBgImg.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }, { passive: true });
}

// ----- NUMBER COUNTER ANIMATION (stats bar) -----
function animateCount(el, target, suffix = '') {
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

const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const statsObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const strongs = statsBar.querySelectorAll('strong');
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
