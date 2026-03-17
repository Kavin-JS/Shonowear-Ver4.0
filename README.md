# Shonowear

Anime-inspired streetwear discovery platform. Users enter their body measurements, get a body type estimate, and receive personalised outfit recommendations — instead of browsing a generic catalog.

---

## What It Does

1. User visits → onboarding banner appears for new visitors
2. User enters height + weight + style preferences on `body-profile.html`
3. BMI is calculated → body type classified (Slim / Average / Athletic / Broad)
4. `recommendations.html` shows curated outfit bundles matched to their build
5. User clicks an outfit → `outfit.html` shows all pieces with add-all-to-cart
6. Product pages show body type suitability for every item

---

## Project Structure

```
Shonowear/
│
├── index.html                  Homepage (personalised hero + RFY section)
├── body-profile.html           Body profile setup form
├── recommendations.html        Personalised outfit + product grid
├── outfit.html                 Full outfit detail page
├── product.html                Product detail with body type tab
├── collection.html             Full catalog (filterable by style + body type)
│
├── js/
│   ├── utils.js                BMI calc, localStorage helpers, fetch, toast
│   ├── bodyProfile.js          Body type estimation + form handling
│   ├── recommendationEngine.js Filter + rank outfits by body type & trendScore
│   └── outfitRenderer.js       Render outfit cards and detail views
│
├── data/
│   ├── outfits.json            12 curated outfit bundles
│   ├── styles.json             4 style aesthetics (Tokyo Street, Cyberpunk, etc.)
│   └── products.json           Structured product data with bodyTypes field
│
├── css/
│   ├── layout.css              Grid, containers, outfit card layout
│   ├── components.css          Reusable UI: pills, banners, badges, cards
│   ├── main.css                Module entry point + design token reference
│   └── responsive.css          Breakpoints reference (1100 / 900 / 600px)
│
├── components/
│   ├── navbar.html             Reusable navbar HTML
│   └── footer.html             Reusable footer HTML
│
├── assets/
│   └── images/                 products / outfits / styles (add your own)
│
├── style.css                   Production CSS — single source of truth
├── data.js                     Product array used by all existing pages
├── main.js                     Shared: nav, cart, toast, renderProductCard
├── app.js                      Homepage: outfit builder, countdown, analytics
├── cart.js                     Cart management
├── wishlist.js                 Wishlist sidebar
├── shared-ui.js                Size guide modal, sticky ATC, link loader
│
└── docs/
    └── startup-notes.txt       Full architecture + feature checklist
```

---

## Body Type System

| BMI        | Type     | Best cuts                          |
|------------|----------|------------------------------------|
| < 19       | Slim     | Structured, fitted, drop-shoulder  |
| 19 – 23    | Average  | Most cuts work                     |
| 23 – 27    | Athletic | Boxy, oversized, structured        |
| > 27       | Broad    | Relaxed, oversized, high volume    |

localStorage keys: `bodyType`, `sw_bmi`, `sw_height`, `sw_weight`, `sw_stylePrefs`

---

## Style Aesthetics

| Style          | Label  | Vibe                                    |
|----------------|--------|-----------------------------------------|
| Tokyo Street   | 東京   | Bold graphics, dark silhouettes         |
| Cyberpunk      | サイバー| Neon accents, futuristic               |
| Minimal Anime  | ミニマル| Clean lines, subtle references         |
| Shibuya Casual | 渋谷   | Relaxed, effortless, street cool        |

Filter URL: `collection.html?style=Tokyo+Street`

---

## Before Going Live

- [ ] Replace `YOUR_NUMBER` with real WhatsApp Business number (search across all HTML)
- [ ] Add real Google Analytics ID (search `G-YOUR_ID`)
- [ ] Add real Meta Pixel ID
- [ ] Replace `profile.jpg` with your own photo
- [ ] Replace Unsplash hero + product images with real product shots
- [ ] Verify social proof numbers match reality

---

## Built With

HTML · CSS · Vanilla JavaScript · localStorage · Fetch API

No frameworks. No build step. Open `index.html` in a browser and it works.

---

**Founder:** Kavin J.S · kavin.js@outlook.com · [@kavin.j.s](https://instagram.com/kavin.j.s)
