// cart.js — handles both key-based (from product.html) and id-based (from cards) items

function getProductImg(name) {
  const n = name.toLowerCase();
  if (n.includes('hoodie'))                       return 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200&auto=format&fit=crop&q=80';
  if (n.includes('tee') || n.includes('shirt'))   return 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&auto=format&fit=crop&q=80';
  if (n.includes('jacket'))                       return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80';
  if (n.includes('figurine'))                     return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80';
  if (n.includes('phone') || n.includes('cover')) return 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80';
}

function loadCart() {
  const cart        = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  const cartItems   = document.getElementById('cart-items');
  const emptyCart   = document.getElementById('empty-cart');
  const cartSummary = document.getElementById('cart-summary');
  if (!cartItems) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    emptyCart.style.display   = 'block';
    cartSummary.style.display = 'none';
    return;
  }

  emptyCart.style.display   = 'none';
  cartSummary.style.display = 'block';

  let subtotal = 0;

  cart.forEach((item, idx) => {
    const qty       = (item.qty || 1);
    const itemTotal = item.price * qty;
    subtotal       += itemTotal;
    const imgUrl    = getProductImg(item.name);
    // item.size present when added from product.html; absent when added from card
    const sizeTag   = item.size ? `<span class="ci-size">${item.size}</span>` : '';
    const productId = item.id || '';

    cartItems.innerHTML += `
      <div class="ci">
        <a href="${productId ? 'product.html?id=' + productId : '#'}" class="ci-thumb" style="background-image:url('${imgUrl}');display:block;"></a>
        <div class="ci-info">
          <div class="ci-name">${productId ? `<a href="product.html?id=${productId}" style="color:inherit;">${item.name}</a>` : item.name}</div>
          ${sizeTag}
          <div class="ci-price">₹${item.price.toLocaleString()}</div>
          <div class="qty-row">
            <button class="qb" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qn">${qty}</span>
            <button class="qb" onclick="changeQty(${idx}, 1)">+</button>
            <button class="rm-btn" onclick="removeItem(${idx})">Remove</button>
          </div>
        </div>
        <div class="ci-total">₹${itemTotal.toLocaleString()}</div>
      </div>`;
  });

  document.getElementById('subtotal').textContent = '₹' + subtotal.toLocaleString();
  document.getElementById('total').textContent    = '₹' + subtotal.toLocaleString();
}

function changeQty(idx, delta) {
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  if (!cart[idx]) return;
  cart[idx].qty = (cart[idx].qty || 1) + delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge();
}

function removeItem(idx) {
  const cart = JSON.parse(localStorage.getItem('sw_cart') || '[]');
  cart.splice(idx, 1);
  localStorage.setItem('sw_cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge();
  toast('Item removed from cart.', 'success');
}

function checkout() {
  const user = localStorage.getItem('sw_user');
  if (!user) {
    showPop('⚠️', 'Login Required', 'Please login to proceed with checkout.');
    setTimeout(() => window.location.href = 'login.html', 2000);
    return;
  }
  showPop('✅', 'Order Placed!', 'Thank you! Your order has been confirmed and will be shipped soon.');
  setTimeout(() => {
    localStorage.setItem('sw_cart', '[]');
    closePop();
    loadCart();
    updateCartBadge();
  }, 2500);
}

document.addEventListener('DOMContentLoaded', loadCart);
