/**
 * app.js — Shonowear Pass 4: Startup Visual Overhaul
 * Clean architecture — no pitch-deck sections, image-first
 */

/* ── UTILITIES ───────────────────────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── BOOT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNavSearch();
  initProducts();
  initLookbook();
  initFadeIn();
  initProofCounters();
  initCollReel();
  initOutfitBuilder();
  initDropCountdown();
  initAnalytics();
});

/* ── 1. NAVBAR ───────────────────────────────────────────────── */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const progress = document.getElementById('nav-progress');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    if (progress) {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      progress.style.width = Math.min(pct, 100) + '%';
    }
  }, { passive: true });
}

/* ── 2. LIVE SEARCH ──────────────────────────────────────────── */
function initNavSearch() {
  const input   = document.getElementById('nav-search-input');
  const results = document.getElementById('nav-search-results');
  if (!input || !results) return;

  const run = debounce((q) => {
    if (!q || q.length < 2) { results.classList.remove('open'); return; }
    if (typeof products === 'undefined') return;
    const hits = products.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.anime||'').toLowerCase().includes(q.toLowerCase())
    ).slice(0, 7);

    results.innerHTML = hits.length
      ? hits.map(p => `
          <div class="nsr-item" onclick="window.location='collection.html?q=${encodeURIComponent(p.name)}'">
            <div class="nsr-emoji">${p.img}</div>
            <div>
              <span class="nsr-name">${hl(p.name, q)}</span>
              <span class="nsr-price">₹${p.price.toLocaleString()}</span>
            </div>
          </div>`).join('')
      : `<div class="nsr-empty">No results for "${q}"</div>`;
    results.classList.add('open');
  }, 180);

  input.addEventListener('input',   e => run(e.target.value.trim()));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value.trim(); if (v) window.location.href = `collection.html?q=${encodeURIComponent(v)}`; }
    if (e.key === 'Escape') results.classList.remove('open');
  });
  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !results.contains(e.target)) results.classList.remove('open');
  });
}
function hl(text, q) {
  return text.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'),
    '<mark>$1</mark>');
}

/* Mobile search */
function doMobSearch() {
  const v = document.getElementById('mob-search-input')?.value.trim();
  if (v) window.location.href = `collection.html?q=${encodeURIComponent(v)}`;
}
function doSearch() {
  const v = document.getElementById('search-input')?.value.trim();
  if (v) window.location.href = `collection.html?q=${encodeURIComponent(v)}`;
}

/* ── 3. PRODUCTS ─────────────────────────────────────────────── */
function initProducts() {
  const skeleton = document.getElementById('prod-skeleton');
  const grid     = document.getElementById('featured-products');
  if (!grid) return;

  // skeleton → grid
  setTimeout(() => {
    if (skeleton) skeleton.style.display = 'none';
    grid.style.display = 'grid';
    renderProdGrid('all');
    stagger(grid);
    renderNewArrivals();
  }, 550);

  // tab filter
  document.querySelectorAll('#prod-filters .pf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#prod-filters .pf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grid.style.cssText = 'opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;display:grid';
      setTimeout(() => {
        renderProdGrid(btn.dataset.filter);
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
        stagger(grid);
      }, 200);
    });
  });
}

function renderProdGrid(filter) {
  const grid = document.getElementById('featured-products');
  if (!grid || typeof products === 'undefined') return;
  const subset = filter === 'all'
    ? products.slice(0, 8)
    : products.filter(p => p.type === filter).slice(0, 8);
  grid.innerHTML = subset.length
    ? subset.map(p => renderProductCard(p)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted)"><i class="fas fa-box-open" style="font-size:2.5rem;display:block;margin-bottom:14px;opacity:.3"></i>No items in this category yet.</div>`;
  attachWish(grid);
}

function renderNewArrivals() {
  const el = document.getElementById('new-arrivals-preview');
  if (!el || typeof products === 'undefined') return;
  const items = products.filter(p => p.isNew).slice(0, 4);
  el.innerHTML = items.map(p => renderProductCard(p)).join('');
  attachWish(el);
  stagger(el);
}

