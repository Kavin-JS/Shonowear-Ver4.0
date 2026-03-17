/**
 * recommendationEngine.js — Outfit recommendation engine
 * Shonowear platform
 *
 * Responsibilities:
 *  1. Read bodyType from localStorage
 *  2. Load outfits from data/outfits.json
 *  3. Filter outfits matching user's bodyType
 *  4. Rank by trendScore (descending)
 *  5. Optionally filter by style preference
 *  6. Render results via outfitRenderer.js
 */

'use strict';

/* ── Engine state ────────────────────────────────────────── */

const RecommendationEngine = {

  outfits:     null,   // loaded from data/outfits.json
  userProfile: null,   // from localStorage
  filtered:    [],     // currently displayed results
  currentStyle: 'all', // active style filter

  /* ── Load data ─────────────────────────────────────────── */

  async load() {
    if (this.outfits) return this.outfits;
    this.outfits = await loadJSON('data/outfits.json');
    window._outfitsCache = this.outfits; // shared cache for outfitRenderer
    return this.outfits;
  },

  /* ── Read user profile ──────────────────────────────────── */

  readProfile() {
    return {
      bodyType:   localStorage.getItem('bodyType') || null,
      bmi:        localStorage.getItem('sw_bmi') || null,
      height:     localStorage.getItem('sw_height') || null,
      weight:     localStorage.getItem('sw_weight') || null,
      stylePrefs: JSON.parse(localStorage.getItem('sw_stylePrefs') || '[]'),
    };
  },

  /* ── Filter outfits ─────────────────────────────────────── */

  filter(outfits, bodyType, styleFilter = 'all') {
    if (!outfits || !outfits.length) return [];

    let results = outfits.filter(o => {
      // Must match body type
      if (bodyType && !o.bodyTypes?.includes(bodyType)) return false;
      // Style filter
      if (styleFilter !== 'all' && o.styleSlug !== styleFilter && o.style !== styleFilter) return false;
      return true;
    });

    return results;
  },

  /* ── Rank outfits ───────────────────────────────────────── */

  rank(outfits, stylePrefs = []) {
    return [...outfits].sort((a, b) => {
      // Preferred styles first
      const aP = stylePrefs.some(s => a.style === s || a.styleSlug === s) ? 1 : 0;
      const bP = stylePrefs.some(s => b.style === s || b.styleSlug === s) ? 1 : 0;
      if (aP !== bP) return bP - aP;
      // Then by trend score
      return (b.trendScore || 0) - (a.trendScore || 0);
    });
  },

  /* ── Get recommendations ─────────────────────────────────── */

  async getRecommendations(styleFilter = 'all', limit = null) {
    const outfits = await this.load();
    const profile = this.readProfile();
    const { bodyType, stylePrefs } = profile;

    const filtered = this.filter(outfits, bodyType, styleFilter);
    const ranked   = this.rank(filtered, stylePrefs);

    this.filtered     = ranked;
    this.userProfile  = profile;
    this.currentStyle = styleFilter;

    return limit ? ranked.slice(0, limit) : ranked;
  },

  /* ── Get all outfits (no body type filter) ───────────────── */

  async getAllByStyle(styleFilter = 'all') {
    const outfits = await this.load();
    if (styleFilter === 'all') return this.rank(outfits);
    return outfits.filter(o => o.styleSlug === styleFilter || o.style === styleFilter);
  },

  /* ── Get single outfit by ID ─────────────────────────────── */

  async getOutfitById(id) {
    const outfits = await this.load();
    return (outfits || []).find(o => o.id === id) || null;
  },

};

/* ── Page: recommendations.html init ────────────────────── */

async function initRecommendationsPage() {
  const container   = document.getElementById('rec-outfit-container');
  const bodyType    = localStorage.getItem('bodyType');
  const noProfile   = document.getElementById('rec-no-profile');
  const hasProfile  = document.getElementById('rec-has-profile');

  // No profile state
  if (!bodyType) {
    if (noProfile)  noProfile.style.display  = 'block';
    if (hasProfile) hasProfile.style.display = 'none';
    return;
  }

  if (noProfile)  noProfile.style.display  = 'none';
  if (hasProfile) hasProfile.style.display = 'block';

  // Update profile bar
  renderRecProfileBar();

  // Initial load
  await refreshOutfitGrid('all');

  // Wire style filter tabs
  document.querySelectorAll('[data-outfit-style]').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('[data-outfit-style]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await refreshOutfitGrid(btn.dataset.outfitStyle);
    });
  });
}

async function refreshOutfitGrid(styleFilter) {
  const container = document.getElementById('rec-outfit-container');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted);"><i class="fas fa-circle-notch fa-spin" style="font-size:2rem;"></i></div>';

  const outfits  = await RecommendationEngine.getRecommendations(styleFilter);
  const profile  = RecommendationEngine.userProfile;

  renderOutfitGrid(outfits, container, profile?.bodyType);
}

function renderRecProfileBar() {
  const bar      = document.getElementById('rec-profile-bar');
  const h1El     = document.getElementById('rec-h1');
  const subEl    = document.getElementById('rec-sub');
  if (!bar) return;

  const profile  = RecommendationEngine.readProfile();
  const { bodyType, bmi, height, weight } = profile;
  if (!bodyType) return;

  const meta = getBodyTypeMeta(bodyType);

  bar.innerHTML = `
    <div class="rec-body-badge">
      <i class="${meta.icon}"></i>
      <span>Body Type</span>
      <strong>${bodyType}</strong>
    </div>
    ${bmi ? `<span class="rec-bmi-chip">BMI ${parseFloat(bmi).toFixed(1)}</span>` : ''}
    ${height && weight ? `<span class="rec-bmi-chip">${height}cm · ${weight}kg</span>` : ''}
    <a href="body-profile.html" class="rec-edit-link"><i class="fas fa-edit"></i> Edit Profile</a>
  `;

  if (h1El) h1El.textContent = `OUTFITS FOR ${bodyType.toUpperCase()} BUILDS.`;
  if (subEl) subEl.textContent = meta.desc;
}

/* ── Homepage: "Recommended for You" section ─────────────── */

async function initHomepageRFY(containerId = 'rfy-outfit-grid', limit = 4) {
  const bodyType  = localStorage.getItem('bodyType');
  const section   = document.getElementById('recommended-for-you');
  if (!section) return;

  if (!bodyType) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  // Profile strip
  const strip = document.getElementById('rfy-profile-strip');
  if (strip) {
    const profile = RecommendationEngine.readProfile();
    const meta    = getBodyTypeMeta(bodyType);
    const sp      = profile.stylePrefs || [];
    strip.innerHTML = `
      <div class="rfy-strip">
        <span class="rfy-bt-chip"><i class="${meta.icon}"></i> ${bodyType} Build${profile.bmi ? ' · BMI ' + parseFloat(profile.bmi).toFixed(1) : ''}</span>
        ${sp.map(s => `<span class="rfy-style-chip">${s}</span>`).join('')}
        <a href="body-profile.html" class="rfy-edit"><i class="fas fa-edit"></i> Update</a>
      </div>`;
  }

  const outfits   = await RecommendationEngine.getRecommendations('all', limit);
  const container = document.getElementById(containerId);
  if (container) renderOutfitGrid(outfits, container, bodyType);
}

/* ── Global exports ─────────────────────────────────────── */
window.RecommendationEngine       = RecommendationEngine;
window.initRecommendationsPage    = initRecommendationsPage;
window.initHomepageRFY            = initHomepageRFY;
window.refreshOutfitGrid          = refreshOutfitGrid;
