/**
 * js/main.js — Platform entry point / module coordinator
 * Shonowear
 *
 * Load order on any page:
 *  1. js/utils.js       (shared helpers — loadJSON, calcBMI, etc.)
 *  2. data.js           (products array — existing file, root level)
 *  3. main.js           (shared page functions — existing file, root level)
 *  4. wishlist.js       (wishlist sidebar — existing)
 *  5. js/bodyProfile.js         (body type + BMI — new module)
 *  6. js/outfitRenderer.js      (outfit cards + detail — new module)
 *  7. js/recommendationEngine.js (filtering + ranking — new module)
 *  8. Page-specific init (inline <script> at bottom of each page)
 *
 * This file documents the module contract and exposes a convenience
 * init function used by pages that want the full platform stack.
 */

'use strict';

/**
 * Platform namespace — top-level coordinator
 */
const ShonowearPlatform = {

  version: '4.0.0',

  /**
   * Modules loaded (set to true once each module's init runs)
   */
  modules: {
    utils:                false,
    bodyProfile:          false,
    outfitRenderer:       false,
    recommendationEngine: false,
  },

  /**
   * Init all platform features for a given page context.
   * @param {string} pageId - one of: 'home' | 'body-profile' | 'recommendations' | 'outfit' | 'product' | 'collection'
   */
  async init(pageId) {
    // Navbar scroll + progress bar (shared everywhere)
    this._initNavScroll();

    // Fade-in observer (shared everywhere)
    this._initFadeIn();

    // Scroll-to-top button
    this._initScrollTop();

    // Add "Find My Style / My Picks" to nav
    this._injectNavStyleLink();

    // Page-specific init
    switch (pageId) {
      case 'home':
        await this._initHome();
        break;
      case 'body-profile':
        if (typeof initBodyProfile === 'function') initBodyProfile();
        break;
      case 'recommendations':
        if (typeof initRecommendationsPage === 'function') await initRecommendationsPage();
        break;
      case 'outfit':
        // outfit.html has its own inline init
        break;
      case 'product':
        // product.js handles its own init
        break;
    }
  },

  /* ── Shared: navbar scroll ────────────────────────────── */
  _initNavScroll() {
    const nb = document.getElementById('navbar');
    const pr = document.getElementById('nav-progress');
    if (!nb && !pr) return;
    window.addEventListener('scroll', () => {
      nb?.classList.toggle('scrolled', window.scrollY > 60);
      if (pr) {
        const pct = Math.min(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100
        );
        pr.style.width = pct + '%';
      }
    }, { passive: true });
  },

  /* ── Shared: IntersectionObserver fade-in ─────────────── */
  _initFadeIn() {
    const els = document.querySelectorAll('.fade-in-section');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06 });
    els.forEach(e => io.observe(e));
  },

  /* ── Shared: scroll-to-top button ─────────────────────── */
  _initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  },

  /* ── Shared: "Find My Style" nav inject ───────────────── */
  _injectNavStyleLink() {
    const navLinks = document.getElementById('navbar-links') || document.querySelector('.nav-links');
    if (!navLinks) return;
    // Don't add twice
    if (navLinks.querySelector('[data-sw-style-link]')) return;
    const bt = localStorage.getItem('bodyType');
    const li = document.createElement('li');
    li.setAttribute('data-sw-style-link', '1');
    li.innerHTML = bt
      ? `<a href="recommendations.html" style="color:var(--red)!important;"><i class="fas fa-magic" style="margin-right:5px;font-size:10px;"></i>My Picks</a>`
      : `<a href="body-profile.html"><i class="fas fa-magic" style="margin-right:5px;font-size:10px;"></i>Find My Style</a>`;
    navLinks.appendChild(li);
  },

  /* ── Home page init ────────────────────────────────────── */
  async _initHome() {
    // RFY outfit section (outfit cards)
    if (typeof initHomepageRFY === 'function') {
      await initHomepageRFY('rfy-outfit-grid', 4);
    }

    // Onboarding banner
    const done       = localStorage.getItem('sw_profileDone');
    const dismissed  = sessionStorage.getItem('sw_onboard_dismissed');
    const banner     = document.getElementById('onboard-banner');
    if (banner && !done && !dismissed) banner.style.display = 'flex';
  },

};

/* ── dismissOnboard helper (called from inline HTML) ─────── */
window.dismissOnboard = function() {
  const banner = document.getElementById('onboard-banner');
  if (banner) banner.style.display = 'none';
  sessionStorage.setItem('sw_onboard_dismissed', '1');
};

/* ── doMobSearch helper (called from mobile menu) ────────── */
window.doMobSearch = function() {
  const v = document.getElementById('mob-search-input')?.value?.trim();
  if (v) window.location.href = `collection.html?q=${encodeURIComponent(v)}`;
};

/* ── Export ─────────────────────────────────────────────── */
window.ShonowearPlatform = ShonowearPlatform;
