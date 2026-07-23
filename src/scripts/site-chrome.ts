/**
 * Site-wide chrome behaviour: theme toggle, live-OS-theme follow, mobile
 * drawer, NY clock, reveal-on-scroll, and rail scroll-spy.
 *
 * None of this runs before paint — the no-flash theme set in Base.astro's
 * <head> is the only pre-paint script. Deferred execution is fine here, since
 * every element these query already exists by then.
 */
const root = document.documentElement;
const themeBtns = Array.prototype.slice.call(
  document.querySelectorAll('[data-set]'),
) as HTMLElement[];

/** Browser UI tint follows the resolved theme, not the OS preference. */
function setThemeColor(t: string) {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'light' ? '#FBFAF6' : '#0B0B0A');
}

function applyTheme(t: string) {
  root.setAttribute('data-theme', t);
  setThemeColor(t);
  themeBtns.forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.set === t));
  });
  try {
    localStorage.setItem('pm-theme', t);
  } catch (e) {}
}
themeBtns.forEach((b) => {
  b.addEventListener('click', () => applyTheme(b.dataset.set as string));
});
applyTheme(root.getAttribute('data-theme') || 'dark');

// follow live OS theme, but only until the visitor makes a manual choice
try {
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', (e) => {
    let chosen: string | null = null;
    try {
      chosen = localStorage.getItem('pm-theme');
    } catch (_) {}
    if (!chosen) {
      root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
      setThemeColor(e.matches ? 'light' : 'dark');
      themeBtns.forEach((b) => {
        b.setAttribute(
          'aria-pressed',
          String(b.dataset.set === root.getAttribute('data-theme')),
        );
      });
    }
  });
} catch (e) {}

// mobile drawer: open/close, Escape, body scroll-lock
const drawer = document.getElementById('mobile-drawer');
const openBtn = document.getElementById('menu-open');
const closeBtn = document.getElementById('menu-close');
function setMenu(open: boolean) {
  if (!drawer) return;
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}
if (openBtn) openBtn.addEventListener('click', () => setMenu(true));
if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
if (drawer) {
  // close when a nav link is tapped (same-page hashes won't reload)
  Array.prototype.slice
    .call(drawer.querySelectorAll('.m-nav a'))
    .forEach((a: Element) => {
      a.addEventListener('click', () => setMenu(false));
    });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

// live NY clock (only present on the default rail)
const clk = document.getElementById('clock');
function tick() {
  if (!clk) return;
  try {
    clk.textContent = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    clk.textContent = '··';
  }
}
if (clk) {
  tick();
  setInterval(tick, 30000);
}

// reveal-on-scroll for any .rev element on the page
const io = new IntersectionObserver(
  (es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
);
Array.prototype.slice
  .call(document.querySelectorAll('.rev'))
  .forEach((el: Element) => io.observe(el));

// rail scroll-spy — case-study rail only. The default rail's #rail-nav links
// are real routes ('/', '/work', …), never in-page hashes, so building the spy
// there observed nothing; guard on #cs-nav so non-case pages skip it entirely.
const csNav = document.getElementById('cs-nav');
if (csNav) {
  const navLinks = Array.prototype.slice.call(
    csNav.querySelectorAll('a'),
  ) as HTMLAnchorElement[];
  const ids = navLinks
    .map((a) => (a.getAttribute('href') || '').replace(/^#/, ''))
    .filter((id) => id && id.charAt(0) !== '/');
  const secs = ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  if (secs.length) {
    const spy = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            navLinks.forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    secs.forEach((s) => spy.observe(s));
  }
}
