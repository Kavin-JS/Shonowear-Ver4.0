// collection.js

let filteredProducts = [];
let activeFilters = {
  category: '', type: '', anime: '', sort: 'newest', maxPrice: 5000, search: '',
  style: '', bodyType: ''
};

// build anime list from products
function getAnimeList() {
  const all = [...new Set(products.map(p => p.anime).filter(a => a && a !== 'Mixed'))];
  return all.sort();
}

function buildAnimeDropdown() {
  const sel = document.getElementById('anime-filter');
  if (!sel) return;
  const animes = getAnimeList();
  animes.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  });
}

function filterProducts() {
  activeFilters.category = document.getElementById('category-filter').value;
  activeFilters.type     = document.getElementById('type-filter').value;
  activeFilters.anime    = document.getElementById('anime-filter')?.value || '';
  activeFilters.sort     = document.getElementById('sort-filter').value;
  activeFilters.maxPrice = parseInt(document.getElementById('price-filter').value);

  applyFilters();
  updatePriceDisplay();
}

// search within current filters
function searchProducts() {
  activeFilters.search = document.getElementById('search-input').value.toLowerCase().trim();
  applyFilters();
}

function applyFilters() {
  filteredProducts = products.filter(p => {
    const catMatch   = !activeFilters.category || p.category === activeFilters.category;
    const typeMatch  = !activeFilters.type     || p.type.toLowerCase().includes(activeFilters.type.toLowerCase());
    const animeMatch = !activeFilters.anime    || p.anime === activeFilters.anime;
    const priceMatch = p.price <= activeFilters.maxPrice;
    const styleMatch = !activeFilters.style    || p.style === activeFilters.style;
    const btMatch    = !activeFilters.bodyType || (p.bodyTypes && p.bodyTypes.includes(activeFilters.bodyType));
    const searchMatch = !activeFilters.search  ||
      p.name.toLowerCase().includes(activeFilters.search) ||
      (p.anime || '').toLowerCase().includes(activeFilters.search) ||
      p.type.toLowerCase().includes(activeFilters.search) ||
      (p.style || '').toLowerCase().includes(activeFilters.search);
    return catMatch && typeMatch && animeMatch && priceMatch && styleMatch && btMatch && searchMatch;
  });

  switch (activeFilters.sort) {
    case 'price-low':  filteredProducts.sort((a, b) => a.price - b.price); break;
    case 'price-high': filteredProducts.sort((a, b) => b.price - a.price); break;
    case 'name-a':     filteredProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-z':     filteredProducts.sort((a, b) => b.name.localeCompare(a.name)); break;
    default:           filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  renderProducts();
  updatePriceDisplay();
}

function updatePriceDisplay() {
  const el = document.getElementById('price-value');
  if (el) el.textContent = '₹' + activeFilters.maxPrice.toLocaleString();
}


function renderActiveFilterChips() {
  const bar = document.getElementById('active-filters-bar');
  if (!bar) return;
  const chips = [];
  if (activeFilters.category) chips.push({ label: activeFilters.category, key: 'category' });
  if (activeFilters.type)     chips.push({ label: activeFilters.type,     key: 'type' });
  if (activeFilters.anime)    chips.push({ label: activeFilters.anime,    key: 'anime' });
  if (activeFilters.search)   chips.push({ label: `"${activeFilters.search}"`, key: 'search' });
  if (activeFilters.maxPrice < 10000) chips.push({ label: `Max ₹${activeFilters.maxPrice.toLocaleString()}`, key: 'maxPrice' });

  if (!chips.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  bar.innerHTML = `<span class="afc-label">Active:</span>` + chips.map(c => `
    <button class="afc-chip" onclick="clearFilter('${c.key}')">
      ${c.label} <i class="fas fa-times"></i>
    </button>`).join('') + `<button class="afc-clear-all" onclick="resetFilters()">Clear all</button>`;
}

function clearFilter(key) {
  if (key === 'category') { activeFilters.category = ''; document.getElementById('category-filter').value = ''; }
  if (key === 'type')     { activeFilters.type = ''; document.getElementById('type-filter').value = ''; }
  if (key === 'anime')    { activeFilters.anime = ''; const el = document.getElementById('anime-filter'); if (el) el.value = ''; }
  if (key === 'search')   { activeFilters.search = ''; document.getElementById('search-input').value = ''; }
  if (key === 'maxPrice') { activeFilters.maxPrice = 10000; document.getElementById('price-filter').value = '10000'; }
  applyFilters();
}

function renderProducts() {
  const grid    = document.getElementById('products-grid');
  const noRes   = document.getElementById('no-res');
  // result count element
  const counter = document.getElementById('result-count');
  if (!grid) return;

  if (filteredProducts.length === 0) {
    grid.style.display = 'none';
    if (noRes) noRes.style.display = 'block';
    if (counter) counter.textContent = '0 items found';
    renderActiveFilterChips();
    return;
  }

  grid.style.display = 'grid';
  if (noRes) noRes.style.display = 'none';
  // update count
  if (counter) counter.textContent = `${filteredProducts.length} item${filteredProducts.length !== 1 ? 's' : ''} found`;
  renderActiveFilterChips();

  grid.innerHTML = filteredProducts.map(p => renderProductCard(p)).join('');

  // stagger cards in
  grid.querySelectorAll('.prd-card').forEach((c, i) => {
    c.style.cssText = `opacity:0;transform:translateY(16px);transition:opacity .35s ease ${i * .045}s,transform .35s ease ${i * .045}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.style.opacity = '1'; c.style.transform = 'translateY(0)';
    }));
  });

  // wishlist toggle
  grid.querySelectorAll('.prd-wish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const { pid, pname, pprice, ptype } = btn.dataset;
      const icon = btn.querySelector('i');
      if (typeof toggleWishItem === 'function' && pid) {
        const wished = toggleWishItem(pid, pname, parseInt(pprice), ptype);
        icon.className   = wished ? 'fas fa-heart' : 'far fa-heart';
        icon.style.color = wished ? 'var(--red)' : '';
        if (typeof toast === 'function') toast(wished ? 'Saved ❤️' : 'Removed', 'info');
      }
    });
  });
}

function resetFilters() {
  document.getElementById('category-filter').value = '';
  document.getElementById('type-filter').value     = '';
  if (document.getElementById('anime-filter')) document.getElementById('anime-filter').value = '';
  document.getElementById('sort-filter').value     = 'newest';
  document.getElementById('price-filter').value    = '5000';
  document.getElementById('search-input').value    = '';
  activeFilters = { category: '', type: '', anime: '', sort: 'newest', maxPrice: 5000, search: '', style: '', bodyType: '' };
  applyFilters();
}

function clearStyleFilter() {
  activeFilters.style = '';
  const bar = document.getElementById('active-filters-bar');
  if (bar) bar.innerHTML = '';
  const sh = document.querySelector('.sh-title');
  if (sh) sh.textContent = 'ALL PRODUCTS';
  applyFilters();
}

// read URL params on load
document.addEventListener('DOMContentLoaded', () => {
  // Safely initialize from products array (loaded by data.js)
  if (typeof products !== 'undefined') {
    filteredProducts = [...products];
  }
  buildAnimeDropdown();

  const params = new URLSearchParams(window.location.search);
  const q      = params.get('q');
  const type   = params.get('type');
  const style  = params.get('style');
  const anime  = params.get('anime');

  const typeMap = {
    streetwear: 'hoodie', minimal: 'tee', oversized: 'oversized',
    figurines: 'figurine', jackets: 'jacket'
  };

  if (q) {
    document.getElementById('search-input').value = q;
    activeFilters.search = q.toLowerCase();
  }
  if (type) {
    const typeMap = { streetwear: 'hoodie', minimal: 'tee', oversized: 'oversized', figurines: 'figurine', jackets: 'jacket' };
    const mapped = typeMap[type] || type;
    const el = document.getElementById('type-filter');
    if (el) { el.value = mapped; activeFilters.type = mapped; }
  }
  if (style) {
    // style = "Tokyo Street", "Cyberpunk", etc. — filter by p.style
    activeFilters.style = decodeURIComponent(style);
    // Add style chip to show it's active
    const bar = document.getElementById('active-filters-bar');
    if (bar) {
      bar.style.display = 'flex';
      bar.innerHTML = `<span class="afc-label">Style:</span>
        <button class="afc-chip" onclick="clearStyleFilter()">
          ${activeFilters.style} <i class="fas fa-times"></i>
        </button>
        <button class="afc-clear-all" onclick="resetFilters()">Clear all</button>`;
    }
    // Update page title hint
    const sh = document.querySelector('.sh-title');
    if (sh) sh.textContent = activeFilters.style.toUpperCase();
  }
  if (anime) {
    const el = document.getElementById('anime-filter');
    if (el) { el.value = anime; activeFilters.anime = anime; }
  }
  // ?category= from homepage category cards
  const catParam = params.get('category');
  if (catParam) {
    const catEl = document.getElementById('category-filter');
    if (catEl) { catEl.value = catParam; activeFilters.category = catParam; }
  }
  // ?bodyType=Athletic from recommendations page
  const btParam = params.get('bodyType');
  if (btParam) { activeFilters.bodyType = btParam; }

  applyFilters();

  // live search
  const si = document.getElementById('search-input');
  if (si) {
    si.addEventListener('input', () => {
      activeFilters.search = si.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // navbar scroll state
  const nb = document.getElementById('navbar');
  const pr = document.getElementById('nav-progress');
  window.addEventListener('scroll', () => {
    nb?.classList.toggle('scrolled', window.scrollY > 60);
    if (pr) pr.style.width = Math.min((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100) + '%';
  }, { passive: true });
});

/* ── URL State Management ─────────────────────────────────── */

function pushFilterState() {
  const params = new URLSearchParams();
  if (activeFilters.category) params.set('category', activeFilters.category);
  if (activeFilters.type)     params.set('type', activeFilters.type);
  if (activeFilters.anime)    params.set('anime', activeFilters.anime);
  if (activeFilters.style)    params.set('style', activeFilters.style);
  if (activeFilters.search)   params.set('q', activeFilters.search);
  if (activeFilters.sort && activeFilters.sort !== 'newest') params.set('sort', activeFilters.sort);
  if (activeFilters.maxPrice < 10000) params.set('maxPrice', activeFilters.maxPrice);
  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  history.pushState({ filters: { ...activeFilters } }, '', newURL);
}

// Override applyFilters to also push state
const _origApplyFilters = applyFilters;
window.applyFiltersWithState = function() {
  _origApplyFilters();
  pushFilterState();
  // Show skeletons briefly before content renders
  const grid = document.getElementById('products-grid');
  if (grid && grid.innerHTML) {
    grid.classList.add('skeleton-mode');
    setTimeout(() => grid.classList.remove('skeleton-mode'), 150);
  }
};

// Listen for popstate (back/forward navigation)
window.addEventListener('popstate', (e) => {
  if (e.state?.filters) {
    Object.assign(activeFilters, e.state.filters);
    // Sync UI controls to restored state
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('category-filter', activeFilters.category);
    setVal('type-filter',     activeFilters.type);
    setVal('anime-filter',    activeFilters.anime);
    setVal('sort-filter',     activeFilters.sort);
    setVal('price-filter',    activeFilters.maxPrice);
    setVal('search-input',    activeFilters.search);
    _origApplyFilters();
  }
});

/* ── Infinite Scroll ──────────────────────────────────────── */

let visibleCount  = 12;
const PAGE_SIZE   = 12;
let isLoadingMore = false;
let infiniteObserver = null;

function renderProductsPaged() {
  const grid  = document.getElementById('products-grid');
  const noRes = document.getElementById('no-res');
  const counter = document.getElementById('result-count');
  if (!grid) return;

  if (filteredProducts.length === 0) {
    grid.style.display = 'none';
    if (noRes) noRes.style.display = 'block';
    if (counter) counter.textContent = '0 items found';
    renderActiveFilterChips();
    removeSentinel();
    return;
  }

  grid.style.display = 'grid';
  if (noRes) noRes.style.display = 'none';
  const total   = filteredProducts.length;
  const showing = Math.min(visibleCount, total);
  if (counter) counter.textContent = `Showing ${showing} of ${total} product${total !== 1 ? 's' : ''}`;
  renderActiveFilterChips();

  const slice = filteredProducts.slice(0, visibleCount);
  grid.innerHTML = slice.map(p => renderProductCard(p)).join('');

  // Stagger entrance
  grid.querySelectorAll('.prd-card').forEach((c, i) => {
    c.style.cssText = `opacity:0;transform:translateY(16px);transition:opacity .35s ease ${i * .04}s,transform .35s ease ${i * .04}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.style.opacity = '1'; c.style.transform = 'translateY(0)';
    }));
  });

  // Wishlist toggles
  grid.querySelectorAll('.prd-wish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const { pid, pname, pprice, ptype } = btn.dataset;
      const icon = btn.querySelector('i');
      if (typeof toggleWishItem === 'function' && pid) {
        const wished = toggleWishItem(pid, pname, parseInt(pprice), ptype);
        icon.className   = wished ? 'fas fa-heart' : 'far fa-heart';
        icon.style.color = wished ? 'var(--red)' : '';
        if (typeof toast === 'function') toast(wished ? 'Saved ❤️' : 'Removed', 'info');
      }
    });
  });

  // Sentinel for infinite scroll
  if (visibleCount < total) {
    attachSentinel();
  } else {
    removeSentinel();
  }
}

