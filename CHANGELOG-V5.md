# Shonowear — Version 5.0 Changelog
**Release: March 2026 | Prepared by Claude (Anthropic)**

---

## Summary
Full frontend engineering upgrade from V4.0 to V5.0. Every major area
of the site has been improved: performance, accessibility, UX, SEO, and
new features. All changes are drop-in compatible — vanilla HTML/CSS/JS,
no frameworks required.

---

## ✅ Global Systems

### Toast Queue System (`main.js`)
- **Replaced** basic single-element toast with a full multi-toast queue
- Types: `success` (green), `error` (red), `warning` (amber), `info` (indigo)
- Stack in bottom-right; each auto-dismisses after 3.5s with a progress bar
- **Undo action**: `showToast({ message, type, action, onAction })` — clicking
  the action label fires `onAction` and removes the toast
- Backward compatible: `toast(msg, type)` still works

### Skeleton Loader System (`shared-ui.js`)
- `skeletonCards(n)` — generates n shimmer placeholder cards
- `withSkeleton(selector, fn, ms)` — shows skeletons, then calls render function
- Shimmer uses `@keyframes shimmer` with `linear-gradient`
- Respects `prefers-reduced-motion` — disables animation for users who need it
- Shape classes: `.sk-text`, `.sk-circle`, `.sk-rect`, `.sk-card`

### Scroll-to-Top (`shared-ui.js`)
- Auto-injects a 40px floating button if not already in HTML
- Appears smoothly after 400px scroll (opacity + translateY transition)
- GPU-accelerated: uses `transform`, not `top`/`bottom` changes

### Utility Functions (`js/utils.js`)
- `fetchPincodeData(pin)` — calls free `api.postalpincode.in` API
- `formatDate(date, relative)` — "15 Mar 2026" or "2 days ago"
- `estimateDelivery(min, max)` — skips Sundays for accurate business-day range
- `debounceLeading(fn, ms)` — fires immediately then locks for `ms`

---

## ✅ Homepage (`index.html`)

### Hero Section
- `<div class="hero-photo">` → `<picture>` element with `<source type="image/webp">`
  and `<img>` fallback
- Added `loading="eager" fetchpriority="high"` — correct for above-fold LCP
- Added `width`/`height` attributes to prevent layout shift (CLS)
- All three title spans now animate with `slideUpFade` keyframes (100ms stagger)
- Hero sub, CTAs also animate in sequence

### Announcement Bar (`nav.js`)
- Static single message → **rotating ticker** with 4 messages
- Crossfade rotation every 4 seconds using opacity + translateY transitions
- No external dependency; pure JS interval

### UGC Community Grid (new section)
- 6-image Instagram-style mosaic grid inserted between Trending and Categories
- Hover overlay shows `@handle`, like count, and "Shop Look" CTA button
- Links to matching product/collection pages
- All images use `loading="lazy"` with explicit `width`/`height`

### How It Works (new section)
- 4-step process grid with connector lines on desktop
- Each step: icon circle, step number, title, description
- Hover: `translateY(-4px)` lift with border-color transition
- IntersectionObserver `.fade-in-section` entrance on scroll

### Accessibility
- `<a href="#trending" class="skip-link">Skip to main content</a>` added as
  first focusable element

### SEO
- Fixed `<link rel="canonical">` (was pointing to Ver3.0 URL)

---

## ✅ Collection Page (`collection.html`)

### URL State & Back Navigation
- `_pushCollURL()` writes all active filters to URL query params after every
  filter change (replaces state via `history.replaceState`)
- Back/forward navigation restores exact filter state and re-syncs all
  pill/dropdown controls

### Infinite Scroll
- Replaced "Load More" button with `IntersectionObserver` sentinel div
- Sentinel is placed at the bottom of the grid; when it enters the viewport
  (with 300px root margin), the next 12 products load automatically
