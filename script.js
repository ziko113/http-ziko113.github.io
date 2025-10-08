(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const navToggle = qs('.nav-toggle');
  const navMenu = qs('#nav-menu');
  const links = qsa('.nav-link');
  const header = qs('.site-header');

  function closeMenu() {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    // close menu on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // Smooth scroll with header offset
  function smoothScrollTo(targetId) {
    const target = qs(targetId);
    if (!target) return;
    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - (headerHeight + 8);

    window.scrollTo({ top, behavior: 'smooth' });
  }

  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.hash) {
        e.preventDefault();
        smoothScrollTo(a.hash);
        closeMenu();
        history.replaceState(null, '', a.hash);
      }
    });
  });

  // Active link highlighting on scroll
  const sections = qsa('section[id]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = '#' + entry.target.id;
        const link = links.find((l) => l.getAttribute('href') === id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { root: null, rootMargin: '-50% 0px -40% 0px', threshold: 0 }
  );
  sections.forEach((sec) => observer.observe(sec));

  // Footer year
  const yearEl = qs('.year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Back to top
  const backToTop = qs('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '#top');
    });
  }

  // Blog: search & category filter
  const blogList = qs('#blog-list');
  if (blogList) {
    const cards = qsa('.blog-card', blogList);
    const searchInputs = [
      ...qsa('.blog-search'),
    ];
    const chips = qsa('.chip');

    let activeCategory = 'all';
    let query = '';

    function normalize(s) { return s.toLowerCase().trim(); }

    function applyFilters() {
      const q = normalize(query);
      cards.forEach((card) => {
        const category = card.getAttribute('data-category') || '';
        const title = normalize(card.getAttribute('data-title') || '');
        const text = normalize(card.getAttribute('data-text') || '');
        const matchesCategory = activeCategory === 'all' || category === activeCategory;
        const matchesQuery = !q || title.includes(q) || text.includes(q);
        card.style.display = (matchesCategory && matchesQuery) ? '' : 'none';
      });
    }

    searchInputs.forEach((inp) => {
      inp.addEventListener('input', (e) => {
        query = e.target.value || '';
        applyFilters();
      });
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        activeCategory = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });
  }
})();