function attachSentinel() {
  removeSentinel();
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const sentinel = document.createElement('div');
  sentinel.id = 'infinite-sentinel';
  sentinel.style.cssText = 'height:1px;width:100%;grid-column:1/-1;';
  grid.appendChild(sentinel);

  infiniteObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoadingMore) {
      loadMoreProducts();
    }
  }, { rootMargin: '200px' });
  infiniteObserver.observe(sentinel);
}

function removeSentinel() {
  if (infiniteObserver) { infiniteObserver.disconnect(); infiniteObserver = null; }
  document.getElementById('infinite-sentinel')?.remove();
}

function loadMoreProducts() {
  isLoadingMore = true;
  const grid = document.getElementById('products-grid');
  if (!grid) { isLoadingMore = false; return; }

  // Show loading spinner
  const spinner = document.createElement('div');
  spinner.id = 'load-spinner';
  spinner.style.cssText = 'grid-column:1/-1;text-align:center;padding:24px;color:var(--muted);font-size:13px;';
  spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size:20px;color:var(--red);"></i>';
  grid.appendChild(spinner);

  setTimeout(() => {
    spinner.remove();
    visibleCount += PAGE_SIZE;
    renderProductsPaged();
    isLoadingMore = false;
  }, 400);
}

// Reset paged count when filters change
const _baseRenderProducts = window.renderProducts;
window.renderProducts = function() {
  visibleCount = PAGE_SIZE;
  renderProductsPaged();
};

