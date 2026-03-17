/**
 * outfitRenderer.js — Outfit card and page rendering module
 * Shonowear platform
 *
 * Responsibilities:
 *  - Render outfit cards (grid view)
 *  - Render full outfit detail page (outfit.html)
 *  - Render outfit items (linked product cards)
 */

'use strict';

/* ── Outfit Card ─────────────────────────────────────────── */

/**
 * Render a single outfit card for grid/list display
 * @param {object} outfit - outfit data object from outfits.json
 * @param {string} [userBodyType] - optional, to show match badge
 * @returns {string} HTML string
 */
function renderOutfitCard(outfit, userBodyType) {
  const isMatch    = userBodyType && outfit.bodyTypes?.includes(userBodyType);
  const matchBadge = isMatch
    ? `<div class="oc-match-badge"><i class="fas fa-check-circle"></i> ${userBodyType} Match</div>`
    : '';

  const trendBars  = Math.round((outfit.trendScore || 5) / 2);
  const styleLabel = outfit.style || 'Streetwear';
  const itemCount  = (outfit.items || []).length;
  const price      = outfit.totalPrice ? formatPrice(outfit.totalPrice) : '';

  return `
    <div class="outfit-card fade-in-section" onclick="window.location='outfit.html?id=${outfit.id}'" role="button" tabindex="0" aria-label="View outfit: ${outfit.name}">
      <div class="oc-img-wrap">
        <div class="oc-img" style="background-image:url('${outfit.image}')"></div>
        <div class="oc-overlay"></div>
        ${matchBadge}
        <div class="oc-trend"><span>${'●'.repeat(trendBars)}${'○'.repeat(5 - trendBars)}</span></div>
      </div>
      <div class="oc-body">
        <div class="oc-meta">
          <span class="oc-style">${styleLabel}</span>
          <span class="oc-anime">${outfit.anime || ''}</span>
        </div>
        <h3 class="oc-name">${outfit.name}</h3>
        <p class="oc-desc">${(outfit.description || '').slice(0, 90)}${outfit.description?.length > 90 ? '…' : ''}</p>
        <div class="oc-footer">
          <div class="oc-info">
            <span class="oc-items"><i class="fas fa-tshirt"></i> ${itemCount} pieces</span>
            ${price ? `<span class="oc-price">${price}</span>` : ''}
          </div>
          <button class="oc-btn" onclick="event.stopPropagation();window.location='outfit.html?id=${outfit.id}'">
            View Outfit <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>`;
}

/* ── Outfit Grid ─────────────────────────────────────────── */

/**
 * Render a grid of outfit cards into a container
 * @param {Array} outfits
 * @param {HTMLElement} container
 * @param {string} [userBodyType]
 */
