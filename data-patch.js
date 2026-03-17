// DATA PATCH — Replace placeholder "Mixed" product names with real brand names
// Run this after data.js loads, or merge into data.js directly

const PRODUCT_NAME_OVERRIDES = {
  'p49': { name: 'Bushido Oversized Hoodie', anime: 'Original' },
  'p50': { name: 'Ronin Graphic Tee', anime: 'Original' },
  'p51': { name: 'Neo Tokyo Vol.1 Oversized', anime: 'Original' },
  'p52': { name: 'Cyber Shinobi Oversized', anime: 'Original' },
  'p53': { name: 'Varsity Anime Jacket', anime: 'Original' },
  'p54': { name: 'Dark Arc Bomber Jacket', anime: 'Original' },
  'p55': { name: 'Void Realm Hoodie', anime: 'Original' },
  'p56': { name: 'Silent Thunder Tee', anime: 'Original' },
  'p57': { name: 'Shadow Realm Phone Cover', anime: 'Original' },
  'p58': { name: 'Limited Collector Figure', anime: 'Original' },
  'p59': { name: 'The Reaper Hoodie', anime: 'Original' },
  'p60': { name: 'Hollow World Graphic Tee', anime: 'Original' },
  'p61': { name: 'Spiral Abyss Cover', anime: 'Original' },
  'p62': { name: 'Cursed Spirit Figure', anime: 'Original' },
  'p63': { name: 'Ancient Battle Hoodie', anime: 'Original' },
  'p64': { name: 'Awakened Form Tee', anime: 'Original' },
  'p65': { name: 'Eternal Loop Cover', anime: 'Original' },
  'p66': { name: 'God Tier Figurine', anime: 'Original' },
  'p67': { name: 'Street Samurai Hoodie', anime: 'Original' },
  'p68': { name: 'Fallen Kingdom Tee', anime: 'Original' },
  'p69': { name: 'Blade Edge Cover', anime: 'Original' },
  'p70': { name: 'Rogue Saint Figure', anime: 'Original' },
  'p71': { name: 'Titan Silhouette Hoodie', anime: 'Original' },
  'p72': { name: 'Last Arc Tee', anime: 'Original' },
  'p73': { name: 'Final Form Cover', anime: 'Original' },
  'p74': { name: 'Zero Two Figurine', anime: 'Original' },
  'p75': { name: 'Celestial Season Oversized', anime: 'Original' },
  'p76': { name: 'Parallel World Tee', anime: 'Original' },
  'p77': { name: 'Cosmic Chain Cover', anime: 'Original' },
  'p78': { name: 'Legendary Drop Figure', anime: 'Original' },
  'p79': { name: 'Ghost Protocol Hoodie', anime: 'Original' },
};

// Apply overrides to the products array
if (typeof products !== 'undefined') {
  products.forEach(p => {
    if (PRODUCT_NAME_OVERRIDES[p.id]) {
      p.name = PRODUCT_NAME_OVERRIDES[p.id].name;
      p.anime = PRODUCT_NAME_OVERRIDES[p.id].anime;
    }
  });
}
