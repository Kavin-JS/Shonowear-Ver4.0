
function updateBreadcrumb(p) {
  const bcName = document.getElementById('pd-bc-name');
  const bcLink = document.querySelector('#pd-breadcrumb a[href="collection.html"]');
  if (bcName) bcName.textContent = p.name;
  // Preserve collection URL context if user came from collection
  if (bcLink && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      if (ref.pathname.includes('collection')) {
        bcLink.href = ref.pathname + ref.search;
        // Show filter label if present
        const anime = ref.searchParams.get('anime');
        const type  = ref.searchParams.get('type');
        if (anime) bcLink.textContent = anime;
        else if (type) bcLink.textContent = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      }
    } catch(e) {}
  }
}

// product.js — product detail page logic

let currentProduct = null;
let selectedSize    = null;
let qty             = 1;
let currentThumb    = 0;

// Multiple images per product type for the gallery
const GALLERY_IMAGES = {
  hoodie: [
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&auto=format&fit=crop&q=85',
  ],
  tee: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=85',
  ],
  oversized: [
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=85',
  ],
  jacket: [
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=85',
  ],
  phone: [
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=85',
  ],
  figurine: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=85',
  ],
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id || typeof products === 'undefined') {
    window.location.href = 'collection.html';
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    window.location.href = 'collection.html';
    return;
  }

  currentProduct = product;
  renderProduct(product);
  renderRelated(product);
  renderReviews(product);
  checkWishState(product.id);
  updateWishBadge();
  renderCompleteTheLook(product);
  // Urgency signals — needs currentProduct set first
  if (typeof window.initUrgencySignals === 'function') window.initUrgencySignals();

  // Wire image zoom lightbox
  const galleryImgs = GALLERY_IMAGES[product.type] || GALLERY_IMAGES.tee;
  _lbImages = galleryImgs.map(u => u.replace('w=800', 'w=1200'));
  const mainImg = document.getElementById('pd-main-img');
  if (mainImg) {
    mainImg.style.cursor = 'zoom-in';
    mainImg.addEventListener('click', () => {
      const currentBg = mainImg.style.backgroundImage.replace(/url\(['""]?|['""]?\)/g, '');
      const hi = currentBg.replace('w=800', 'w=1200');
      openLightbox(Math.max(0, _lbImages.indexOf(hi)));
    });
  }

  // Navbar scroll
  const nb = document.getElementById('navbar');
  const pr = document.getElementById('nav-progress');
  window.addEventListener('scroll', () => {
    nb?.classList.toggle('scrolled', window.scrollY > 60);
    if (pr) pr.style.width = Math.min((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100) + '%';
    document.getElementById('scroll-top')?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
});

function renderProduct(p) {
  // Page title + meta
  document.title = `${p.name} — Shonowear`;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${p.name} — Shonowear`;

  const desc = p.desc || 'Premium quality anime-inspired streetwear. Built for culture, designed for comfort.';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = desc;
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = desc;

  // Breadcrumb
  const bcName = document.getElementById('pd-bc-name');
  if (bcName) bcName.textContent = p.name;

  // ── JSON-LD Product structured data ──────────────────────────
  const numId   = parseInt(p.id.replace(/\D/g, '')) || 1;
  const ratings = [4.7, 4.8, 4.9, 5.0, 4.6, 4.8, 4.9, 5.0];
  const rating  = ratings[numId % ratings.length];
  const reviews = 12 + (numId * 7 % 88);
  const imgUrls = (GALLERY_IMAGES[p.type] || GALLERY_IMAGES.tee).slice(0, 3);
  const jsonld  = document.getElementById('product-jsonld');
  if (jsonld) {
    jsonld.textContent = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': p.name,
      'description': desc,
      'image': imgUrls,
      'brand': { '@type': 'Brand', 'name': 'Shonowear' },
      'sku': p.id,
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': rating,
        'reviewCount': reviews,
        'bestRating': 5,
        'worstRating': 1
      },
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'INR',
        'price': p.price,
        'availability': 'https://schema.org/InStock',
        'url': `https://kavin-js.github.io/Shonowear/product.html?id=${p.id}`,
        'seller': { '@type': 'Organization', 'name': 'Shonowear' }
      }
    });
  }

  // ── Breadcrumb JSON-LD ──────────────────────────────────────
  const bcScript = document.getElementById('breadcrumb-jsonld') || document.createElement('script');
  bcScript.id   = 'breadcrumb-jsonld';
  bcScript.type = 'application/ld+json';
  bcScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home',       'item': 'https://kavin-js.github.io/Shonowear/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Collection', 'item': 'https://kavin-js.github.io/Shonowear/collection.html' },
      { '@type': 'ListItem', 'position': 3, 'name': p.name }
    ]
  });
  if (!bcScript.parentElement) document.head.appendChild(bcScript);

  // Gallery
  const images = GALLERY_IMAGES[p.type] || GALLERY_IMAGES.tee;
  const mainImg = document.getElementById('pd-main-img');

  // Set main image as real <img> for proper lazy loading + alt text
  mainImg.innerHTML = `
    <img src="${images[0]}" alt="${p.name} — front view"
         loading="eager" fetchpriority="high"
         width="600" height="800"
         style="width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in;"
         onclick="(function(){const bg='${images[0].replace('w=800','w=1200')}';openLightbox(0);})()">
  `;

  // Thumbnails — lazy-loaded real <img> elements
  const thumbs = document.getElementById('pd-thumbs');
  thumbs.innerHTML = images.map((src, i) => `
    <div class="pd-thumb ${i === 0 ? 'active' : ''}" onclick="switchThumb(${i}, '${src}', '${p.name}')">
      <img src="${src}" alt="${p.name} — view ${i + 1}"
           loading="lazy" width="80" height="107"
           style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>
  `).join('');

  // New badge
  if (p.isNew) document.getElementById('pd-new-badge').style.display = 'block';

  // Info
  document.getElementById('pd-universe').textContent   = p.anime || p.tag || '';
  document.getElementById('pd-name').textContent       = p.name;

  // Rating — deterministic from product id
  const numId   = parseInt(p.id.replace(/\D/g, '')) || 1;
  const ratings = [4.7, 4.8, 4.9, 5.0, 4.6, 4.8, 4.9, 5.0];
  const rating  = ratings[numId % ratings.length];
  const reviews = 12 + (numId * 7 % 88);
  document.getElementById('pd-rating-count').textContent = `${rating} (${reviews} reviews)`;

  // Price
  const orig = Math.ceil(p.price * 1.18 / 100) * 100;
  const disc = Math.round(((orig - p.price) / orig) * 100);
  document.getElementById('pd-price').textContent      = `₹${p.price.toLocaleString()}`;
  document.getElementById('pd-price-orig').textContent = `₹${orig.toLocaleString()}`;
  document.getElementById('pd-discount').textContent   = `${disc}% OFF`;

  // Sizes
  renderSizes(p);

  // Description
  // Identity context line — one sharp line per type, shown before description
  const IDENTITY = {
    hoodie:    'For late nights, loud music, and knowing exactly who you are.',
    tee:       'Because some things are better shown than explained.',
    oversized: 'Sized for comfort. Worn as a statement.',
    jacket:    'The piece that changes the whole outfit. And the whole mood.',
    phone:     'Your most-seen accessory. Make it mean something.',
    figurine:  'For the shelf, the desk, the part of the room that's entirely yours.',
  };
  const identityLine = IDENTITY[p.type] || '';
  const descEl = document.getElementById('pd-desc');
  if (descEl) {
    const fullDesc = p.desc || 'Premium quality anime-inspired streetwear. Built for culture, designed for comfort.';
    descEl.innerHTML = identityLine
      ? `<span class="pd-identity-line">${identityLine}</span>${fullDesc}`
      : fullDesc;
  }

  // Body type suitability
  renderBodyTypeSuitability(p);
}