function stagger(grid) {
  grid.querySelectorAll('.prd-card').forEach((c, i) => {
    c.style.cssText = `opacity:0;transform:translateY(18px);transition:opacity .4s ease ${i*.065}s,transform .4s ease ${i*.065}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.style.opacity = '1'; c.style.transform = 'translateY(0)';
    }));
  });
}

function attachWish(grid) {
  grid.querySelectorAll('.prd-wish').forEach(btn => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', e => {
      e.stopPropagation();
      const { pid, pname, pprice, ptype } = fresh.dataset;
      const icon = fresh.querySelector('i');
      if (typeof toggleWishItem === 'function') {
        const wished = toggleWishItem(pid, pname, parseInt(pprice), ptype);
        icon.className   = wished ? 'fas fa-heart' : 'far fa-heart';
        icon.style.color = wished ? 'var(--red)' : '';
        if (typeof toast === 'function') toast(wished ? 'Saved to wishlist ❤️' : 'Removed from wishlist', 'info');
      } else {
        const on = icon.classList.contains('fas');
        icon.className   = on ? 'far fa-heart' : 'fas fa-heart';
        icon.style.color = on ? '' : 'var(--red)';
      }
    });
  });
}

/* ── 4. LOOKBOOK FILTER ──────────────────────────────────────── */
function initLookbook() {
  const tabs  = document.querySelectorAll('.lb-tab');
  const cards = document.querySelectorAll('.lb-card');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const u = tab.dataset.lb;
      cards.forEach(card => {
        const match = u === 'all' || card.dataset.universe === u;
        card.style.transition = 'opacity .3s,transform .3s';
        card.style.opacity    = match ? '1' : '0.12';
        card.style.transform  = match ? 'scale(1)' : 'scale(.97)';
        card.style.pointerEvents = match ? '' : 'none';
      });
    });
  });
}

/* ── 5. FADE-IN ON SCROLL ────────────────────────────────────── */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in-section');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.07 });
  els.forEach(e => io.observe(e));
}

/* ── 6. PROOF COUNTERS ───────────────────────────────────────── */
function initProofCounters() {
  document.querySelectorAll('.proof-num[data-target]').forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const dec     = parseInt(el.dataset.decimal || '0');
    const suffix  = el.dataset.suffix || '';
    const dur     = 1600;
    const start   = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (dec ? (e * target).toFixed(dec) : Math.floor(e * target)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ── 7. COLLECTION REEL DRAG ─────────────────────────────────── */
function initCollReel() {
  const reel = document.querySelector('.coll-reel');
  if (!reel) return;
  // collection clicks wired in HTML
}

function goCollection(type) {
  window.location.href = `collection.html?type=${encodeURIComponent(type)}`;
}

/* ── 8. NEWSLETTER ───────────────────────────────────────────── */
function nlSubscribe() {
  const emailEl = document.getElementById('nl-email');
  const btn     = document.getElementById('nl-btn');
  if (!emailEl || !btn) return;
  const email = emailEl.value.trim();
  const rx    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !rx.test(email)) {
    emailEl.style.borderColor = 'var(--red)';
    emailEl.focus();
    setTimeout(() => emailEl.style.borderColor = '', 1600);
    if (typeof toast === 'function') toast('Please enter a valid email.', 'error');
    return;
  }
  // Already subscribed check
  const subs = JSON.parse(localStorage.getItem('sw_newsletter') || '[]');
  if (subs.includes(email.toLowerCase())) {
    if (typeof toast === 'function') toast('You\'re already subscribed! 🎉', 'info');
    return;
  }
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  btn.disabled = true;
  setTimeout(() => {
    subs.push(email.toLowerCase());
    localStorage.setItem('sw_newsletter', JSON.stringify(subs));
    emailEl.value = '';
    btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
    btn.style.background = '#10b981';
    if (typeof toast === 'function') toast("You're in! Welcome to the community 🎉", 'success');
    setTimeout(() => { btn.innerHTML = 'Subscribe <i class="fas fa-arrow-right"></i>'; btn.style.background = ''; btn.disabled = false; }, 3500);
  }, 1200);
}

/* ── FIX #12: Scroll-to-top button visibility ────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   STARTUP UPGRADE — New features
   ══════════════════════════════════════════════════════ */



/* ── OUTFIT BUILDER ─────────────────────────────────── */

const OUTFITS = {
  naruto: {
    universe: 'Naruto Universe',
    name: 'Konoha Street Edit',
    tagline: 'The tension between identity and belonging. Rendered in heavyweight cotton and purposeful graphics.',
    items: ['p1','p2','p3'],
  },
  jjk: {
    universe: 'Jujutsu Kaisen',
    name: 'Domain Expansion Set',
    tagline: 'Channeling the Shibuya arc — dark, precise, limitless. Built for those who see the world differently.',
    items: ['p9','p10','p11'],
  },
  aot: {
    universe: 'Attack on Titan',
    name: 'Scout Regiment Fit',
    tagline: 'Wings of Freedom. The spirit of Erwin rendered in clean cuts and premium material.',
    items: ['p13','p14','p16'],
  },
  demon: {
    universe: 'Demon Slayer',
    name: 'Tanjiro Signature Look',
    tagline: 'Total concentration. The discipline of a Hashira embodied in fabric and form.',
    items: ['p17','p18','p19'],
  },
  op: {
    universe: 'One Piece',
    name: 'Grand Line Explorer',
    tagline: 'Luffy\'s spirit in every thread. For those chasing their own Grand Line.',
    items: ['p5','p6','p7'],
  },
};

function initOutfitBuilder() {
  const tabs  = document.querySelectorAll('.ob-tab');
  const stage = document.getElementById('ob-stage');
  if (!tabs.length || !stage) return;

  renderOutfit('naruto');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      stage.style.opacity = '0';
      stage.style.transform = 'translateY(8px)';
      stage.style.transition = 'opacity .2s,transform .2s';
      setTimeout(() => {
        renderOutfit(tab.dataset.universe);
        stage.style.opacity = '1';
        stage.style.transform = 'translateY(0)';
      }, 200);
      trackEvent('outfit_builder_tab', { universe: tab.dataset.universe });
    });
  });
}

function renderOutfit(universeKey) {
  const stage   = document.getElementById('ob-stage');
  const outfit  = OUTFITS[universeKey];
  if (!stage || !outfit || typeof products === 'undefined') return;

  const items = outfit.items
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  const total = items.reduce((s, p) => s + p.price, 0);

  const itemsHTML = items.map(p => {
    const img = getProductImage(p);
    return `
      <div class="ob-item" onclick="window.location='product.html?id=${p.id}'">
        <div class="ob-item-img" style="background-image:url('${img}')"></div>
        <div>
          <p class="ob-item-anime">${p.anime}</p>
          <p class="ob-item-name">${p.name}</p>
          <p class="ob-item-price">₹${p.price.toLocaleString()}</p>
        </div>
      </div>`;
  }).join('');

  stage.innerHTML = `
    <div class="ob-outfit">
      <div class="ob-editorial">
        <p class="ob-universe-tag">${outfit.universe}</p>
        <h3 class="ob-name">${outfit.name}</h3>
        <p class="ob-tagline">${outfit.tagline}</p>
        <div class="ob-total">
          <span class="ob-total-label">Complete Look</span>
          <span class="ob-total-price">₹${total.toLocaleString()}</span>
        </div>
        <button class="ob-add-all" onclick="addOutfitToCart('${universeKey}')">
          <i class="fas fa-shopping-bag"></i> Add All Pieces to Cart
        </button>
      </div>
      <div class="ob-items">${itemsHTML}</div>
    </div>`;
}

function addOutfitToCart(universeKey) {
  const outfit = OUTFITS[universeKey];
  if (!outfit || typeof products === 'undefined') return;

  const items = outfit.items.map(id => products.find(p => p.id === id)).filter(Boolean);
  const cart  = JSON.parse(localStorage.getItem('sw_cart') || '[]');

  items.forEach(p => {
    const key = `${p.id}-One Size`;
    const existing = cart.find(i => i.key === key);
    if (existing) existing.qty++;
    else cart.push({ key, id: p.id, name: p.name, price: p.price, size: 'One Size', qty: 1 });
  });

  localStorage.setItem('sw_cart', JSON.stringify(cart));
  updateCartBadge();

  const cw = document.querySelector('.cart-wrap');
  if (cw) { cw.classList.remove('added'); void cw.offsetWidth; cw.classList.add('added'); setTimeout(() => cw.classList.remove('added'), 600); }

  if (typeof toast === 'function') toast(`${outfit.name} — ${items.length} pieces added to cart! 🔥`, 'success');
  trackEvent('outfit_add_all', { universe: universeKey, total: items.length });
}

/* ── DROP COUNTDOWN ─────────────────────────────────── */

function initDropCountdown() {
  const hEl = document.getElementById('dc-h');
  const mEl = document.getElementById('dc-m');
  const sEl = document.getElementById('dc-s');
  if (!hEl) return;

  // Count down to next 48h from now (simulated)
  const end = new Date();
  end.setHours(end.getHours() + 47, end.getMinutes() + 23, end.getSeconds() + 14);

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { hEl.textContent = mEl.textContent = sEl.textContent = '00'; return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ── SIMULATED ANALYTICS ─────────────────────────────── */

const _analytics = [];

function trackEvent(event, data = {}) {
  const entry = { event, data, ts: Date.now() };
  _analytics.push(entry);
  // In production this would be: fetch('/api/track', { method:'POST', body: JSON.stringify(entry) })
  // Analytics logged (console.debug removed for production)
}

function initAnalytics() {
  // Track product card clicks
  document.addEventListener('click', e => {
    const card = e.target.closest('.prd-card');
    if (card) {
      const id = card.getAttribute('onclick')?.match(/id=(p\d+)/)?.[1];
      if (id) trackEvent('product_click', { id });
    }
    // Track CTA clicks
    const cta = e.target.closest('.cta-primary, .cta-ghost, .spot-btn');
    if (cta) trackEvent('cta_click', { text: cta.textContent.trim(), href: cta.href || '' });
  });

  // Track search queries (debounced)
  const searchInput = document.getElementById('nav-search-input');
  if (searchInput) {
    const trackSearch = debounce(q => {
      if (q.length >= 2) trackEvent('search', { query: q });
    }, 800);
    searchInput.addEventListener('input', e => trackSearch(e.target.value));
  }

  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (pct > maxScroll + 10) {
      maxScroll = pct;
      trackEvent('scroll_depth', { pct });
    }
  }, { passive: true });

  // Track add-to-cart
  const origAdd = typeof addToCart !== 'undefined' ? addToCart : null;
  if (origAdd) {
    window.addToCart = function(id, name, price) {
      trackEvent('add_to_cart', { id, name, price });
      origAdd(id, name, price);
    };
  }
}

/* ── SCROLL-TOP INIT (inner pages) ──────────────────── */
(function initScrollTopInner() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
})();
