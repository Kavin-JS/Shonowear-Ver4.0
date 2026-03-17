// cart.js — V5.0: animated remove, save-for-later, sticky summary, toast with undo

function getProductImg(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('hoodie'))                        return 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200&auto=format&fit=crop&q=80';
  if (n.includes('tee') || n.includes('shirt'))    return 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&auto=format&fit=crop&q=80';
  if (n.includes('jacket'))                        return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80';
  if (n.includes('figurine'))                      return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80';
  if (n.includes('phone') || n.includes('cover'))  return 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80';
}

// Saved-for-later helpers
function getSaved() { return JSON.parse(localStorage.getItem('sw_saved') || '[]'); }
function setSaved(arr) { localStorage.setItem('sw_saved', JSON.stringify(arr)); }

function loadCart() {
  const cart        = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const cartItems   = document.getElementById('cart-items');
  const emptyCart   = document.getElementById('empty-cart');
  const cartSummary = document.getElementById('cart-summary');
  const savedSection = document.getElementById('saved-section');
  if (!cartItems) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    emptyCart.style.display   = 'block';
    cartSummary.style.display = 'none';
  } else {
    emptyCart.style.display   = 'none';
    cartSummary.style.display = 'block';
    renderCartItems(cart, cartItems);
    updateSummary(cart);
  }

  // Render saved-for-later
  renderSaved();
}

function renderCartItems(cart, cartItems) {
  let html = '';
  cart.forEach((item, idx) => {
    const qty       = item.qty || 1;
    const itemTotal = item.price * qty;
    const imgUrl    = item.img || getProductImg(item.name);
    const sizeTag   = item.size ? `<span class="ci-size">${item.size}</span>` : '';
    const productId = item.id || '';

    html += `
      <div class="ci" id="ci-${idx}">
        <a href="${productId ? 'product.html?id=' + productId : '#'}" class="ci-thumb"
           style="background-image:url('${imgUrl}');display:block;" aria-label="${item.name}"></a>
        <div class="ci-info">
          <div class="ci-name">${productId
            ? `<a href="product.html?id=${productId}" style="color:inherit;">${item.name}</a>`
            : item.name}</div>
          ${sizeTag}
          <div class="ci-price">₹${item.price.toLocaleString()}</div>
          <div class="qty-row">
            <button class="qb" onclick="changeQty(${idx}, -1)" aria-label="Decrease quantity">−</button>
            <span class="qn" id="qn-${idx}">${qty}</span>
            <button class="qb" onclick="changeQty(${idx}, 1)" aria-label="Increase quantity">+</button>
            <button class="rm-btn" onclick="removeItem(${idx})" aria-label="Remove item">Remove</button>
            <button class="save-btn" onclick="saveForLater(${idx})" aria-label="Save for later"
              style="margin-left:4px;padding:5px 12px;background:transparent;border:1px solid var(--border);
              color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
              transition:all .2s;cursor:pointer;">
              Save for Later
            </button>
          </div>
        </div>
        <div class="ci-total" id="ct-${idx}">₹${itemTotal.toLocaleString()}</div>
      </div>`;
  });
  cartItems.innerHTML = html;
}

function updateSummary(cart) {
  const subtotal       = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const shipping       = subtotal >= 999 ? 0 : 99;
  const discountPct    = window._appliedDiscount || 0;
  const discountAmt    = Math.round(subtotal * discountPct / 100);
  const total          = subtotal - discountAmt + shipping;

  const el = (id) => document.getElementById(id);
  if (el('subtotal'))   el('subtotal').textContent   = '₹' + subtotal.toLocaleString();
  if (el('shipping-row')) {
    el('shipping-row').innerHTML =
      `<span>Shipping</span><span style="color:${shipping === 0 ? 'var(--gold)' : 'var(--white)'}">
        ${shipping === 0 ? 'FREE' : '₹' + shipping}
      </span>`;
  }
  if (el('discount-row')) {
    el('discount-row').style.display = discountAmt > 0 ? 'flex' : 'none';
    if (discountAmt > 0)
      el('discount-row').innerHTML = `<span>Discount (${discountPct}%)</span><span style="color:#10b981;">−₹${discountAmt.toLocaleString()}</span>`;
  }
  if (el('total')) el('total').textContent = '₹' + total.toLocaleString();

  // Delivery estimate
  if (el('delivery-est') && typeof estimateDelivery === 'function')
    el('delivery-est').textContent = 'Est. delivery: ' + estimateDelivery(3, 7);
}

