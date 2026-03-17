/**
 * footer.js — Shared footer, cookie banner, WhatsApp widget, scroll-to-top
 * Include at the bottom of every page's <body>, before </body>.
 * Replace hardcoded footer + cookie + WhatsApp HTML on each page.
 *
 * Usage: <script src="footer.js"></script>
 *
 * To update the footer across all pages, edit ONLY this file.
 */
(function () {
  const FOOTER_HTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="nav-logo">SHONO<span>WEAR</span></a>
          <p>Where anime meets street fashion. Curated drops. Premium fabric. Culture first.</p>
          <div class="footer-socials">
            <a href="https://www.instagram.com/shonowear" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="contact.html" aria-label="Email"><i class="fas fa-envelope"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Discover</h5>
          <a href="collection.html">All Products</a>
          <a href="new-arrivals.html">New Arrivals</a>
          <a href="index.html#collections">Style Collections</a>
          <a href="index.html#lookbook">Lookbook</a>
          <a href="index.html#outfit-builder">Outfit Builder</a>
        </div>
        <div class="footer-col">
          <h5>Help</h5>
          <a href="contact.html">Contact Us</a>
          <a href="cart.html">Your Cart</a>
          <a href="returns.html">Returns</a>
          <a href="shipping.html">Shipping</a>
        </div>
        <div class="footer-col">
          <h5>Company</h5>
          <a href="about.html">About</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms</a>
          <a href="shipping.html">Shipping Policy</a>
        </div>
      </div>
      <div class="footer-base">
        <p>© <span id="footer-year"></span> Shonowear. All rights reserved. Built for the culture, by the culture.</p>
        <p style="margin-top:4px;font-size:11px;color:var(--muted);">Designed &amp; developed by Kavin J.S</p>
      </div>
    </div>
  </footer>

  <div id="toast" class="toast"></div>

  <button class="scroll-top" id="scroll-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Back to top">
    <i class="fas fa-chevron-up"></i>
  </button>

  <div class="cookie-banner" id="cookie-banner">
    <p>We use cookies to improve your experience. By continuing, you agree to our <a href="privacy.html">Privacy Policy</a>.</p>
    <div class="cookie-btns">
      <button onclick="acceptCookies()">Accept All</button>
      <button onclick="acceptCookies()" class="cookie-ghost">Necessary Only</button>
    </div>
  </div>

  <!-- WhatsApp: Replace YOUR_NUMBER with your real WhatsApp business number -->
  <!-- <a href="https://wa.me/91YOUR_NUMBER?text=Hi%20Shonowear!%20I%20have%20a%20question." target="_blank" rel="noopener" class="wa-float" title="Chat on WhatsApp" aria-label="WhatsApp">
    <i class="fab fa-whatsapp"></i>
  </a> -->
  `;

  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

  // Set current year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Cookie consent
  window.acceptCookies = function () {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
    localStorage.setItem('sw_cookies_accepted', '1');
  };
  if (localStorage.getItem('sw_cookies_accepted')) {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }

  // Scroll to top visibility
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }
  }, { passive: true });
})();