function renderBodyTypeSuitability(p) {
  // Find or create the suitability container
  let el = document.getElementById('pd-body-suitability');
  if (!el) {
    // Insert after the description paragraph
    const descEl = document.getElementById('pd-desc');
    if (!descEl) return;
    el = document.createElement('div');
    el.id = 'pd-body-suitability';
    descEl.parentNode.insertBefore(el, descEl.nextSibling);
  }

  const bodyTypes  = p.bodyTypes  || [];
  const style      = p.style      || '';
  const userType   = localStorage.getItem('bodyType') || localStorage.getItem('sw_bodyType');
  const isMatch    = userType && bodyTypes.includes(userType);

  const ALL_TYPES  = ['Slim', 'Athletic', 'Average', 'Broad'];
  const pillsHTML  = ALL_TYPES.map(bt => {
    const active = bodyTypes.includes(bt);
    const isUser = bt === userType;
    return `<span class="pd-bt-pill ${active ? 'active' : 'inactive'} ${isUser ? 'user-match' : ''}">${active ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'} ${bt}</span>`;
  }).join('');

  const matchBanner = userType
    ? `<div class="pd-match-banner ${isMatch ? 'match' : 'no-match'}">
        <i class="fas ${isMatch ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${isMatch
          ? `<strong>Great match</strong> for your ${userType} build.`
          : `<strong>Not optimised</strong> for your ${userType} build — <a href="recommendations.html">see better fits</a>.`
        }</span>
       </div>`
    : `<div class="pd-match-banner setup">
        <i class="fas fa-magic"></i>
        <span><a href="body-profile.html">Set up your style profile</a> to see if this fits your build.</span>
       </div>`;

  el.innerHTML = `
    <div class="pd-suitability">
      <div class="pd-suit-head">
        <span class="pd-suit-label">Body Type Fit</span>
        ${style ? `<span class="pd-style-chip">${style}</span>` : ''}
      </div>
      <div class="pd-best-suited">Best suited for: <strong>${bodyTypes.join(' / ')}</strong></div>
      <div class="pd-bt-pills">${pillsHTML}</div>
      ${matchBanner}
    </div>`;

  // Also populate the dedicated tab panel
  const tabPanel = document.getElementById('pd-bodytypes-panel');
  if (tabPanel) {
    const ALL_BODY_META = {
      Slim:     { icon: 'fas fa-feather-alt', tip: 'Structured and fitted cuts look sharp. Drop-shoulder tees and slim hoodies are ideal.' },
      Average:  { icon: 'fas fa-user',         tip: 'Wide range of cuts work. Most hoodies, oversized tees, and layered fits suit you.' },
      Athletic: { icon: 'fas fa-dumbbell',     tip: 'Boxy and structured silhouettes complement your build. Oversized hoodies are your zone.' },
      Broad:    { icon: 'fas fa-expand-arrows-alt', tip: 'Relaxed oversized silhouettes create clean lines. Avoid very slim cuts.' },
    };

    tabPanel.innerHTML = `
      <div style="margin-bottom:16px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;">This item works best for</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${bodyTypes.map(bt => {
            const m = ALL_BODY_META[bt] || {};
            return `<div style="display:flex;gap:12px;padding:14px;background:var(--ink3);border:1px solid var(--border);">
              <i class="${m.icon || 'fas fa-user'}" style="color:var(--gold);font-size:16px;flex-shrink:0;margin-top:2px;"></i>
              <div>
                <div style="font-family:var(--font-d);font-size:1rem;letter-spacing:1.5px;color:var(--white);margin-bottom:4px;">${bt}</div>
                <div style="font-size:12px;color:var(--muted);font-weight:300;line-height:1.6;">${m.tip || ''}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      ${matchBanner}
      <div style="margin-top:14px;">
        <a href="recommendations.html" style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--red);display:flex;align-items:center;gap:6px;transition:gap .2s;" onmouseover="this.style.gap='10px'" onmouseout="this.style.gap='6px'">
          <i class="fas fa-magic"></i> See all picks for your body type
        </a>
      </div>`;
  }
}

function renderSizes(p) {
  const sizes     = p.sizes || ['XS','S','M','L','XL','XXL'];
  const container = document.getElementById('pd-sizes');
  const section   = document.getElementById('pd-size-section');

  // Hide size section for accessories / figurines
  if (p.type === 'phone' || p.type === 'figurine') {
    section.style.display = 'none';
    selectedSize = 'Standard';
    return;
  }

  // Simulate stock — some sizes sold out based on product id
  const numId  = parseInt(p.id.replace(/\D/g, '')) || 0;
  const oosIdx = numId % sizes.length; // one size per product appears sold out

  container.innerHTML = sizes.map((sz, i) => `
    <button class="pd-size ${i === oosIdx ? 'unavailable' : ''}"
            data-size="${sz}"
            ${i === oosIdx ? `onclick="notifyRestock('${p.id}','${sz}')"` : `onclick="selectSize('${sz}', this)"`}>
      ${sz}${i === oosIdx ? ' <span style="font-size:8px;opacity:.6">· NOTIFY</span>' : ''}
    </button>
  `).join('');
}

function notifyRestock(productId, size) {
  const email = prompt('🔔 Get notified when this size is back!\\nEnter your email:');
  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) {
    if (email !== null && typeof toast === 'function') toast('Please enter a valid email.', 'error');
    return;
  }
  const notifs = JSON.parse(localStorage.getItem('sw_restock_notifs') || '[]');
  notifs.push({ productId, size, email: email.trim().toLowerCase(), ts: Date.now() });
  localStorage.setItem('sw_restock_notifs', JSON.stringify(notifs));
  if (typeof toast === 'function') toast(`We'll notify you when size ${size} is back! 📬`, 'success');
}

