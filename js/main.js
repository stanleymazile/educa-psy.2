/* ===================== ICONS (inline SVG helpers) ===================== */
const Icons = {
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  handshake: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-1"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.81 19.79 19.79 0 0 1 1.61 1.2 2 2 0 0 1 3.6.02h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

/* ===================== NAV CONFIG ===================== */
const navItems = [
  { name: 'Accueil', href: '/pages/index.html' },
  { name: 'Educa-Psy', href: '/pages/a-propos.html' },
  { name: 'Expertises', href: '/pages/expertises.html' },
  { name: 'Services', href: '/pages/services.html' },
  { name: 'Nouvelles', href: 'pages/actualites.html' },
  { name: 'Partenaires', href: '/pages/partenaires.html' },
  { name: 'Contact', href: '/pages/contact.html' },
];

/* ===================== INJECT HEADER ===================== */
function injectHeader() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  const navLinks = navItems.map(item => `
    <a href="${item.href}" class="${currentPage === item.href ? 'active' : ''}">${item.name}</a>
  `).join('');

  const mobileNavLinks = navItems.map(item => `
    <a href="${item.href}" class="${currentPage === item.href ? 'active' : ''}">${item.name}</a>
  `).join('');

  const headerHTML = `
    <header id="site-header">
      <div class="container header-inner">
        <div style="display:flex;align-items:center;gap:1rem;">
          <button class="btn-hamburger" id="mobile-toggle" aria-label="Menu">${Icons.menu}</button>
          <a href="index.html" class="logo">Educa<span>-Psy</span></a>
        </div>
        <nav class="desktop-nav">${navLinks}</nav>
        <div class="header-actions">
          <button class="btn-search" id="search-toggle" aria-label="Recherche">${Icons.search}</button>
          <div class="lang-switcher">
            <button>KR</button>
            <button class="active">FR</button>
            <button>EN</button>
          </div>
          <a href="https://ademen.org/donate/" target="_blank" class="btn-donate">
            ${Icons.handshake}
            <span>Faire un don</span>
          </a>
        </div>
      </div>
      <div id="search-overlay">
        <div class="search-inner">
          <input type="text" placeholder="Recherche ..." id="search-input" />
          <button id="search-close">${Icons.x}</button>
        </div>
      </div>
    </header>

    <div id="mobile-overlay"></div>
    <div id="mobile-menu">
      <div class="mobile-menu-head">
        <a href="index.html" class="logo">Educa<span>-Psy</span></a>
        <button id="mobile-close">${Icons.x}</button>
      </div>
      <nav>${mobileNavLinks}</nav>
      <div class="mobile-menu-footer">
        <a href="https://ademen.org/donate/" target="_blank" class="btn-donate">
          ${Icons.handshake} Faire un don
        </a>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Scroll effect
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Search toggle
  const searchToggle = document.getElementById('search-toggle');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');
  searchToggle.addEventListener('click', () => {
    searchOverlay.classList.toggle('open');
    if (searchOverlay.classList.contains('open')) searchInput.focus();
  });
  searchClose.addEventListener('click', () => searchOverlay.classList.remove('open'));

  // Mobile menu
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileClose = document.getElementById('mobile-close');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileMenu = document.getElementById('mobile-menu');
  function openMobileMenu() {
    mobileOverlay.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileOverlay.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  mobileToggle.addEventListener('click', openMobileMenu);
  mobileClose.addEventListener('click', closeMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);
}

/* ===================== INJECT FOOTER ===================== */
function injectFooter() {
  const year = new Date().getFullYear();
  const footerHTML = `
    <footer id="site-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Contact -->
          <div>
            <a href="index.html" class="footer-logo">Educa<span>-Psy</span></a>
            <div class="footer-contact">
              <div class="footer-contact-item">${Icons.mapPin}<span>143, Avenue Christophe BP 2720 HT 6112 Port-au-Prince, Haïti</span></div>
              <div class="footer-contact-item">${Icons.phone}<span>(509) 2813-1694</span></div>
              <div class="footer-contact-item">${Icons.mail}<span>contact@educapsy.org</span></div>
            </div>
          </div>
          <!-- Navigation -->
          <div class="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><a href="index.html">Accueil</a></li>
              <li><a href="a-propos.html">À propos</a></li>
              <li><a href="expertises.html">Expertises</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="actualites.html">Actualités</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <!-- Affiliates -->
          <div class="footer-col">
            <h4>Structures Affiliées</h4>
            <ul>
              <li><a href="partenaires.html">Partenaires</a></li>
              <li><a href="https://www.lecentredart.org/" target="_blank">Centre d'Art</a></li>
              <li><a href="https://egalego.org/" target="_blank">EGALEGO</a></li>
              <li><a href="https://kiskeyart.org/" target="_blank">Kiskeyart</a></li>
              <li><a href="https://www.parcdemartissant.org/" target="_blank">Parc de Martissant</a></li>
            </ul>
          </div>
          <!-- Newsletter -->
          <div class="footer-newsletter">
            <h4 style="font-size:1rem;font-weight:700;margin-bottom:1.5rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.08);">S'abonner à Educa-Psy</h4>
            <p>Restez informé de nos dernières actualités et expertises.</p>
            <form class="footer-form" onsubmit="return false;">
              <input type="text" placeholder="Nom" />
              <input type="email" placeholder="Email" />
              <button type="submit">S'abonner</button>
            </form>
          </div>
        </div>
        <!-- Bottom -->
        <div class="footer-bottom">
          <div class="footer-socials">
            <a href="#" aria-label="Facebook">${Icons.facebook}</a>
            <a href="#" aria-label="X/Twitter">${Icons.twitter}</a>
            <a href="#" aria-label="YouTube">${Icons.youtube}</a>
            <a href="#" aria-label="Instagram">${Icons.instagram}</a>
          </div>
          <p class="footer-copyright">© ${year} Educa-Psy. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `;
  document.getElementById('footer-placeholder').outerHTML = footerHTML;
}

/* ===================== HERO SLIDER ===================== */
function initSlider() {
  const sliderEl = document.querySelector('.hero-slider');
  if (!sliderEl) return;

  const slides = sliderEl.querySelectorAll('.slide');
  const dots = sliderEl.querySelectorAll('.slider-dot');
  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() { timer = setInterval(next, 5000); }
  function resetTimer() { clearInterval(timer); startTimer(); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
  });

  goTo(0);
  startTimer();
}

/* ===================== SCROLL ANIMATIONS ===================== */
function initAnimations() {
  const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();
  initSlider();
  initAnimations();
});

