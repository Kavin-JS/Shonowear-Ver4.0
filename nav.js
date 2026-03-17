/**
 * nav.js — Single source of truth for navbar, mobile menu, wishlist sidebar
 * Shonowear
 *
 * Replaces ALL hardcoded navbar HTML across every page.
 * Load as FIRST script in <body> — before data.js, main.js, etc.
 *
 * Usage:
 *   <script src="nav.js" data-page="home"></script>
 *
 * data-page values: home | collection | outfits | new-arrivals | about | contact
 */
(function () {

  const page   = document.currentScript?.getAttribute('data-page') || '';
  const bodyType = localStorage.getItem('bodyType') || localStorage.getItem('sw_bodyType');

  const active = (p) => p === page ? ' class="active"' : '';

  // "Find My Style" / "My Picks" nav link — personalisation entry point
  const styleLink = bodyType
    ? `<li><a href="recommendations.html" class="nav-style-link${page === 'outfits' ? ' active' : ''}"><i class="fas fa-magic"></i> My Picks</a></li>`
    : `<li><a href="body-profile.html"    class="nav-style-link${page === 'profile' ? ' active' : ''}"><i class="fas fa-magic"></i> Find My Style</a></li>`;

  const NAV_HTML = `
  <div class="announce-bar" id="announce-bar">
    <span>🔥 <strong>SS25 Drop Live</strong> — Free shipping above ₹999 &nbsp;|&nbsp; Use code <strong>ANIME10</strong> for 10% off</span>
    <button onclick="this.parentElement.style.display='none';sessionStorage.setItem('sw_announce_closed','1')" aria-label="Close">✕</button>
  </div>

  <nav class="navbar" id="navbar">
    <a href="index.html" class="nav-logo">SHONO<span>WEAR</span></a>
    <div class="nav-search-bar">
      <i class="fas fa-search"></i>
      <input type="text" id="nav-search-input" placeholder="Search styles, anime, drops…" autocomplete="off" />
      <div class="nav-search-results" id="nav-search-results"></div>
    </div>
    <ul class="nav-links">
      <li><a href="index.html"${active('home')}>Home</a></li>
      <li><a href="collection.html"${active('collection')}>Shop</a></li>
      <li><a href="new-arrivals.html"${active('new-arrivals')}>New Arrivals</a></li>
      <li><a href="recommendations.html"${active('outfits')}>Outfits</a></li>
      <li><a href="about.html"${active('about')}>About</a></li>
      <li><a href="contact.html"${active('contact')}>Contact</a></li>
      ${styleLink}
    </ul>
    <div class="nav-actions">
      <div class="cart-wrap">
        <a href="cart.html" class="nav-icon-btn" title="Cart"><i class="fas fa-shopping-bag"></i></a>
        <div class="cart-badge" style="display:none;">0</div>
      </div>
      <button class="nav-icon-btn" id="wish-toggle" title="Wishlist" onclick="openWishlist()" style="position:relative;">
        <i class="far fa-heart"></i>
        <div class="wish-badge" id="wish-badge" style="display:none;">0</div>
      </button>
      <a id="nav-login" class="nav-login-btn" href="login.html">Login</a>
      <div id="nav-user" class="nav-user" style="display:none;">
        <span class="nav-uname" id="nav-uname"></span>
        <button class="nav-logout" onclick="logout()">Logout</button>
      </div>
    </div>
    <button class="nav-toggle" id="nav-toggle"><i class="fas fa-bars"></i></button>
  </nav>
  <div class="nav-progress" id="nav-progress"></div>

  <div class="mob-overlay" id="mob-ov" onclick="closeMob()"></div>
  <div class="mob-menu" id="mob-menu">
    <div class="mob-head">
      <span class="mob-logo">SHONO<em>WEAR</em></span>
      <button class="mob-close" onclick="closeMob()"><i class="fas fa-times"></i></button>
    </div>
    <div class="mob-search">
      <input type="text" id="mob-search-input" placeholder="Search styles…" />
      <button onclick="doMobSearch()"><i class="fas fa-arrow-right"></i></button>
    </div>
    <a href="index.html"${active('home') ? ' style="color:var(--white)"' : ''}><i class="fas fa-home"></i>Home</a>
    <a href="collection.html"><i class="fas fa-th-large"></i>Collection</a>
    <a href="recommendations.html"><i class="fas fa-magic"></i>Outfits</a>
    <a href="new-arrivals.html"><i class="fas fa-star"></i>New Arrivals</a>
    <a href="about.html"><i class="fas fa-info-circle"></i>About</a>
    <a href="contact.html"><i class="fas fa-envelope"></i>Contact</a>
    <a id="mob-login" href="login.html"><i class="fas fa-user"></i>Sign In</a>
    <a id="mob-logout" style="display:none;" onclick="logout()"><i class="fas fa-sign-out-alt"></i>Logout</a>
  </div>

  <div class="wish-overlay" id="wish-overlay" onclick="closeWishlist()" style="display:none;position:fixed;inset:0;z-index:1003;"></div>
  <div class="wish-sidebar" id="wish-sidebar" style="position:fixed;top:0;right:-100%;width:360px;max-width:92vw;height:100vh;z-index:1004;overflow:hidden;">
    <div class="wish-head">
      <h3>Saved Items</h3>
      <button onclick="closeWishlist()"><i class="fas fa-times"></i></button>
    </div>
    <div class="wish-items" id="wish-items"></div>
    <div class="wish-empty" id="wish-empty">
      <i class="far fa-heart"></i>
      <p>No saved items yet.</p>
      <a href="collection.html">Browse Collection</a>
    </div>
  </div>
  `;

  // ── Inject at very top of body ─────────────────────────────────
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  // ── Restore announce bar dismiss ───────────────────────────────
  if (sessionStorage.getItem('sw_announce_closed')) {
    document.getElementById('announce-bar').style.display = 'none';
  }

  // ── Scroll: navbar shrink + progress bar ──────────────────────
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

  // ── Mobile menu toggle ────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-toggle')?.addEventListener('click', openMob);
  });

  // ── Mobile search ─────────────────────────────────────────────
  window.doMobSearch = function () {
    const q = document.getElementById('mob-search-input')?.value?.trim();
    if (q) window.location.href = 'collection.html?q=' + encodeURIComponent(q);
  };

  // ── openMob / closeMob (needed by hamburger + overlay) ────────
  window.openMob  = () => { document.getElementById('mob-ov')?.classList.add('on'); document.getElementById('mob-menu')?.classList.add('on'); };
  window.closeMob = () => { document.getElementById('mob-ov')?.classList.remove('on'); document.getElementById('mob-menu')?.classList.remove('on'); };

  // ── Keyboard: Escape closes mobile menu ───────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMob(); }
  });

})();