- Loading spinner shown during fetch delay
- Result counter updates: "Showing 24 of 48 products"
- Sentinel detaches cleanly when all products are shown

### Product Grid Entrance
- Cards fade in with staggered `translateY(14px) → 0` animation on each filter change

### Mobile Filter Bottom-Sheet
- Upgraded from slide-from-side panel to slide-from-bottom drawer
- 80vh height, `border-radius: 16px 16px 0 0`, smooth spring easing
- `openMobFilter` / `closeMobFilter` functions upgraded in place

---

## ✅ Cart Page (`cart.html`)

### Sticky Summary Panel
- On desktop (≥900px): summary column is `position: sticky; top: 100px`
- Uses CSS Grid two-column layout (`.cart-layout`)

### Animated Remove
- Remove button triggers opacity + translateX slide-out animation (300ms)
- DOM node removed only after animation completes

### Toast with Undo
- Remove action fires `showToast({ ..., action: 'Undo', onAction })` 
- Clicking Undo within 4 seconds restores the full cart snapshot

### Save for Later
- "Save for Later" button moves item from `sw_cart` to `sw_saved` in localStorage
- Saved items rendered in a separate section below the cart
- "Move to Cart" button moves item back (merges qty if already in cart)

### Order Summary Upgrades
- Shipping row shows FREE (gold) vs ₹99 dynamically based on subtotal vs ₹999 threshold
- Discount row appears only when a promo code is applied
- Delivery estimate rendered using `estimateDelivery()` from utils.js

### Promo Code
- Full upgrade: Enter key submits, input goes readonly on success with green border
- Invalid: red border + error message
- Three valid codes: `ANIME10` (10%), `CULTURE15` (15%), `SW25` (25%)
- Discount fed into `updateSummary()` via `window._appliedDiscount`

### Cookie Banner
- "Necessary Only" now stores `'necessary'` vs `'all'` in localStorage
- Banner re-shows after 180 days (instead of never again)

---

## ✅ Checkout Page (`checkout.html`)

### Real-time Inline Validation
- Every field validates on `blur` (when user leaves) and live on `input`
  (if already in an error/valid state)
- **Error state**: red border + `<i class="fas fa-exclamation-circle">` + message
- **Success state**: green border + `<i class="fas fa-check-circle">` + OK text
- Field rules:
  - Name: ≥2 chars
  - Phone: valid Indian 10-digit mobile (starts 6–9)
  - Email: standard regex (optional)
  - Address: ≥5 chars
  - City: ≥2 chars
  - Pincode: exactly 6 digits
  - UPI ID: `name@provider` format (optional)
  - Card number: 16 digits after formatting (optional)
  - Expiry: MM / YY format (optional)
  - CVV: 3–4 digits (optional)

### Pincode Auto-fill
- Pincode field triggers a debounced (600ms) call to `api.postalpincode.in`
- On success: auto-fills City and State fields if empty
- Shows district + state name as the field's success message
- Error feedback if pincode is not found

### utils.js loaded
- `js/utils.js` now included before `main.js` in checkout so `debounce`
  and `fetchPincodeData` are available

---

## ✅ Product Page (`product.html` + `product.js`)

### Gallery
- Main image: `<div>` with `background-image` → real `<img>` element
  with `loading="eager" fetchpriority="high"`
- Thumbnails: real `<img loading="lazy">` with descriptive `alt` text
- `switchThumb()`: crossfade opacity transition on main image swap
- Lightbox arrow keys + Escape already wired in existing code

### Shipping Tab: Pincode Delivery Estimator
- Input field in the Shipping tab: enter any 6-digit pincode
- Debounced (600ms) call to `api.postalpincode.in`
- Metro detection: Mumbai/Delhi/Bangalore etc → 2–4 day range; others → 4–7 days
- Skips Sundays in date calculation
- Shows: "Chennai, Tamil Nadu — Delivery by 19 Mar – 22 Mar"

