/**
 * nav.js — Professional ecommerce navbar
 * Shonowear — single source of truth for all pages
 */
(function () {
  // ── Apply saved theme immediately (before render) to prevent FOUC ──
  (function earlyTheme() {
    const t = localStorage.getItem('sw_theme') || 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = t === 'dark' || (t === 'system' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  })();
  const page = document.currentScript?.getAttribute('data-page') || '';
  const bodyType = localStorage.getItem('bodyType') || localStorage.getItem('sw_bodyType');
  const active = (p) => p === page ? ' class="active"' : '';

  const NAV_HTML = `
  <div class="announce-bar" id="announce-bar">
    <div class="ab-inner">
      <span>🔥 <strong>New Collection Live</strong> &nbsp;·&nbsp; Free shipping above ₹999 &nbsp;·&nbsp; Use code <strong>ANIME10</strong> for 10% off</span>
      <button class="ab-close" onclick="this.parentElement.parentElement.style.display='none';sessionStorage.setItem('sw_announce_closed','1')" aria-label="Close">✕</button>
    </div>
  </div>

  <nav class="navbar" id="navbar">
    <div class="nav-inner">

      <!-- Logo -->
      <a href="index.html" class="nav-logo">SHONO<span>WEAR</span></a>

      <!-- Center: links + search -->
      <div class="nav-center">
        <ul class="nav-links" id="navbar-links">
          <li class="nav-has-drop">
            <a href="collection.html?category=Apparel"${active('collection')}>Men <i class="fas fa-chevron-down" style="font-size:8px;margin-left:3px;"></i></a>
            <div class="nav-dropdown">
              <div class="nav-drop-col">
                <p class="nav-drop-head">Categories</p>
                <a href="collection.html?type=hoodie"><i class="fas fa-tshirt"></i> Hoodies</a>
                <a href="collection.html?type=tee"><i class="fas fa-tshirt"></i> Graphic Tees</a>
                <a href="collection.html?type=oversized"><i class="fas fa-tshirt"></i> Oversized</a>
                <a href="collection.html?type=jacket"><i class="fas fa-tshirt"></i> Jackets</a>
              </div>
              <div class="nav-drop-col">
                <p class="nav-drop-head">By Style</p>
                <a href="collection.html?style=Tokyo+Street">Tokyo Street</a>
                <a href="collection.html?style=Cyberpunk">Cyberpunk</a>
                <a href="collection.html?style=Minimal+Anime">Minimal Anime</a>
                <a href="collection.html?style=Shibuya+Casual">Shibuya Casual</a>
              </div>
              <div class="nav-drop-col nav-drop-featured">
                <p class="nav-drop-head">Featured</p>
                <a href="new-arrivals.html" class="nav-drop-badge-link"><span class="nav-drop-badge">NEW</span> New Arrivals</a>
                <a href="collection.html">All Products →</a>
              </div>
            </div>
          </li>
          <li class="nav-has-drop">
            <a href="collection.html?category=Apparel">Women <i class="fas fa-chevron-down" style="font-size:8px;margin-left:3px;"></i></a>
            <div class="nav-dropdown">
              <div class="nav-drop-col">
                <p class="nav-drop-head">Categories</p>
                <a href="collection.html?type=hoodie"><i class="fas fa-tshirt"></i> Hoodies</a>
                <a href="collection.html?type=tee"><i class="fas fa-tshirt"></i> Graphic Tees</a>
                <a href="collection.html?type=oversized"><i class="fas fa-tshirt"></i> Oversized</a>
              </div>
              <div class="nav-drop-col">
                <p class="nav-drop-head">By Style</p>
                <a href="collection.html?style=Minimal+Anime">Minimal Anime</a>
                <a href="collection.html?style=Shibuya+Casual">Shibuya Casual</a>
                <a href="collection.html?style=Tokyo+Street">Tokyo Street</a>
              </div>
            </div>
          </li>
          <li><a href="collection.html?type=oversized">Oversized</a></li>
          <li><a href="collection.html?type=tee">Graphic Tees</a></li>
          <li><a href="collection.html?type=hoodie">Hoodies</a></li>
          <li><a href="collection.html"${active('collection')}>Collections</a></li>
          <li><a href="new-arrivals.html"${active('new-arrivals')}>New Arrivals</a></li>
        </ul>

        <!-- Search bar -->
        <div class="nav-search" id="nav-search-wrap">
          <i class="fas fa-search nav-search-icon"></i>
          <input type="text" id="nav-search-input"
            placeholder="Search for products..."
            autocomplete="off"
            aria-label="Search products" />
          <div class="nav-search-results" id="nav-search-results"></div>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="nav-actions">
        <a href="login.html" class="nav-icon-btn" id="nav-account-btn" title="Account">
          <i class="fas fa-user"></i>
        </a>
        <button class="nav-icon-btn" id="wish-toggle" title="Wishlist" onclick="openWishlist()" style="position:relative;">
          <i class="far fa-heart"></i>
          <div class="wish-badge" id="wish-badge" style="display:none;">0</div>
        </button>
        <a href="cart.html" class="nav-icon-btn nav-cart-btn" title="Cart">
          <i class="fas fa-shopping-bag"></i>
          <div class="cart-badge" style="display:none;">0</div>
        </a>
        <div class="nav-user-drop" id="nav-user" style="display:none;">
          <span class="nav-uname" id="nav-uname"></span>
          <button class="nav-logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </div>

      <button class="nav-toggle" id="nav-toggle" aria-label="Menu"><i class="fas fa-bars"></i></button>
    </div>
  </nav>
  <div class="nav-progress" id="nav-progress"></div>

  <!-- Mobile overlay + menu -->
  <div class="mob-overlay" id="mob-ov" onclick="closeMob()" aria-hidden="true"></div>
  <div class="mob-menu" id="mob-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">

    <!-- Header -->
    <div class="mob-head">
      <a href="index.html" class="mob-logo">SHONO<em>WEAR</em></a>
      <button class="mob-close" onclick="closeMob()" aria-label="Close menu"><i class="fas fa-times"></i></button>
    </div>

    <!-- Search -->
    <div class="mob-search">
      <span class="mob-search-icon"><i class="fas fa-search"></i></span>
      <input type="text" id="mob-search-input" placeholder="Search for products..." aria-label="Search products" />
      <button onclick="doMobSearch()" aria-label="Submit search"><i class="fas fa-arrow-right"></i></button>
    </div>

    <!-- Nav links -->
    <div class="mob-links">
      <a href="index.html" class="mob-link"><i class="fas fa-home"></i> Home</a>
      <div class="mob-divider"></div>

      <p class="mob-section-label">Men</p>
      <a href="collection.html?type=hoodie" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Hoodies</a>
      <a href="collection.html?type=tee" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Graphic Tees</a>
      <a href="collection.html?type=oversized" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Oversized</a>
      <a href="collection.html?type=jacket" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Jackets</a>
      <div class="mob-divider"></div>

      <p class="mob-section-label">Women</p>
      <a href="collection.html?type=hoodie" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Hoodies</a>
      <a href="collection.html?type=tee" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Graphic Tees</a>
      <a href="collection.html?type=oversized" class="mob-link mob-link-sub"><i class="fas fa-tshirt"></i> Oversized</a>
      <div class="mob-divider"></div>

      <p class="mob-section-label">Collections</p>
      <a href="collection.html" class="mob-link"><i class="fas fa-th-large"></i> All Collections</a>
      <a href="new-arrivals.html" class="mob-link"><i class="fas fa-fire"></i> New Arrivals</a>
      <a href="recommendations.html" class="mob-link"><i class="fas fa-magic"></i> Outfits</a>
      <div class="mob-divider"></div>

      <a href="about.html" class="mob-link"><i class="fas fa-info-circle"></i> About</a>
      <a href="contact.html" class="mob-link"><i class="fas fa-envelope"></i> Contact</a>
    </div>

    <!-- Theme toggle -->
    <div class="mob-theme-section">
      <span class="mob-theme-label">Theme</span>
      <div class="mob-theme-btns" role="group" aria-label="Theme selector">
        <button class="mob-theme-btn" data-theme-set="light" aria-pressed="false"><i class="fas fa-sun"></i> Light</button>
        <button class="mob-theme-btn" data-theme-set="dark" aria-pressed="false"><i class="fas fa-moon"></i> Dark</button>
        <button class="mob-theme-btn" data-theme-set="system" aria-pressed="false"><i class="fas fa-circle-half-stroke"></i> System</button>
      </div>
    </div>

    <!-- Footer: auth + cart -->
    <div class="mob-footer">
      <div class="mob-auth-row">
        <a href="login.html" class="mob-auth-btn" id="mob-login"><i class="fas fa-user"></i> Sign In</a>
        <a href="signup.html" class="mob-signup-btn"><i class="fas fa-user-plus"></i> Sign Up</a>
      </div>
      <a href="cart.html" class="mob-cart-btn"><i class="fas fa-shopping-bag"></i> Cart (<span class="mob-cart-count">0</span>)</a>
    </div>
  </div>

  <!-- Wishlist sidebar -->
  <div class="wish-overlay" id="wish-overlay" onclick="closeWishlist()" style="display:none;position:fixed;inset:0;z-index:1003;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);"></div>
  <div class="wish-sidebar" id="wish-sidebar" style="position:fixed;top:0;right:-100%;width:380px;max-width:95vw;height:100vh;z-index:1004;overflow:hidden;background:var(--ink2);border-left:1px solid var(--border);display:flex;flex-direction:column;transition:right .35s cubic-bezier(.4,0,.2,1);">
    <div class="wish-head">
      <h3><i class="far fa-heart" style="color:var(--red);margin-right:8px;"></i>Saved Items</h3>
      <button onclick="closeWishlist()"><i class="fas fa-times"></i></button>
    </div>
    <div class="wish-items" id="wish-items" style="flex:1;overflow-y:auto;padding:16px;"></div>
    <div class="wish-empty" id="wish-empty">
      <i class="far fa-heart"></i>
      <p>No saved items yet.</p>
      <a href="collection.html" onclick="closeWishlist()">Browse Collection</a>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  // Restore announce bar
  if (sessionStorage.getItem('sw_announce_closed')) {
    const ab = document.getElementById('announce-bar');
    if (ab) ab.style.display = 'none';
  }

  // Scroll behaviour
  window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    const pr = document.getElementById('nav-progress');
    const st = document.getElementById('scroll-top');
    if (nb) nb.classList.toggle('scrolled', window.scrollY > 60);
    if (pr) pr.style.width = Math.min(
      (window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)) * 100, 100
    ) + '%';
    if (st) st.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Mobile menu
  window.openMob = () => {
    document.getElementById('mob-ov')?.classList.add('on');
    document.getElementById('mob-menu')?.classList.add('on');
    document.getElementById('mob-menu')?.focus();
    document.body.style.overflow = 'hidden';
  };
  window.closeMob = () => {
    document.getElementById('mob-ov')?.classList.remove('on');
    document.getElementById('mob-menu')?.classList.remove('on');
    document.body.style.overflow = '';
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-toggle')?.addEventListener('click', openMob);

    // Live search
    const searchInput = document.getElementById('nav-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounceSearch);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) window.location.href = 'collection.html?q=' + encodeURIComponent(q);
        }
      });
    }

    // Sync mobile cart count
    const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
    const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
    document.querySelectorAll('.mob-cart-count').forEach(el => el.textContent = total);

    // Account button
    const user = localStorage.getItem('sw_user');
    const uname = localStorage.getItem('sw_username');
    if (user) {
      const btn = document.getElementById('nav-account-btn');
      const lbl = document.getElementById('nav-uname-label');
      if (btn) btn.href = '#';
      if (lbl) lbl.textContent = uname || 'Account';
      const userEl = document.getElementById('nav-user');
      const unameEl = document.getElementById('nav-uname');
      if (userEl) userEl.style.display = 'flex';
      if (unameEl) unameEl.textContent = uname || 'User';
    }
  });

  // ── Theme toggle system ─────────────────────────────────────────
  (function initTheme() {
    const saved = localStorage.getItem('sw_theme') || 'dark';
    applyTheme(saved);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-set]');
      if (!btn) return;
      const choice = btn.dataset.themeSet;
      localStorage.setItem('sw_theme', choice);
      applyTheme(choice);
      updateThemeButtons(choice);
    });

    // Sync buttons whenever sidebar opens
    const origOpen = window.openMob;
    window.openMob = function () {
      origOpen();
      updateThemeButtons(localStorage.getItem('sw_theme') || 'dark');
    };

    // Watch system changes when "system" selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if ((localStorage.getItem('sw_theme') || 'dark') === 'system') applyTheme('system');
    });
  })();

  function applyTheme(choice) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = choice === 'dark' || (choice === 'system' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  function updateThemeButtons(choice) {
    document.querySelectorAll('[data-theme-set]').forEach(btn => {
      const active = btn.dataset.themeSet === choice;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // Mobile search
  window.doMobSearch = function () {
    const q = document.getElementById('mob-search-input')?.value?.trim();
    if (q) window.location.href = 'collection.html?q=' + encodeURIComponent(q);
  };

  // Live search with debounce
  let searchTimer;
  function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 280);
  }

  function runSearch() {
    const input = document.getElementById('nav-search-input');
    const results = document.getElementById('nav-search-results');
    if (!input || !results) return;
    const q = input.value.trim().toLowerCase();
    if (!q || q.length < 2) { results.style.display = 'none'; return; }

    if (typeof products === 'undefined') {
      results.innerHTML = `<a class="nsr-item" href="collection.html?q=${encodeURIComponent(q)}"><i class="fas fa-search"></i> Search for "${q}"</a>`;
      results.style.display = 'block';
      return;
    }

    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.anime || '').toLowerCase().includes(q) ||
      (p.type || '').toLowerCase().includes(q)
    ).slice(0, 6);

    if (!matches.length) {
      results.innerHTML = `<div class="nsr-empty">No results for "${q}"</div>`;
    } else {
      results.innerHTML = matches.map(p => `
        <a class="nsr-item" href="product.html?id=${p.id}">
          <span class="nsr-name">${p.name}</span>
          <span class="nsr-price">₹${p.price.toLocaleString()}</span>
        </a>`).join('') +
        `<a class="nsr-view-all" href="collection.html?q=${encodeURIComponent(q)}">View all results →</a>`;
    }
    results.style.display = 'block';
  }

  // Close search on outside click
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('nav-search-wrap');
    const results = document.getElementById('nav-search-results');
    if (wrap && !wrap.contains(e.target) && results) results.style.display = 'none';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMob();
      const results = document.getElementById('nav-search-results');
      if (results) results.style.display = 'none';
    }
  });

})();