function renderOutfitGrid(outfits, container, userBodyType) {
  if (!container) return;

  if (!outfits || !outfits.length) {
    container.innerHTML = `
      <div class="outfit-empty">
        <i class="fas fa-box-open"></i>
        <p>No outfits found for this filter. Try a different style.</p>
        <a href="recommendations.html" class="btn-secondary">See All Recommendations</a>
      </div>`;
    return;
  }

  container.innerHTML = outfits.map(o => renderOutfitCard(o, userBodyType)).join('');
  container.className = 'outfit-grid';

  // Stagger animation
  container.querySelectorAll('.outfit-card').forEach((card, i) => {
    card.style.cssText += `;opacity:0;transform:translateY(16px);transition:opacity .4s ease ${i * 0.07}s,transform .4s ease ${i * 0.07}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }));
  });
}

/* ── Outfit Detail Page ─────────────────────────────────── */

/**
 * Render the full outfit detail view (for outfit.html)
 * @param {object} outfit - outfit data
 * @param {Array} allProducts - products array to look up items
 * @param {HTMLElement} container
 * @param {string} [userBodyType]
 */
function renderOutfitDetail(outfit, allProducts, container, userBodyType) {
  if (!outfit || !container) return;

  const items = (outfit.items || [])
    .map(id => (allProducts || []).find(p => p.id === id))
    .filter(Boolean);

  const isMatch   = userBodyType && outfit.bodyTypes?.includes(userBodyType);
  const totalCost = items.reduce((sum, p) => sum + (p.price || 0), 0);
  const meta      = userBodyType ? getBodyTypeMeta(userBodyType) : null;

  const matchBanner = isMatch
    ? `<div class="od-match-banner match"><i class="fas fa-check-circle"></i><span><strong>Great match</strong> — this outfit is curated for ${userBodyType} builds.</span></div>`
    : userBodyType
    ? `<div class="od-match-banner no-match"><i class="fas fa-info-circle"></i><span>Not optimised for your ${userBodyType} build. <a href="recommendations.html">See your matches</a>.</span></div>`
    : `<div class="od-match-banner setup"><i class="fas fa-magic"></i><span><a href="body-profile.html">Set up your profile</a> to see if this outfit suits your build.</span></div>`;

  const suitabilityPills = ['Slim','Athletic','Average','Broad'].map(bt => {
    const active = outfit.bodyTypes?.includes(bt);
    return `<span class="od-bt-pill ${active ? 'active' : 'inactive'}">${active ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'} ${bt}</span>`;
  }).join('');

  const itemsHTML = items.map(p => renderOutfitItem(p)).join('');

  container.innerHTML = `
    <div class="outfit-detail">

      <!-- Image + meta column -->
      <div class="od-visual">
        <div class="od-main-img" style="background-image:url('${outfit.image}')">
          <div class="od-img-overlay"></div>
          <div class="od-tags">
            ${(outfit.tags || []).slice(0,4).map(t => `<span class="od-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="od-score-card">
          <div class="od-score-row">
            <span class="od-score-label">Trend Score</span>
            <span class="od-score-val">${outfit.trendScore || '—'}/10</span>
          </div>
          <div class="od-score-row">
            <span class="od-score-label">Items</span>
            <span class="od-score-val">${items.length} pieces</span>
          </div>
          <div class="od-score-row">
            <span class="od-score-label">Style</span>
            <span class="od-score-val">${outfit.style}</span>
          </div>
          <div class="od-score-row">
            <span class="od-score-label">Total</span>
            <span class="od-score-val od-total-price">${formatPrice(totalCost)}</span>
          </div>
        </div>
      </div>

      <!-- Info column -->
      <div class="od-info">
        <p class="od-eyebrow"><i class="fas fa-tshirt"></i> ${outfit.style} · ${outfit.anime || 'Streetwear'}</p>
        <h1 class="od-title">${outfit.name}</h1>
        <p class="od-desc">${outfit.description || ''}</p>

        <!-- Body type suitability -->
        <div class="od-suitability">
          <div class="od-suit-label">Best suited for</div>
          <div class="od-bt-pills">${suitabilityPills}</div>
          ${matchBanner}
        </div>

        <!-- Items list -->
        <div class="od-items-section">
          <div class="od-items-head">
            <span class="od-items-label">Items in this outfit</span>
            <span class="od-items-count">${items.length} pieces · ${formatPrice(totalCost)}</span>
          </div>
          <div class="od-items-list">${itemsHTML}</div>
        </div>

        <!-- Add all CTA -->
        <div class="od-ctas">
          <button class="cta-primary" onclick="addOutfitAllToCart('${outfit.id}')">
            <i class="fas fa-shopping-bag"></i> Add All to Cart
          </button>
          <a href="recommendations.html" class="cta-ghost">More Outfits</a>
        </div>
      </div>

    </div>`;
}

/* ── Outfit Item Card ────────────────────────────────────── */

/**
 * Render a single product row inside an outfit detail page
 * @param {object} product
 * @returns {string} HTML
 */
function renderOutfitItem(product) {
  if (!product) return '';
  const img   = (typeof getProductImage === 'function') ? getProductImage(product) : (product.image || '');
  const price = formatPrice(product.price || 0);
  const orig  = formatPrice(Math.ceil((product.price || 0) * 1.18 / 100) * 100);

  return `
    <div class="od-item" onclick="window.location='product.html?id=${product.id}'">
      <div class="od-item-img" style="background-image:url('${img}')"></div>
      <div class="od-item-info">
        <div class="od-item-type">${product.category || product.type || ''}</div>
        <div class="od-item-name">${product.name}</div>
        <div class="od-item-price">${price} <span>${orig}</span></div>
      </div>
      <button class="od-item-add" onclick="event.stopPropagation();addToCart('${product.id}','${(product.name||'').replace(/'/g,"\\'")}',${product.price})" title="Add to cart">
        <i class="fas fa-plus"></i>
      </button>
    </div>`;
}

/* ── Add full outfit to cart ─────────────────────────────── */

/**
 * Add all items in an outfit to cart
 * @param {string} outfitId
 */
async function addOutfitAllToCart(outfitId) {
  let outfits = window._outfitsCache;
  if (!outfits) {
    outfits = await loadJSON('data/outfits.json');
    window._outfitsCache = outfits;
  }

  const outfit = (outfits || []).find(o => o.id === outfitId);
  if (!outfit) return;

  const allProducts = window.products || [];
  const items = (outfit.items || [])
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean);

  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  items.forEach(p => {
    const existing = cart.find(i => i.id === p.id);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  });
  localStorage.setItem('sw_cart', JSON.stringify(cart));

  if (typeof updateCartBadge === 'function') updateCartBadge();
  if (typeof showToast === 'function') showToast(`${outfit.name} — ${items.length} pieces added to cart 🔥`, 'success');
}

/* ── Global exports ─────────────────────────────────────── */
window.renderOutfitCard    = renderOutfitCard;
window.renderOutfitGrid    = renderOutfitGrid;
window.renderOutfitDetail  = renderOutfitDetail;
window.renderOutfitItem    = renderOutfitItem;
window.addOutfitAllToCart  = addOutfitAllToCart;
