/**
 * bodyProfile.js — Body type estimation module
 * Shonowear platform
 *
 * Responsibilities:
 *  - Capture height, weight, gender, style preferences from form
 *  - Calculate BMI
 *  - Classify body type (Slim / Average / Athletic / Broad)
 *  - Save profile to localStorage
 *  - Redirect to recommendations.html
 */

'use strict';

/* ── Body type classification ───────────────────────────── */

/**
 * Classify body type from BMI
 * BMI < 19    → Slim
 * BMI 19–23   → Average
 * BMI 23–27   → Athletic
 * BMI > 27    → Broad
 *
 * @param {number} bmi
 * @returns {string}
 */
function classifyBodyType(bmi) {
  if (bmi < 19)   return 'Slim';
  if (bmi < 23)   return 'Average';
  if (bmi <= 27)  return 'Athletic';
  return 'Broad';
}

/* ── BMI bar width for visual indicator ─────────────────── */

function getBMIBarPct(bmi) {
  // Map BMI range 12–35 to 0–100%
  return Math.min(100, Math.max(0, ((bmi - 12) / (35 - 12)) * 100));
}

/* ── Live BMI preview ────────────────────────────────────── */

function updateBMIPreview(heightEl, weightEl, previewEl, barEl, typeLabelEl, valLabelEl) {
  const h = parseFloat(heightEl?.value);
  const w = parseFloat(weightEl?.value);

  if (!previewEl) return;

  if (!h || !w || h < 100 || w < 20) {
    previewEl.style.display = 'none';
    return;
  }

  const bmi  = calcBMI(h, w);
  const type = classifyBodyType(bmi);
  const pct  = getBMIBarPct(bmi);
  const meta = getBodyTypeMeta(type);

  previewEl.style.display = 'block';
  if (barEl)       barEl.style.width = pct + '%';
  if (typeLabelEl) typeLabelEl.textContent = type;
  if (valLabelEl)  valLabelEl.textContent  = 'BMI: ' + bmi.toFixed(1);

  // Colour the bar based on type
  if (barEl) barEl.style.background = `linear-gradient(90deg, ${meta.color}, var(--gold))`;
}

/* ── Style pill toggle ───────────────────────────────────── */

function toggleStylePill(btn) {
  btn.classList.toggle('selected');
}

/* ── Collect selected style pills ────────────────────────── */

function getSelectedStyles() {
  return [...document.querySelectorAll('.bp-style-pill.selected')]
    .map(b => b.dataset.style)
    .filter(Boolean);
}

/* ── Form validation ─────────────────────────────────────── */

function validateProfileForm(h, w) {
  const errors = [];
  if (!h || isNaN(h) || h < 100 || h > 250) errors.push('height');
  if (!w || isNaN(w) || w < 20  || w > 300) errors.push('weight');
  return errors;
}

/* ── Save profile to localStorage ────────────────────────── */

function saveBodyProfile(height, weight, gender, stylePrefs) {
  const bmi      = calcBMI(height, weight);
  const bodyType = classifyBodyType(bmi);

  // Primary key used by recommendation engine
  localStorage.setItem('bodyType', bodyType);

  // Extended profile data
  localStorage.setItem('sw_bmi',        bmi.toFixed(2));
  localStorage.setItem('sw_height',     height);
  localStorage.setItem('sw_weight',     weight);
  localStorage.setItem('sw_gender',     gender || '');
  localStorage.setItem('sw_stylePrefs', JSON.stringify(stylePrefs || []));
  localStorage.setItem('sw_profileDone','1');

  return { bodyType, bmi };
}

/* ── Prefill form from existing profile ─────────────────── */

function prefillProfileForm() {
  const h  = localStorage.getItem('sw_height');
  const w  = localStorage.getItem('sw_weight');
  const g  = localStorage.getItem('sw_gender');
  const sp = JSON.parse(localStorage.getItem('sw_stylePrefs') || '[]');

  const hEl = document.getElementById('bp-height');
  const wEl = document.getElementById('bp-weight');
  const gEl = document.getElementById('bp-gender');

  if (hEl && h) hEl.value = h;
  if (wEl && w) wEl.value = w;
  if (gEl && g) gEl.value = g;

  sp.forEach(s => {
    const pill = document.querySelector(`.bp-style-pill[data-style="${s}"]`);
    if (pill) pill.classList.add('selected');
  });
}

/* ── Main submit handler ─────────────────────────────────── */

function submitBodyProfile(e) {
  if (e) e.preventDefault();

  const hEl = document.getElementById('bp-height');
  const wEl = document.getElementById('bp-weight');
  const gEl = document.getElementById('bp-gender');

  const h = parseFloat(hEl?.value);
  const w = parseFloat(wEl?.value);
  const g = gEl?.value || '';
  const stylePrefs = getSelectedStyles();

  // Validate
  const errors = validateProfileForm(h, w);

  if (errors.includes('height') && hEl) {
    hEl.classList.add('error');
    setTimeout(() => hEl.classList.remove('error'), 1500);
  }
  if (errors.includes('weight') && wEl) {
    wEl.classList.add('error');
    setTimeout(() => wEl.classList.remove('error'), 1500);
  }

  if (errors.length) {
    if (typeof showToast === 'function') showToast('Please enter valid height and weight.', 'error');
    return;
  }

  // Save
  const { bodyType, bmi } = saveBodyProfile(h, w, g, stylePrefs);

  // Animate submit button
  const btn = document.querySelector('.bp-submit');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Analysing your profile…';
    btn.disabled  = true;
  }

  // Redirect
  setTimeout(() => {
    window.location.href = 'recommendations.html';
  }, 900);
}

/* ── Init — called on body-profile.html ─────────────────── */

function initBodyProfile() {
  const hEl = document.getElementById('bp-height');
  const wEl = document.getElementById('bp-weight');
  const previewEl  = document.getElementById('bmi-preview');
  const barEl      = document.getElementById('bmi-bar');
  const typeLabelEl = document.getElementById('bmi-type-label');
  const valLabelEl  = document.getElementById('bmi-val-label');

  const update = () => updateBMIPreview(hEl, wEl, previewEl, barEl, typeLabelEl, valLabelEl);

  hEl?.addEventListener('input', update);
  wEl?.addEventListener('input', update);

  // Style pills
  document.querySelectorAll('.bp-style-pill').forEach(btn => {
    btn.addEventListener('click', () => toggleStylePill(btn));
  });

  // Form submit
  const form = document.getElementById('bp-form');
  form?.addEventListener('submit', submitBodyProfile);

  // Prefill existing profile
  prefillProfileForm();
  update(); // run preview if values exist
}

/* ── Global exports ─────────────────────────────────────── */
window.initBodyProfile    = initBodyProfile;
window.submitBodyProfile  = submitBodyProfile;
window.classifyBodyType   = classifyBodyType;
window.saveBodyProfile    = saveBodyProfile;
window.toggleStylePill    = toggleStylePill;