### Sticky Mobile Buy Now Bar
- Appears on mobile (< 768px) when the `.pd-actions` div scrolls above the fold
- Mirrors the product name (truncated) + price
- Two buttons: Add to Cart + Buy Now (gold)
- Hides on desktop automatically

### Add to Cart Animation
- Bag icon bounces (`bagBounce` keyframe: up → down → settle)
- Cart badge pulses (`badgePulse` keyframe: scale 1 → 1.5 → 1)
- Button scales down then springs back (0.94 → 1.0, 150ms)
- Toast includes "View Cart" action button

### JSON-LD Structured Data
- `<script type="application/ld+json" id="product-jsonld">` in `<head>`
- Populated dynamically when product loads: name, description, images,
  brand, SKU, aggregateRating, and Offer (price, availability, URL)
- Breadcrumb JSON-LD also injected: Home → Collection → Product Name

---

## ✅ Accessibility (`nav.js` + global)

### Focus Trap
- Tab key cycles within the mobile sidebar when open
- Shift+Tab wraps correctly from first to last focusable element
- Sidebar already has `aria-modal="true"` from V4.0

### Rotating Ticker
- `<div class="ab-ticker">` with `aria-hidden` semantics; purely decorative

### Skip Link
- `.skip-link` added to every page as first focusable element
- Hidden off-screen; appears on `:focus` — jumps to `#trending`

---

## ✅ CSS Additions (`style.css`)

| Addition | Purpose |
|---|---|
| `.hiw-grid` / `.hiw-step` | How It Works section layout + hover |
| `.ugc-grid` / `.ugc-item` / `.ugc-overlay` | UGC community grid |
| `.prd-quick-add` | Hover quick-add button on cards |
| `.prd-wish` | Heart wishlist button on cards |
| `.prd-card .prd-img-wrap` | Uniform 3:4 aspect ratio |
| `.badge-new/sold/low` | Product status badges |
| `.cart-layout` | Two-column sticky cart layout |
| `.ci.removing` | Animated cart row removal |
| `.coupon-row/input/btn/msg` | Coupon input styling |
| `.co-field input.valid/invalid` | Checkout validation states |
| `.field-msg.ok/err` | Inline field feedback messages |
| `.co-pay-opt.selected` | Payment method active state |
| `.ec-cat-card:hover` | Category card scale on hover |
| `@keyframes slideUpFade` | Hero title stagger animation |
| `@keyframes bagBounce` | Add-to-cart icon bounce |
| `@keyframes badgePulse` | Cart badge scale pulse |
| `.skip-link` | Accessibility skip link |
| `@media (max-width:480px/375px)` | Extra mobile breakpoints |

---

## Files Modified

| File | Changes |
|---|---|
| `main.js` | Full toast queue system replacing single toast |
| `shared-ui.js` | Skeleton loader system + auto-inject scroll-to-top |
| `js/utils.js` | `fetchPincodeData`, `formatDate`, `estimateDelivery`, `debounceLeading` |
| `nav.js` | Rotating ticker, focus trap for sidebar |
| `style.css` | All V5.0 visual additions (~300 lines) |
| `index.html` | skip-link, picture element, UGC grid, How It Works, canonical fix |
| `collection.html` | URL state, infinite scroll, skeleton flash, bottom-sheet filter |
| `cart.html` | Sticky layout, animated remove, save-for-later, promo upgrade, cookie upgrade |
| `cart.js` | Full rewrite: save-for-later, undo toast, updateSummary, delivery estimate |
| `checkout.html` | Real-time inline validation, pincode API, utils.js loaded |
| `product.html` | Pincode delivery estimator tab, sticky ATC bar, JSON-LD schema |
| `product.js` | Lazy img gallery, crossfade switchThumb, ATC animation, JSON-LD population |

---

*Shonowear V5.0 — kavin.js@outlook.com · @kavin.j.s*  
*Engineered by Claude (Anthropic) · March 2026*
