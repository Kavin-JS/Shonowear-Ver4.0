// main.js — shared functions for all pages

function updateNav() {
  const user     = localStorage.getItem('sw_user');
  const username = localStorage.getItem('sw_username');
  const navLogin  = document.getElementById('nav-login');
  const navUser   = document.getElementById('nav-user');
  const navUname  = document.getElementById('nav-uname');
  const mobLogin  = document.getElementById('mob-login');
  const mobLogout = document.getElementById('mob-logout');
  if (user) {
    if (navLogin)  navLogin.style.display  = 'none';
    if (navUser)   navUser.style.display   = 'flex';
    if (navUname)  navUname.textContent    = username || 'User';
    if (mobLogin)  mobLogin.style.display  = 'none';
    if (mobLogout) mobLogout.style.display = 'flex';
  } else {
    if (navLogin)  navLogin.style.display  = 'block';
    if (navUser)   navUser.style.display   = 'none';
    if (mobLogin)  mobLogin.style.display  = 'flex';
    if (mobLogout) mobLogout.style.display = 'none';
  }
  updateCartBadge();
}

function updateCartBadge() {
  const cart  = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'flex' : 'none';
}

function logout() {
  localStorage.removeItem('sw_user');
  localStorage.removeItem('sw_username');
  updateNav();
  toast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = 'index.html', 1000);
}

function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#e8153a';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function showPop(ico, title, msg) {
  document.getElementById('pop-ico').textContent  = ico;
  document.getElementById('pop-title').textContent = title;
  document.getElementById('pop-msg').textContent   = msg;
  document.getElementById('popup').classList.add('show');
}
function closePop() { document.getElementById('popup').classList.remove('show'); }
function openMob()  { document.getElementById('mob-ov').classList.add('on'); document.getElementById('mob-menu').classList.add('on'); }
function closeMob() { document.getElementById('mob-ov').classList.remove('on'); document.getElementById('mob-menu').classList.remove('on'); }

document.getElementById('nav-toggle')?.addEventListener('click', openMob);
document.addEventListener('DOMContentLoaded', () => { updateNav(); });

/* ── Product images ─────────────────────────────────────────── */
const PRODUCT_IMAGES = {
  hoodie: [
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80',
  ],
  tee: [
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&auto=format&fit=crop&q=80',
  ],
  phone: [
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&auto=format&fit=crop&q=80',
  ],
  figurine: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=500&auto=format&fit=crop&q=80',
  ],
  jacket: [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&auto=format&fit=crop&q=80',
  ],
  oversized: [
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80',
  ],
};

function getProductImage(product) {
  const pool = PRODUCT_IMAGES[product.type] || PRODUCT_IMAGES.tee;
  const num  = parseInt((product.id || '0').replace(/\D/g, '')) || 0;
  return pool[num % pool.length];
}

// FIX: data-id on card, wishlist heart state restored on render
function renderProductCard(product) {
  const origPrice = Math.ceil(product.price * 1.18 / 100) * 100;
  const disc      = Math.round(((origPrice - product.price) / origPrice) * 100);
  const imgUrl    = getProductImage(product);
  const safeName  = (product.name || '').replace(/'/g, "\'");
  const wished    = typeof isWished === 'function' && isWished(product.id);
  const heartCls  = wished ? 'fas fa-heart' : 'far fa-heart';
  const heartColor = wished ? 'color:var(--red)' : '';
  const num     = parseInt((product.id || '0').replace(/\D/g, '')) || 1;
  const ratings = [4.7, 4.8, 4.9, 5.0, 4.6, 4.8, 4.9, 4.7];
  const rating  = ratings[num % ratings.length];
  const reviews = 12 + (num * 7 % 88);
  const stars   = Math.round(rating);
  const starStr = '\u2605'.repeat(stars) + '\u2606'.repeat(5 - stars);
  return `
    <div class="prd-card" data-id="${product.id}" data-type="${product.type||''}" data-anime="${product.anime||''}" onclick="window.location='product.html?id=${product.id}'" style="cursor:pointer;">
      <div class="prd-img">
        <div class="prd-img-inner" style="background-image:url('${imgUrl}')"></div>
        <div class="prd-badges">
          ${product.isNew ? '<span class="prd-badge prd-badge-new">NEW</span>' : ''}
          ${disc >= 10 ? `<span class="prd-badge prd-badge-sale">${disc}% OFF</span>` : ''}
        </div>
        <button class="prd-wish" data-pid="${product.id}" title="Save to wishlist" onclick="event.stopPropagation();toggleWishCard(this,'${product.id}','${safeName}',${product.price},'${product.type}')">
          <i class="${heartCls}" style="${heartColor}"></i>
        </button>
      </div>
      <div class="prd-ov">
        <button class="prd-ov-btn" onclick="event.stopPropagation();addToCart('${product.id}','${safeName}',${product.price})">
          <i class="fas fa-shopping-bag"></i> ADD TO CART
        </button>
      </div>
      <div class="prd-info">
        <div class="prd-tag-row"><span class="prd-anime">${product.anime||product.tag||''}</span></div>
        <div class="prd-name">${product.name}</div>
        <div class="prd-rating-row">
          <span class="prd-stars">${starStr}</span>
          <span class="prd-review-count">(${reviews})</span>
        </div>
        <div class="prd-price-row">
          <span class="prd-price">₹${product.price.toLocaleString()}</span>
          <span class="prd-price-orig">₹${origPrice.toLocaleString()}</span>
        </div>
      </div>

      <button class="prd-atc-mobile" onclick="event.stopPropagation();addToCart('${product.id}','${safeName}',${product.price})">
        <i class="fas fa-shopping-bag"></i> Add to Cart
      </button>
    </div>`;
}
// Wishlist toggle from card (no need for complex listener re-attaching)
function toggleWishCard(btn, id, name, price, type) {
  const wished = typeof toggleWishItem === 'function'
    ? toggleWishItem(id, name, price, type)
    : false;
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className   = wished ? 'fas fa-heart' : 'far fa-heart';
    icon.style.color = wished ? 'var(--red)' : '';
  }
  if (typeof toast === 'function') toast(wished ? 'Saved to wishlist ❤️' : 'Removed from wishlist', 'info');
}

function addToCart(id, name, price) {
  const cart     = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price, qty: 1 });
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  updateCartBadge();
  const cw = document.querySelector('.cart-wrap');
  if (cw) { cw.classList.remove('added'); void cw.offsetWidth; cw.classList.add('added'); setTimeout(() => cw.classList.remove('added'), 500); }
  toast(`${name} added to cart!`, 'success');
}