function selectSize(size, el) {
  document.querySelectorAll('.pd-size').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedSize = size;
}

function switchThumb(idx, src, altText) {
  const images = GALLERY_IMAGES[currentProduct.type] || GALLERY_IMAGES.tee;
  const imgSrc = src || images[idx];
  const mainImg = document.getElementById('pd-main-img');
  document.querySelectorAll('.pd-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  currentThumb = idx;

  // Crossfade swap
  if (mainImg) {
    mainImg.style.opacity = '0.5';
    mainImg.style.transition = 'opacity .18s ease';
    const newImg = new Image();
    newImg.onload = () => {
      mainImg.innerHTML = `
        <img src="${imgSrc}" alt="${altText || currentProduct?.name || ''} — view ${idx + 1}"
             loading="lazy" width="600" height="800"
             style="width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in;"
             onclick="openLightbox(${idx})">
      `;
      mainImg.style.opacity = '1';
    };
    newImg.onerror = () => { mainImg.style.opacity = '1'; };
    newImg.src = imgSrc;
  }
}

function changeQty(delta) {
  qty = Math.max(1, Math.min(10, qty + delta));
  document.getElementById('pd-qty').textContent = qty;
}

function pdAddToCart() {
  if (!currentProduct) return;

  // Check size selected (skip for phone/figurine)
  const needsSize = currentProduct.type !== 'phone' && currentProduct.type !== 'figurine';
  if (needsSize && !selectedSize) {
    document.getElementById('pd-sizes').style.animation = 'none';
    document.getElementById('pd-sizes').offsetHeight;
    document.getElementById('pd-sizes').style.animation = 'shakeSizes .4s ease';
    if (typeof toast === 'function') toast('Please select a size first.', 'error');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const key  = `${currentProduct.id}-${selectedSize || 'OS'}`;
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      id:    currentProduct.id,
      name:  currentProduct.name,
      price: currentProduct.price,
      size:  selectedSize || 'One Size',
      qty,
    });
  }

  localStorage.setItem('sw_cart', JSON.stringify(cart));
  updateCartBadge();

  // ── Add to Cart: bag bounce + badge pulse animation ──
  const addBtn = document.getElementById('pd-add-btn');
  if (addBtn) {
    const icon = addBtn.querySelector('i');
    addBtn.style.transform = 'scale(0.94)';
    addBtn.style.transition = 'transform .15s ease';
    setTimeout(() => { addBtn.style.transform = 'scale(1)'; }, 150);
    if (icon) {
      icon.style.animation = 'none';
      icon.offsetHeight;
      icon.style.animation = 'bagBounce .5s ease';
    }
  }
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.style.animation = 'none';
    badge.offsetHeight;
    badge.style.animation = 'badgePulse .4s ease';
  }
  // Inject keyframes if needed
  if (!document.getElementById('pd-anim-kf')) {
    const s = document.createElement('style');
    s.id = 'pd-anim-kf';
    s.textContent = `
      @keyframes bagBounce {
        0%,100% { transform:translateY(0) scale(1); }
        40%      { transform:translateY(-6px) scale(1.2); }
        70%      { transform:translateY(2px) scale(.9); }
      }
      @keyframes badgePulse {
        0%,100% { transform:scale(1); }
        50%      { transform:scale(1.5); }
      }
    `;
    document.head.appendChild(s);
  }

  if (typeof toast === 'function') {
    toast({
      message: `${currentProduct.name} (${selectedSize || 'One Size'}) × ${qty} added!`,
      type: 'success',
      action: 'View Cart',
      onAction: function() { window.location.href = 'cart.html'; }
    });
  }
}

