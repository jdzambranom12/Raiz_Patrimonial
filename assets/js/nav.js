/**
 * RAÍZ — Laboratorio Patrimonial
 * Navigation & Header Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderScroll();
  highlightActiveLink();
});

function initNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  overlay.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function highlightActiveLink() {
  const currentPath = window.location.pathname.toLowerCase();
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const cleanHref = href.toLowerCase().replace(/^\.\//, '');
    const cleanPath = currentPath.replace(/\/$/, '').split('/').pop();

    let isActive = false;

    if (cleanHref === '/' || cleanHref === 'index.html' || cleanHref === './index.html') {
      isActive = cleanPath === '' || cleanPath === 'index.html';
    } else if (cleanHref.includes('proceso')) {
      isActive = currentPath.includes('proceso');
    } else if (cleanHref.includes('proyecto')) {
      isActive = currentPath.includes('proyecto');
    }

    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}
