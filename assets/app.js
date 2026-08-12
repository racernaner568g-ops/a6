const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;
const menuButton = document.querySelector('.menu-toggle');
const curtain = document.querySelector('.curtain-nav');

function setMenu(open) {
  body.classList.toggle('menu-open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  curtain?.setAttribute('aria-hidden', String(!open));
}

menuButton?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
curtain?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

body.classList.add('reveal-ready');
const revealTargets = [...document.querySelectorAll('main > section, .long-note > section')];
revealTargets.forEach(target => target.classList.add('reveal'));
if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .09, rootMargin: '0px 0px -5%' });
  revealTargets.forEach(target => revealObserver.observe(target));
} else {
  revealTargets.forEach(target => target.classList.add('in-view'));
}

const root = document.documentElement;
const header = document.querySelector('.site-head');
let lastY = 0;
let scrollQueued = false;
function paintScroll() {
  const max = root.scrollHeight - innerHeight;
  root.style.setProperty('--progress', `${max > 0 ? scrollY / max * 100 : 0}%`);
  header?.classList.toggle('is-hidden', scrollY > lastY && scrollY > 180 && !body.classList.contains('menu-open'));
  lastY = Math.max(scrollY, 0);
  scrollQueued = false;
}
addEventListener('scroll', () => {
  if (!scrollQueued) {
    requestAnimationFrame(paintScroll);
    scrollQueued = true;
  }
}, { passive: true });
paintScroll();

const courseCards = [...document.querySelectorAll('.course-line article')];
let courseIndex = 0;
function setCourse(index) {
  courseIndex = (index + courseCards.length) % courseCards.length;
  courseCards.forEach((card, i) => card.classList.toggle('is-live', i === courseIndex));
}
courseCards.forEach((card, i) => {
  card.addEventListener('mouseenter', () => setCourse(i));
  card.addEventListener('focusin', () => setCourse(i));
});
if (courseCards.length) {
  setCourse(0);
  if (!reducedMotion) setInterval(() => setCourse(courseIndex + 1), 2600);
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.setting-scenes article').forEach(card => {
      const visible = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hide', !visible);
      card.classList.remove('filter-pop');
      if (visible) requestAnimationFrame(() => card.classList.add('filter-pop'));
    });
  });
});

document.querySelector('.contact-work form')?.addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  if (status) status.textContent = 'Your enquiry is prepared for the Host Desk. We will reply by email.';
  event.currentTarget.reset();
});

const consent = document.querySelector('.consent');
if (localStorage.getItem('tep-consent')) consent?.classList.add('hidden');
document.querySelectorAll('[data-consent]').forEach(button => {
  button.addEventListener('click', () => {
    const analytics = button.dataset.consent === 'accept' ? 'granted' : 'denied';
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: analytics,
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    localStorage.setItem('tep-consent', analytics);
    consent?.classList.add('hidden');
  });
});