/* ── Grid View Toggle ─────────────────────────────────────── */

(function initGridToggle() {
  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Inject toggle buttons if not already present
    const sortWrap = document.querySelector('.coll-sort-wrap');
    if (sortWrap && !document.getElementById('grid-toggle')) {
      const toggleDiv = document.createElement('div');
      toggleDiv.id = 'grid-toggle';
      toggleDiv.style.cssText = 'display:flex;gap:4px;margin-left:8px;';
      toggleDiv.innerHTML = `
        <button id="grid-2col" aria-label="2 column grid"
          style="width:28px;height:28px;background:var(--ink3);border:1px solid var(--border);
          color:var(--muted);font-size:11px;display:flex;align-items:center;justify-content:center;
          transition:all .2s;">
          <i class="fas fa-grip-vertical"></i>
        </button>
        <button id="grid-3col" aria-label="3 column grid"
          style="width:28px;height:28px;background:var(--red);border:1px solid var(--red);
          color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;
          transition:all .2s;">
          <i class="fas fa-th"></i>
        </button>
      `;
      sortWrap.parentElement.appendChild(toggleDiv);

      document.getElementById('grid-2col').addEventListener('click', function() {
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        this.style.cssText += 'background:var(--red);border-color:var(--red);color:#fff;';
        const btn3 = document.getElementById('grid-3col');
        if (btn3) btn3.style.cssText = btn3.style.cssText.replace(/background[^;]+;/g,'') + 'background:var(--ink3);border-color:var(--border);color:var(--muted);';
      });
      document.getElementById('grid-3col').addEventListener('click', function() {
        grid.style.gridTemplateColumns = '';
        this.style.cssText += 'background:var(--red);border-color:var(--red);color:#fff;';
        const btn2 = document.getElementById('grid-2col');
        if (btn2) btn2.style.cssText = btn2.style.cssText.replace(/background[^;]+;/g,'') + 'background:var(--ink3);border-color:var(--border);color:var(--muted);';
      });
    }
  });
})();

/* ── Mobile Filter Bottom-Sheet upgrade ──────────────────── */

(function upgradeMobFilter() {
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.querySelector('.coll-mob-filter-panel');
    if (!panel) return;
    // Convert from slide-from-right to slide-from-bottom
    panel.style.cssText += `
      left:0!important; right:0!important; width:100%!important;
      top:auto!important; bottom:0!important; height:80vh!important;
      transform: translateY(100%)!important;
      border-radius:16px 16px 0 0!important;
      overflow-y:auto!important;
    `;
    const origOpen  = window.openMobFilter;
    const origClose = window.closeMobFilter;
    window.openMobFilter = function() {
      const ov = document.querySelector('.coll-mob-filter-overlay');
      if (ov) ov.classList.add('open');
      panel.style.transform = 'translateY(0)';
      panel.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1)';
    };
    window.closeMobFilter = function() {
      const ov = document.querySelector('.coll-mob-filter-overlay');
      if (ov) ov.classList.remove('open');
      panel.style.transform = 'translateY(100%)';
    };
  });
})();
