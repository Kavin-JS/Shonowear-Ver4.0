// new-arrivals.js — rendering handled inline in new-arrivals.html
// This file kept for compatibility; main logic lives in the page's inline script.
// Exported helpers used by the inline script:

function naApplySort(items, sort) {
  if (sort === 'price-low')  return [...items].sort((a, b) => a.price - b.price);
  if (sort === 'price-high') return [...items].sort((a, b) => b.price - a.price);
  return items; // newest (original order)
}
