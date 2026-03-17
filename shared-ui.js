/**
 * shared-ui.js — Reusable UI components injected on every page
 * Includes: Size Guide Modal, Sticky ATC (mobile), Pop-up utility
 * Include after style.css, before main.js
 */

/* ══════════════════════════════════════════════════════
   1. SIZE GUIDE MODAL
   ══════════════════════════════════════════════════════ */

(function injectSizeGuide() {
  const HTML = `
  <div class="sg-overlay" id="sg-overlay" onclick="closeSizeGuide(event)">
    <div class="sg-modal" onclick="event.stopPropagation()">
      <div class="sg-head">
        <h3>SIZE GUIDE</h3>
        <button onclick="closeSizeGuide()" aria-label="Close size guide">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sg-body">
        <div class="sg-tabs" id="sg-tabs">
          <button class="sg-tab active" data-cat="hoodie" onclick="switchSizeTab(this,'hoodie')">Hoodies</button>
          <button class="sg-tab" data-cat="tee" onclick="switchSizeTab(this,'tee')">Tees</button>
          <button class="sg-tab" data-cat="oversized" onclick="switchSizeTab(this,'oversized')">Oversized</button>
          <button class="sg-tab" data-cat="jacket" onclick="switchSizeTab(this,'jacket')">Jackets</button>
        </div>

        <div id="sg-hoodie">
          <table class="sg-table">
            <thead>
              <tr>
                <th>Size</th><th>Chest (cm)</th><th>Shoulder (cm)</th><th>Length (cm)</th><th>Sleeve (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>96–100</td><td>44</td><td>68</td><td>62</td></tr>
              <tr><td>S</td><td>100–104</td><td>46</td><td>70</td><td>63</td></tr>
              <tr><td>M</td><td>104–108</td><td>48</td><td>72</td><td>64</td></tr>
              <tr><td>L</td><td>108–114</td><td>50</td><td>74</td><td>65</td></tr>
              <tr><td>XL</td><td>114–120</td><td>52</td><td>76</td><td>66</td></tr>
              <tr><td>XXL</td><td>120–128</td><td>54</td><td>78</td><td>67</td></tr>
            </tbody>
          </table>
          <div class="sg-tip">
            <i class="fas fa-info-circle"></i>
            <span>Hoodies are cut in an <strong>oversized fit</strong>. If you prefer a regular fit, size down by one. All measurements are of the garment, not the body.</span>
          </div>
        </div>

        <div id="sg-tee" style="display:none">
          <table class="sg-table">
            <thead>
              <tr>
                <th>Size</th><th>Chest (cm)</th><th>Shoulder (cm)</th><th>Length (cm)</th><th>Sleeve (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>90–94</td><td>40</td><td>66</td><td>20</td></tr>
              <tr><td>S</td><td>94–98</td><td>42</td><td>68</td><td>21</td></tr>
              <tr><td>M</td><td>98–102</td><td>44</td><td>70</td><td>22</td></tr>
              <tr><td>L</td><td>102–108</td><td>46</td><td>72</td><td>23</td></tr>
              <tr><td>XL</td><td>108–114</td><td>48</td><td>74</td><td>24</td></tr>
              <tr><td>XXL</td><td>114–120</td><td>50</td><td>76</td><td>24</td></tr>
            </tbody>
          </table>
          <div class="sg-tip">
            <i class="fas fa-info-circle"></i>
            <span>Tees use a <strong>drop-shoulder silhouette</strong> — they're designed to wear a size up from your usual. They're pre-shrunk, so expect no further shrinkage.</span>
          </div>
        </div>

        <div id="sg-oversized" style="display:none">
          <table class="sg-table">
            <thead>
              <tr>
                <th>Size</th><th>Chest (cm)</th><th>Shoulder (cm)</th><th>Length (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>S</td><td>110–116</td><td>52</td><td>74</td></tr>
              <tr><td>M</td><td>116–122</td><td>54</td><td>76</td></tr>
              <tr><td>L</td><td>122–128</td><td>56</td><td>78</td></tr>
              <tr><td>XL</td><td>128–136</td><td>58</td><td>80</td></tr>
              <tr><td>XXL</td><td>136–144</td><td>60</td><td>82</td></tr>
            </tbody>
          </table>
          <div class="sg-tip">
            <i class="fas fa-info-circle"></i>
            <span>Oversized fits are intentionally <strong>boxy and long</strong>. Wear your regular size — if you want extreme drape, size up. Not available in XS.</span>
          </div>
        </div>

        <div id="sg-jacket" style="display:none">
          <table class="sg-table">
            <thead>
              <tr>
                <th>Size</th><th>Chest (cm)</th><th>Shoulder (cm)</th><th>Length (cm)</th><th>Sleeve (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>92–96</td><td>42</td><td>64</td><td>62</td></tr>
              <tr><td>S</td><td>96–100</td><td>44</td><td>66</td><td>63</td></tr>
              <tr><td>M</td><td>100–104</td><td>46</td><td>68</td><td>64</td></tr>
              <tr><td>L</td><td>104–110</td><td>48</td><td>70</td><td>65</td></tr>
              <tr><td>XL</td><td>110–116</td><td>50</td><td>72</td><td>66</td></tr>
              <tr><td>XXL</td><td>116–124</td><td>52</td><td>74</td><td>67</td></tr>
            </tbody>
          </table>
          <div class="sg-tip">
            <i class="fas fa-info-circle"></i>
            <span>Jackets are <strong>true to size</strong>. If you plan to layer a hoodie underneath, size up by one for comfort.</span>
          </div>
        </div>

      </div>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', HTML);
})();

window.openSizeGuide = function (category) {
  document.getElementById('sg-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (category) {
    const tab = document.querySelector(`.sg-tab[data-cat="${category}"]`);
    if (tab) switchSizeTab(tab, category);
  }
};

window.closeSizeGuide = function (e) {
  if (e && e.target !== document.getElementById('sg-overlay') && !e.target.closest('.sg-head button')) return;
  document.getElementById('sg-overlay').classList.remove('open');
  document.body.style.overflow = '';
};

window.switchSizeTab = function (btn, cat) {
  document.querySelectorAll('.sg-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['hoodie', 'tee', 'oversized', 'jacket'].forEach(c => {
    const el = document.getElementById('sg-' + c);
    if (el) el.style.display = c === cat ? 'block' : 'none';
  });
};

// ESC to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('sg-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }
});


/* ══════════════════════════════════════════════════════
   2. STICKY ADD-TO-CART BAR (mobile, product page only)
   ══════════════════════════════════════════════════════ */

(function injectStickyATC() {
  // Only inject on product.html
  if (!window.location.pathname.includes('product')) return;

  const bar = document.createElement('div');
  bar.className = 'sticky-atc';
  bar.id = 'sticky-atc';
  bar.innerHTML = `
    <div class="sticky-atc-name" id="satc-name">Loading…</div>
    <div class="sticky-atc-price" id="satc-price"></div>
    <button class="sticky-atc-btn" onclick="stickyAddToCart()">
      <i class="fas fa-shopping-bag"></i> Add
    </button>
  `;
  document.body.appendChild(bar);

  // Show bar when main ATC button scrolls out of view
  const observer = new IntersectionObserver(entries => {
    bar.style.display = entries[0].isIntersecting ? 'none' : 'flex';
  }, { threshold: 0 });

  // Wait for product page to render its button
  const checkInterval = setInterval(() => {
    const mainBtn = document.querySelector('.atc-btn, .product-atc, [data-atc-main]');
    if (mainBtn) { observer.observe(mainBtn); clearInterval(checkInterval); }
  }, 300);
})();

window.stickyAddToCart = function () {
  // Delegate to the product page's addToCart function
  const mainBtn = document.querySelector('.atc-btn, .product-atc, [data-atc-main]');
  if (mainBtn) mainBtn.click();
};

// Update sticky bar when product loads (called from product.js)
window.updateStickyATC = function (name, price) {
  const nameEl = document.getElementById('satc-name');
  const priceEl = document.getElementById('satc-price');
  if (nameEl) nameEl.textContent = name;
  if (priceEl) priceEl.textContent = '₹' + Number(price).toLocaleString();
};


/* ══════════════════════════════════════════════════════
   3. BACK-TO-TOP BUTTON (already in DOM via footer.js)
      but this ensures visibility toggle works everywhere
   ══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
});


/* ══════════════════════════════════════════════════════
   4. LINK LOADING INDICATOR
   Makes page transitions feel faster by showing
   a loading bar immediately on internal link click.
   ══════════════════════════════════════════════════════ */

(function initLinkLoader() {
  const bar = document.createElement('div');
  bar.id = 'link-loader';
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;width:0;z-index:99999;
    background:linear-gradient(90deg,var(--red),var(--gold));
    transition:width .3s ease,opacity .2s;
    pointer-events:none;
  `;
  document.body.appendChild(bar);

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    if (a.target === '_blank') return;
    bar.style.width = '70%';
    bar.style.opacity = '1';
    setTimeout(() => { bar.style.width = '100%'; bar.style.opacity = '0'; }, 300);
  });
})();
