/**
 * utils.js — Shared utility functions
 * Shonowear platform
 */

'use strict';

/* ── Storage helpers ─────────────────────────────────────── */

const SW = {

  // Generic get/set/remove for sw_ namespaced localStorage keys
  get(key) {
    try { return localStorage.getItem('sw_' + key); } catch { return null; }
  },

  set(key, value) {
    try { localStorage.setItem('sw_' + key, value); return true; } catch { return false; }
  },

  getJSON(key) {
    try { return JSON.parse(localStorage.getItem('sw_' + key) || 'null'); } catch { return null; }
  },

  setJSON(key, value) {
    try { localStorage.setItem('sw_' + key, JSON.stringify(value)); return true; } catch { return false; }
  },

  remove(key) {
    try { localStorage.removeItem('sw_' + key); return true; } catch { return false; }
  },

  // Body type profile helpers
  getBodyType()   { return localStorage.getItem('bodyType') || null; },
  setBodyType(bt) { localStorage.setItem('bodyType', bt); },
  getBMI()        { return parseFloat(localStorage.getItem('sw_bmi') || '0') || null; },
  getProfile() {
    return {
      bodyType:   localStorage.getItem('bodyType'),
      bmi:        localStorage.getItem('sw_bmi'),
      height:     localStorage.getItem('sw_height'),
      weight:     localStorage.getItem('sw_weight'),
      gender:     localStorage.getItem('sw_gender'),
      stylePrefs: JSON.parse(localStorage.getItem('sw_stylePrefs') || '[]'),
      done:       !!localStorage.getItem('sw_profileDone'),
    };
  },

};

/* ── BMI / Body type ─────────────────────────────────────── */

/**
 * Calculate BMI from height (cm) and weight (kg)
 * @param {number} heightCm
 * @param {number} weightKg
 * @returns {number} BMI value
 */
function calcBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return 0;
  const hm = heightCm / 100;
  return weightKg / (hm * hm);
}

/**
 * Classify body type from BMI value
 * @param {number} bmi
 * @returns {string} 'Slim' | 'Average' | 'Athletic' | 'Broad'
 */
function getBodyTypeFromBMI(bmi) {
  if (bmi < 19)    return 'Slim';
  if (bmi < 23)    return 'Average';
  if (bmi <= 27)   return 'Athletic';
  return 'Broad';
}

/**
 * Get body type metadata (icon, description, tips)
 * @param {string} bodyType
 * @returns {object}
 */
function getBodyTypeMeta(bodyType) {
  const META = {
    Slim: {
      icon:  'fas fa-feather-alt',
      color: '#60a5fa',
      desc:  'Lean silhouette — structured and fitted cuts look sharp. Drop-shoulder tees, slim hoodies, and structured jackets are your zone.',
      tip:   'Size down in oversized pieces for a regular fit. Slim-fit cuts highlight your proportions.',
    },
    Average: {
      icon:  'fas fa-user',
      color: '#10b981',
      desc:  'Versatile build — the widest range of cuts work well for you. Hoodies, oversized tees, and layered fits all suit you.',
      tip:   'You can wear almost anything. Use style preference to narrow your picks.',
    },
    Athletic: {
      icon:  'fas fa-dumbbell',
      color: '#f0b429',
      desc:  'Defined build — boxy and structured silhouettes complement your proportions. Oversized hoodies and drop-shoulder tees are your match.',
      tip:   'Oversized cuts give room for your build. Avoid very slim cuts that restrict movement.',
    },
    Broad: {
      icon:  'fas fa-expand-arrows-alt',
      color: '#e8153a',
      desc:  'Powerful build — oversized and relaxed silhouettes create clean, confident lines. Volume and flow are your friends.',
      tip:   'Go for relaxed and oversized cuts. Avoid anything labelled "slim fit" or "fitted".',
    },
  };
  return META[bodyType] || META.Average;
}

/* ── Number formatting ───────────────────────────────────── */

function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatBMI(n) {
  return Number(n).toFixed(1);
}

/* ── DOM helpers ─────────────────────────────────────────── */

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function el(tag, attrs = {}, children = []) {
  const elem = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') elem.className = v;
    else if (k === 'html') elem.innerHTML = v;
    else if (k === 'text') elem.textContent = v;
    else elem.setAttribute(k, v);
  });
  children.forEach(c => c && elem.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return elem;
}

/* ── Fetch helpers ───────────────────────────────────────── */

/**
 * Load a JSON file. Returns parsed data or null on failure.
 * @param {string} url
 * @returns {Promise<any>}
 */
async function loadJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[SW] loadJSON failed for ${url}:`, err.message);
    return null;
  }
}

/* ── Debounce ────────────────────────────────────────────── */

function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── URL params ──────────────────────────────────────────── */

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ── Toast notification ──────────────────────────────────── */

function showToast(msg, type = 'info', duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;
  const colors = { success: '#10b981', error: '#ef4444', info: '#e8153a' };
  el.textContent = msg;
  el.style.background = colors[type] || colors.info;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* ── Exports (available globally for non-module scripts) ─── */
window.SW              = SW;
window.calcBMI         = calcBMI;
window.getBodyTypeFromBMI = getBodyTypeFromBMI;
window.getBodyTypeMeta = getBodyTypeMeta;
window.formatPrice     = formatPrice;
window.formatBMI       = formatBMI;
window.$               = $;
window.$$              = $$;
window.loadJSON        = loadJSON;
window.debounce        = debounce;
window.getParam        = getParam;
window.showToast       = showToast;