function pdBuyNow() {
  if (!currentProduct) return;

  const needsSize = currentProduct.type !== 'phone' && currentProduct.type !== 'figurine';
  if (needsSize && !selectedSize) {
    document.getElementById('pd-sizes').style.animation = 'none';
    document.getElementById('pd-sizes').offsetHeight;
    document.getElementById('pd-sizes').style.animation = 'shakeSizes .4s ease';
    if (typeof toast === 'function') toast('Please select a size first.', 'error');
    return;
  }

  // Add to cart then redirect
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const key  = `${currentProduct.id}-${selectedSize || 'OS'}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      id:    currentProduct.id,
      name:  currentProduct.name,
      price: currentProduct.price,
      size:  selectedSize || 'One Size',
      qty,
    });
  }
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  updateCartBadge();
  window.location.href = 'checkout.html';
}

// Tab switching
function switchTab(id, btn) {
  document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pd-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id)?.classList.add('active');
}

// Wishlist
function pdToggleWish() {
  if (!currentProduct) return;
  const wished = toggleWishItem(currentProduct.id, currentProduct.name, currentProduct.price, currentProduct.type);
  const icon   = document.getElementById('pd-wish-icon');
  const txt    = document.getElementById('pd-wish-txt');
  const btn    = document.getElementById('pd-wish-btn');
  icon.className = wished ? 'fas fa-heart' : 'far fa-heart';
  txt.textContent = wished ? 'Saved to Wishlist' : 'Save to Wishlist';
  btn.classList.toggle('wished', wished);
  if (typeof toast === 'function') toast(wished ? 'Saved to wishlist ❤️' : 'Removed from wishlist', 'info');
}

function checkWishState(id) {
  const list = JSON.parse(localStorage.getItem('sw_wishlist') || '[]');
  const wished = list.some(i => i.id === id);
  const icon   = document.getElementById('pd-wish-icon');
  const txt    = document.getElementById('pd-wish-txt');
  const btn    = document.getElementById('pd-wish-btn');
  if (!icon) return;
  icon.className = wished ? 'fas fa-heart' : 'far fa-heart';
  txt.textContent = wished ? 'Saved to Wishlist' : 'Save to Wishlist';
  btn.classList.toggle('wished', wished);
}

// Related products
function renderRelated(p) {
  const grid = document.getElementById('pd-related');
  if (!grid || typeof products === 'undefined') return;

  // Same anime, different product; fallback to same type
  let related = products.filter(r => r.id !== p.id && r.anime === p.anime).slice(0, 4);
  if (related.length < 4) {
    const more = products.filter(r => r.id !== p.id && r.type === p.type && !related.find(x => x.id === r.id));
    related = [...related, ...more].slice(0, 4);
  }

  grid.innerHTML = related.map(r => renderProductCard(r)).join('');

  // Wishlist hearts on related
  grid.querySelectorAll('.prd-wish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.closest('.prd-card')?.dataset.anime;
      const icon = btn.querySelector('i');
      const on = icon.classList.contains('fas');
      icon.className  = on ? 'far fa-heart' : 'fas fa-heart';
      icon.style.color = on ? '' : 'var(--red)';
    });
  });
}

// Share
function pdShare(platform) {
  const url   = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(currentProduct?.name || 'Check this out on Shonowear');
  if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
  } else if (platform === 'instagram') {
    window.open('https://www.instagram.com/kavin.j.s', '_blank');
  } else {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => { if (typeof toast === 'function') toast('Link copied!', 'success'); });
  }
}

// Size guide modal
function openSizeGuide()  { document.getElementById('size-modal').classList.add('open'); }
function closeSizeGuide() { document.getElementById('size-modal').classList.remove('open'); }

/* ── Image zoom lightbox ─────────────────────────────── */
let _lbImages = [];
let _lbIdx    = 0;

function openLightbox(idx) {
  _lbIdx = idx;
  const lb = document.getElementById('img-lightbox');
  const el = document.getElementById('lb-img');
  if (!lb || !el || !_lbImages.length) return;
  el.style.backgroundImage = `url('${_lbImages[_lbIdx]}')`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('img-lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}
function lbNav(dir) {
  _lbIdx = (_lbIdx + dir + _lbImages.length) % _lbImages.length;
  document.getElementById('lb-img').style.backgroundImage = `url('${_lbImages[_lbIdx]}')`;
}
document.addEventListener('keydown', e => {
  if (document.getElementById('img-lightbox')?.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  lbNav(-1);
    if (e.key === 'ArrowRight') lbNav(1);
  }
});


/* ── Complete the Look ─────────────────────────────────── */
function renderCompleteTheLook(p) {
  const grid = document.getElementById('ctl-grid');
  if (!grid || typeof products === 'undefined') return;

  // Same anime, different type; fill with same type if needed
  let pool = products.filter(r =>
    r.id !== p.id && r.anime === p.anime && r.type !== p.type
  ).slice(0, 4);
  if (pool.length < 4) {
    const extra = products.filter(r =>
      r.id !== p.id && r.type === p.type && !pool.find(x => x.id === r.id)
    );
    pool = [...pool, ...extra].slice(0, 4);
  }

  grid.innerHTML = pool.map(item => {
    const img = getProductImage(item);
    const safe = (item.name||'').replace(/'/g,"\\'");
    return `
      <div class="ctl-item" onclick="window.location='product.html?id=${item.id}'">
        <div class="ctl-item-img" style="background-image:url('${img}')"></div>
        <p class="ctl-item-name">${item.name}</p>
        <p class="ctl-item-price">₹${item.price.toLocaleString()}</p>
        <button class="ctl-add" onclick="event.stopPropagation();addToCart('${item.id}','${safe}',${item.price})">
          <i class="fas fa-shopping-bag"></i> Quick Add
        </button>
      </div>`;
  }).join('');
}

/* ── Customer Reviews ─────────────────────────────────── */
function renderReviews(p) {
  const list = document.getElementById('pd-reviews-list');
  if (!list) return;

  const numId = parseInt(p.id.replace(/\D/g, '')) || 1;
  const ratings = [4.7, 4.8, 4.9, 5.0, 4.6, 4.8, 4.9, 5.0];
  const avgRating = ratings[numId % ratings.length];
  const totalReviews = 12 + (numId * 7 % 88);

  // Update summary
  const avgEl = document.getElementById('pd-review-avg');
  const totalEl = document.getElementById('pd-review-total');
  if (avgEl) avgEl.textContent = avgRating.toFixed(1);
  if (totalEl) totalEl.textContent = `Based on ${totalReviews} reviews`;

  const NAMES = ['Arjun K.', 'Priya M.', 'Rahul S.', 'Ananya D.', 'Vikram T.', 'Sneha R.', 'Karthik N.', 'Meera J.'];
  const REVIEWS = [
    { text: 'Absolutely love the fabric quality! The 350 GSM feels premium and the print hasn\'t faded after multiple washes. Worth every rupee.', stars: 5, days: 3 },
    { text: 'Perfect fit for my build. The oversized cut is just right — not too baggy, not too tight. Got compliments the first day I wore it.', stars: 5, days: 7 },
    { text: 'Great design but I wish there were more color options. The current one is fire though. Shipping was quick too.', stars: 4, days: 12 },
    { text: 'This is my third purchase from Shonowear and they never disappoint. The attention to detail is impressive for the price point.', stars: 5, days: 18 },
    { text: 'Comfortable and stylish. I sized up as recommended and it fits perfectly. The stitching quality is top-notch.', stars: 5, days: 24 },
  ];

  const reviewsHTML = REVIEWS.map((r, i) => {
    const name = NAMES[(numId + i) % NAMES.length];
    const initials = name.split(' ').map(n => n[0]).join('');
    const starStr = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
    return `
      <div style="padding:20px;background:var(--ink2);border:1px solid var(--border);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:38px;height:38px;background:var(--red-lo);border:1px solid var(--border-r);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--red);letter-spacing:1px;">${initials}</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--white);">${name}</div>
            <div style="font-size:11px;color:var(--muted);">${r.days} days ago · Verified Purchase</div>
          </div>
          <div style="margin-left:auto;color:var(--gold);font-size:12px;letter-spacing:2px;">${starStr}</div>
        </div>
        <p style="font-size:13px;color:var(--muted);line-height:1.7;font-weight:300;">${r.text}</p>
      </div>`;
  }).join('');

  list.innerHTML = reviewsHTML;
}
