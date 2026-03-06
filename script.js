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
const fadeEls = document.querySelectorAll(
  '.step, .cat-card, .review-card, .stat'
);

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

// ----- SCROLL-DRIVEN CARD FLY (leaves effect) -----
(function initCardScrollFly() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Each card gets a unique flight path (tx, ty in px, rot in deg)
  const cards = [
    { el: document.querySelector('.showcase-card--main'),      tx:  200, ty: -260, rot:  32 },
    { el: document.querySelector('.showcase-card--secondary'), tx:  260, ty:  -60, rot: -24 },
    { el: document.querySelector('.showcase-card--tertiary'),  tx: -200, ty:  180, rot:  28 },
  ].filter(c => c.el);

  // easeIn so the initial scroll feels natural, acceleration towards exit
  function easeIn(t) { return t * t * t; }

  function update() {
    const heroH = hero.offsetHeight;
    // Animation window: from scrollY=0 to scrollY = heroH*0.55
    const raw = Math.max(0, Math.min(1, window.scrollY / (heroH * 0.55)));
    const p   = easeIn(raw);

    cards.forEach(({ el, tx, ty, rot }) => {
      el.style.transform = `translate(${tx * p}px, ${ty * p}px) rotate(${rot * p}deg)`;
      el.style.opacity   = String(1 - p);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // set initial state
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
