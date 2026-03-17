/**
 * js/componentLoader.js — Dynamic component loader
 * Shonowear platform
 *
 * Loads reusable HTML components (navbar, footer) via fetch()
 * and injects them into the page.
 *
 * Usage: Add <script src="js/componentLoader.js" data-page="home"></script>
 * to any page. The data-page attribute sets the active nav link.
 *
 * Note: For pages that already have hardcoded navbars (all existing pages),
 * this module is optional — it's provided for new pages and future builds.
 * Using it on existing pages would cause duplication.
 *
 * Feature 14 implementation from product spec.
 */

'use strict';

const ComponentLoader = {

  /**
   * Load an HTML component and inject it into the DOM
   * @param {string} url - path to component HTML
   * @param {string} targetSelector - CSS selector of target container
   * @param {string} position - 'prepend' | 'append' | 'replace'
   */
  async load(url, targetSelector, position = 'replace') {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const html = await res.text();

      const target = document.querySelector(targetSelector);
      if (!target) {
        console.warn(`[ComponentLoader] Target not found: ${targetSelector}`);
        return false;
      }

      if (position === 'prepend') {
        target.insertAdjacentHTML('afterbegin', html);
      } else if (position === 'append') {
        target.insertAdjacentHTML('beforeend', html);
      } else {
        target.innerHTML = html;
      }

      return true;
    } catch (err) {
      console.warn(`[ComponentLoader] Failed to load ${url}:`, err.message);
      return false;
    }
  },

  /**
   * Load navbar into #navbar-component placeholder
   * Then initialise scroll behaviour, active link, and Find My Style link
   * @param {string} activePage - page identifier to set active nav link
   */
  async loadNavbar(activePage = '') {
    const placeholder = document.getElementById('navbar-component');
    if (!placeholder) return; // page has its own navbar, skip

    const ok = await this.load('components/navbar.html', '#navbar-component');
    if (!ok) return;

    // Set active link
    if (activePage) {
      document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
        if (a.dataset.page === activePage) a.classList.add('active');
      });
    }

    // Add Find My Style / My Picks dynamic link
    const navLinks = document.getElementById('navbar-links');
    if (navLinks) {
      const bt = localStorage.getItem('bodyType');
      const li = document.createElement('li');
      li.innerHTML = bt
        ? `<a href="recommendations.html" style="color:var(--red)!important;"><i class="fas fa-magic" style="margin-right:5px;font-size:10px;"></i>My Picks</a>`
        : `<a href="body-profile.html"><i class="fas fa-magic" style="margin-right:5px;font-size:10px;"></i>Find My Style</a>`;
      navLinks.appendChild(li);
    }

    // Announce bar dismiss
    if (sessionStorage.getItem('sw_announce_closed')) {
      const bar = document.getElementById('announce-bar');
      if (bar) bar.style.display = 'none';
    }

    // Scroll behaviour
    const nb = document.getElementById('navbar');
    const pr = document.getElementById('nav-progress');
    window.addEventListener('scroll', () => {
      if (nb) nb.classList.toggle('scrolled', window.scrollY > 60);
      if (pr) pr.style.width = Math.min(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100
      ) + '%';
    }, { passive: true });

    // Mobile menu
    document.getElementById('nav-toggle')?.addEventListener('click', () => {
      document.getElementById('mob-ov')?.classList.add('on');
      document.getElementById('mob-menu')?.classList.add('on');
    });
  },

  /**
   * Load footer into #footer-component placeholder
   */
  async loadFooter() {
    const placeholder = document.getElementById('footer-component');
    if (!placeholder) return;

    const ok = await this.load('components/footer.html', '#footer-component');
    if (!ok) return;

    // Set current year
    document.querySelectorAll('.footer-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });

    // Cookie consent
    if (localStorage.getItem('sw_cookies_accepted')) {
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.style.display = 'none';
    }
    window.acceptCookies = function() {
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.style.display = 'none';
      localStorage.setItem('sw_cookies_accepted', '1');
    };

    // Scroll-to-top visibility
    window.addEventListener('scroll', () => {
      document.getElementById('scroll-top')?.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  },

  /**
   * Convenience: load both navbar and footer
   * @param {string} activePage
   */
  async loadAll(activePage = '') {
    await Promise.all([
      this.loadNavbar(activePage),
      this.loadFooter(),
    ]);
  },

};

window.ComponentLoader = ComponentLoader;