function changeQty(idx, delta) {
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  if (!cart[idx]) return;
  cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  // Update in-place (no full reload flicker)
  const qty = cart[idx].qty;
  const qnEl = document.getElementById('qn-' + idx);
  const ctEl = document.getElementById('ct-' + idx);
  if (qnEl) qnEl.textContent = qty;
  if (ctEl) ctEl.textContent = '₹' + (cart[idx].price * qty).toLocaleString();
  updateSummary(cart);
  updateCartBadge();
}

function removeItem(idx) {
  const cart  = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const saved = [...cart]; // snapshot for undo
  const item  = cart[idx];
  if (!item) return;

  // Animate out
  const row = document.getElementById('ci-' + idx);
  if (row) {
    row.classList.add('removing');
    row.style.transition = 'opacity .3s ease, transform .3s ease, max-height .35s ease, margin .35s ease, padding .35s ease';
    row.style.overflow   = 'hidden';
    setTimeout(() => {
      cart.splice(idx, 1);
      localStorage.setItem('sw_cart', JSON.stringify(cart));
      updateCartBadge();
      loadCart();
    }, 340);
  } else {
    cart.splice(idx, 1);
    localStorage.setItem('sw_cart', JSON.stringify(cart));
    updateCartBadge();
    loadCart();
  }

  // Toast with undo
  if (typeof showToast === 'function') {
    showToast({
      message: `"${item.name}" removed`,
      type: 'info',
      action: 'Undo',
      duration: 4000,
      onAction: function() {
        localStorage.setItem('sw_cart', JSON.stringify(saved));
        updateCartBadge();
        loadCart();
      }
    });
  }
}

function saveForLater(idx) {
  const cart  = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const item  = cart[idx];
  if (!item) return;
  const sv = getSaved();
  sv.push(item);
  setSaved(sv);
  cart.splice(idx, 1);
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
  if (typeof toast === 'function') toast('Saved for later', 'success');
}

function moveToCart(svIdx) {
  const sv   = getSaved();
  const item = sv[svIdx];
  if (!item) return;
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const existing = cart.findIndex(c => c.id === item.id && c.size === item.size);
  if (existing >= 0) {
    cart[existing].qty = (cart[existing].qty || 1) + (item.qty || 1);
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  sv.splice(svIdx, 1);
  setSaved(sv);
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
  if (typeof toast === 'function') toast('Moved to cart!', 'success');
}

function removeSaved(svIdx) {
  const sv = getSaved();
  sv.splice(svIdx, 1);
  setSaved(sv);
  renderSaved();
}

function renderSaved() {
  const section = document.getElementById('saved-section');
  const list    = document.getElementById('saved-items');
  if (!section || !list) return;
  const sv = getSaved();
  if (!sv.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = sv.map((item, i) => {
    const imgUrl = item.img || getProductImg(item.name);
    return `
      <div class="ci">
        <div class="ci-thumb" style="background-image:url('${imgUrl}');"></div>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          ${item.size ? `<span class="ci-size">${item.size}</span>` : ''}
          <div class="ci-price">₹${item.price.toLocaleString()}</div>
          <div class="qty-row" style="margin-top:8px;">
            <button class="checkout-btn" onclick="moveToCart(${i})"
              style="width:auto;padding:7px 16px;font-size:10px;margin:0;">
              Move to Cart
            </button>
            <button class="rm-btn" onclick="removeSaved(${i})" style="margin-left:8px;">Remove</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function checkout() {
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  if (!cart.length) {
    if (typeof toast === 'function') toast('Your cart is empty!', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', loadCart);
