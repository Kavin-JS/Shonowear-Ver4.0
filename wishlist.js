// wishlist.js — slide-in sidebar, localStorage persistence

/* ── Core wishlist data ── */
function getWishlist() {
  return JSON.parse(localStorage.getItem('sw_wishlist') || '[]');
}

function saveWishlist(list) {
  localStorage.setItem('sw_wishlist', JSON.stringify(list));
  updateWishBadge();
}

function toggleWishItem(id, name, price, type) {
  const list = getWishlist();
  const idx  = list.findIndex(i => i.id === id);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveWishlist(list);
    return false; // removed
  } else {
    list.push({ id, name, price, type });
    saveWishlist(list);
    return true; // added
  }
}

function isWished(id) {
  return getWishlist().some(i => i.id === id);
}

/* ── Badge ── */
function updateWishBadge() {
  const badge = document.getElementById('wish-badge');
  if (!badge) return;
  const count = getWishlist().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ── Sidebar open / close ── */
function openWishlist() {
  document.getElementById('wish-sidebar')?.classList.add('open');
  document.getElementById('wish-overlay')?.classList.add('open');
  renderWishSidebar();
}

function closeWishlist() {
  document.getElementById('wish-sidebar')?.classList.remove('open');
  document.getElementById('wish-overlay')?.classList.remove('open');
}

/* ── Render sidebar content ── */
function renderWishSidebar() {
  const list    = getWishlist();
  const items   = document.getElementById('wish-items');
  const empty   = document.getElementById('wish-empty');
  if (!items || !empty) return;

  if (list.length === 0) {
    items.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  items.style.display = 'block';

  items.innerHTML = list.map(item => {
    const imgUrl = getWishImage(item.type);
    const orig   = Math.ceil(item.price * 1.18 / 100) * 100;
    return `
      <div class="wish-item" id="wi-${item.id}">
        <div class="wi-img" style="background-image:url('${imgUrl}')"></div>
        <div class="wi-info">
          <p class="wi-name">${item.name}</p>
          <p class="wi-price">₹${item.price.toLocaleString()} <span>₹${orig.toLocaleString()}</span></p>
          <div class="wi-actions">
            <button onclick="wishToCart('${item.id}','${item.name.replace(/'/g,"\\'")}',${item.price})">
              <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
            <button onclick="removeFromWish('${item.id}')" class="wi-remove">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getWishImage(type) {
  const map = {
    hoodie:    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200&auto=format&fit=crop&q=80',
    tee:       'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&auto=format&fit=crop&q=80',
    oversized: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&auto=format&fit=crop&q=80',
    jacket:    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80',
    phone:     'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&auto=format&fit=crop&q=80',
    figurine:  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80',
  };
  return map[type] || map.tee;
}

function removeFromWish(id) {
  const list = getWishlist().filter(i => i.id !== id);
  saveWishlist(list);
  renderWishSidebar();
  // Update heart on any visible card
  const cards = document.querySelectorAll(`.prd-card[data-anime]`);
  // Best effort — update product page if we're on it
  if (typeof checkWishState === 'function' && typeof currentProduct !== 'undefined' && currentProduct?.id === id) {
    checkWishState(id);
  }
}

function wishToCart(id, name, price) {
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const key  = `${id}-One Size`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, id, name, price, size: 'One Size', qty: 1 });
  }
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') updateCartBadge();
  if (typeof toast === 'function') toast(`${name} added to cart!`, 'success');
}

/* ── Init on every page ── */
document.addEventListener('DOMContentLoaded', () => {
  updateWishBadge();

  // Wire wishlist toggle button if present
  const toggle = document.getElementById('wish-toggle');
  if (toggle && !toggle.dataset.wired) {
    toggle.dataset.wired = '1';
    toggle.addEventListener('click', openWishlist);
  }

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeWishlist();
  });
});
