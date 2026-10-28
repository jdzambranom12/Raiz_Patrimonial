/**
 * RAÍZ — Laboratorio Patrimonial
 * Seamless Page Router with Fallback
 */

(function() {
  // If running via file:// protocol or browser doesn't support fetch/history, allow default navigation
  if (window.location.protocol === 'file:') {
    return;
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || link.target === '_blank') {
      return;
    }

    // Only intercept local internal paths
    if (href.endsWith('.html') || href === '/' || href.startsWith('/proceso') || href.startsWith('/proyecto')) {
      e.preventDefault();
      navigateTo(href);
    }
  });

  window.addEventListener('popstate', () => {
    loadPage(window.location.pathname, false);
  });

  async function navigateTo(url) {
    try {
      await loadPage(url, true);
    } catch (err) {
      console.warn('Router navigation failed, falling back to full reload:', err);
      window.location.href = url;
    }
  }

  async function loadPage(url, push = true) {
    let fetchUrl = url;
    if (fetchUrl === '/' || fetchUrl === '') {
      fetchUrl = 'index.html';
    } else if (!fetchUrl.endsWith('.html')) {
      fetchUrl = fetchUrl.replace(/\/$/, '') + '.html';
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error('Network error loading ' + fetchUrl);

    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const newMain = doc.querySelector('main');
    const currentMain = document.querySelector('main');

    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
      document.title = doc.title;

      if (push) {
        history.pushState(null, doc.title, url);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-trigger active link highlight
      if (typeof highlightActiveLink === 'function') {
        highlightActiveLink();
      }
    } else {
      window.location.href = url;
    }
  }
})();
