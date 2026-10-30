import { formatPrice } from '../utils/format';

export { formatPrice };

/* ------------------------------------------------------------------ *
 * Color tokens
 * ------------------------------------------------------------------ */
const BLACK = { name: 'Black', hex: '#000000' };
const STONE = { name: 'Stone', hex: '#D9D9D6' };
const CREAM = { name: 'Cream', hex: '#F5F5F3' };
const OLIVE = { name: 'Olive', hex: '#6B7B5C' };
const NAVY = { name: 'Navy', hex: '#1B2A4A' };

// Global swatch list used by the shop color filter.
export const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'Stone', hex: '#D9D9D6' },
  { name: 'Cream', hex: '#F5F5F3' },
  { name: 'Olive', hex: '#6B7B5C' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Brown', hex: '#8B7355' },
  { name: 'Green', hex: '#4A5D4E' },
  { name: 'Blue', hex: '#3B5B7A' },
];

export const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const S = (map) => Object.entries(map).map(([label, stock]) => ({ label, stock }));
const imgs = () => Array(5).fill(null);

export const colorHex = (c) => (typeof c === 'string' ? c : c?.hex || '#000000');
export const colorName = (c) => (typeof c === 'string' ? c : c?.name || '');

// Shared add-ons referenced by products.
export const accessoryPool = [
  { id: 'a1', name: 'Sticker Pack', price: 1305 },
  { id: 'a2', name: 'Beanie', price: 5074 },
  { id: 'a3', name: 'Socks (3-Pack)', price: 3624 },
  { id: 'a4', name: 'Tech Cap', price: 6524 },
  { id: 'a5', name: 'Tote Bag', price: 4349 },
];

/* ------------------------------------------------------------------ *
 * Reusable copy + feature sets
 * ------------------------------------------------------------------ */
const FEATURES = {
  hood: [
    { icon: 'drop', title: 'Water resistant', sub: 'Light rain ready' },
    { icon: 'pocket', title: 'Multi pockets', sub: 'Everyday storage' },
    { icon: 'fit', title: 'Adjustable fit', sub: 'Hem + hood toggles' },
  ],
  tee: [
    { icon: 'drop', title: 'Heavyweight cotton', sub: '240gsm, garment-dyed' },
    { icon: 'ruler', title: 'Boxy fit', sub: 'Dropped shoulders' },
    { icon: 'refresh', title: 'Pre-shrunk', sub: 'Keeps its shape' },
  ],
  pants: [
    { icon: 'pocket', title: 'Deep pockets', sub: 'Cargo utility' },
    { icon: 'fit', title: 'Adjustable hem', sub: 'Drawcord cuffs' },
    { icon: 'shield', title: 'Reinforced seams', sub: 'Built to last' },
  ],
  outer: [
    { icon: 'drop', title: 'Weatherproof', sub: 'Wind + light rain' },
    { icon: 'shield', title: 'Sealed seams', sub: 'Fully taped' },
    { icon: 'refresh', title: 'Packable', sub: 'Folds into pocket' },
  ],
  acc: [
    { icon: 'shield', title: 'Durable build', sub: 'Everyday hardware' },
    { icon: 'fit', title: 'One size', sub: 'Adjustable strap' },
    { icon: 'refresh', title: 'Easy care', sub: 'Wipe clean' },
  ],
};

const DESC = {
  hood: 'Built for the in-between. A heavyweight shell with a relaxed cut, articulated sleeves and a hood that actually holds its shape. Washed for a lived-in hand feel from day one.',
  tee: 'A boxy heavyweight tee cut from 240gsm combed cotton. Garment-dyed for depth, with a ribbed collar that keeps its line after every wash.',
  pants: 'Utility-driven trousers with a considered fit. Reinforced seams, deep pockets and a drawcord hem you can tailor to your stride.',
  outer: 'A technical outer layer that shrugs off wind and light rain. Sealed seams and a packable build make it the one you reach for on repeat.',
  acc: 'A small object with a big job. Made from durable materials and finished with AFREAK hardware.',
};

const SHORT = 'Technical details meet minimal aesthetics.';
const p = (o) => ({
  rating: 4.8,
  reviewCount: 1200,
  shortDescription: SHORT,
  images: imgs(),
  accessories: [],
  customizable: false,
  ...o,
});

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */
export const products = [
  p({
    id: 1, slug: 'utility-hoodie', name: 'Utility Hoodie', price: 17397, oldPrice: 21747,
    category: 'hoodies', isNew: true, rating: 4.8, reviewCount: 1200,
    description: DESC.hood, features: FEATURES.hood, colors: [BLACK, STONE],
    sizes: S({ XS: 4, S: 10, M: 2, L: 0, XL: 7 }),
    pairWith: [2, 3, 4, 6], accessories: [accessoryPool[0]], customizable: true,
  }),
  p({
    id: 2, slug: 'oversized-t-shirt', name: 'Oversized T-Shirt', price: 8699,
    category: 't-shirts', rating: 4.7, reviewCount: 860,
    description: DESC.tee, features: FEATURES.tee, colors: [BLACK, CREAM],
    sizes: S({ XS: 8, S: 14, M: 12, L: 6, XL: 4 }),
    pairWith: [1, 3, 10, 4], customizable: true,
  }),
  p({
    id: 3, slug: 'cargo-pants', name: 'Cargo Pants', price: 20297,
    category: 'pants', rating: 4.6, reviewCount: 540,
    description: DESC.pants, features: FEATURES.pants, colors: [BLACK, OLIVE],
    sizes: S({ S: 9, M: 11, L: 5, XL: 0 }), pairWith: [1, 2, 18, 4],
  }),
  p({
    id: 4, slug: 'tech-cap', name: 'Tech Cap', price: 6524,
    category: 'accessories', rating: 4.5, reviewCount: 320,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, STONE],
    sizes: S({ 'One size': 25 }), pairWith: [1, 2],
  }),
  p({
    id: 5, slug: 'tech-cargo-hoodie', name: 'Tech Cargo Hoodie', price: 23196,
    category: 'hoodies', isNew: true, rating: 4.9, reviewCount: 210,
    description: DESC.hood, features: FEATURES.hood, colors: [BLACK, STONE],
    sizes: S({ S: 6, M: 9, L: 3, XL: 2 }),
    pairWith: [1, 3, 7, 4], accessories: [accessoryPool[0], accessoryPool[4]], customizable: true,
  }),
  p({
    id: 6, slug: 'bucket-hat', name: 'Bucket Hat', price: 5799,
    category: 'accessories', isNew: true, rating: 4.4, reviewCount: 180,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, STONE, CREAM],
    sizes: S({ 'One size': 20 }), pairWith: [1, 2],
  }),
  p({
    id: 7, slug: 'shoulder-bag', name: 'Shoulder Bag', price: 10148,
    category: 'accessories', isNew: true, rating: 4.7, reviewCount: 240,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, STONE],
    sizes: S({ 'One size': 18 }), pairWith: [1, 5, 4],
  }),
  p({
    id: 8, slug: 'graphic-tee', name: 'Graphic Tee', price: 7974, oldPrice: 10873,
    category: 't-shirts', rating: 4.6, reviewCount: 690,
    description: DESC.tee, features: FEATURES.tee, colors: [BLACK, CREAM, STONE],
    sizes: S({ XS: 6, S: 11, M: 14, L: 9, XL: 3 }), pairWith: [1, 3, 4, 6],
  }),
  p({
    id: 9, slug: 'heavyweight-hoodie', name: 'Heavyweight Hoodie', price: 18847, oldPrice: 23921,
    category: 'hoodies', rating: 4.8, reviewCount: 410,
    description: DESC.hood, features: FEATURES.hood, colors: [BLACK, STONE],
    sizes: S({ S: 7, M: 10, L: 0, XL: 5 }), pairWith: [2, 3, 10, 11], customizable: true,
  }),
  p({
    id: 10, slug: 'track-pants', name: 'Track Pants', price: 15948,
    category: 'pants', rating: 4.5, reviewCount: 300,
    description: DESC.pants, features: FEATURES.pants, colors: [BLACK, NAVY],
    sizes: S({ S: 10, M: 13, L: 8, XL: 4 }), pairWith: [1, 9, 2, 4],
  }),
  p({
    id: 11, slug: 'socks-pack', name: 'Socks Pack (3)', price: 3624,
    category: 'accessories', rating: 4.3, reviewCount: 150,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, STONE, CREAM],
    sizes: S({ 'One size': 40 }), pairWith: [1, 3],
  }),
  p({
    id: 12, slug: 'crossbody-bag', name: 'Crossbody Bag', price: 12323,
    category: 'accessories', isNew: true, rating: 4.7, reviewCount: 95,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, OLIVE],
    sizes: S({ 'One size': 15 }), pairWith: [1, 7, 4],
  }),
  p({
    id: 13, slug: 'long-sleeve-tee', name: 'Long Sleeve Tee', price: 10148,
    category: 't-shirts', rating: 4.6, reviewCount: 220,
    description: DESC.tee, features: FEATURES.tee, colors: [BLACK, CREAM],
    sizes: S({ XS: 7, S: 12, M: 10, L: 6, XL: 2 }), pairWith: [1, 3, 4, 17], customizable: true,
  }),
  p({
    id: 14, slug: 'puffer-vest', name: 'Puffer Vest', price: 21747,
    category: 'outerwear', isNew: true, rating: 4.8, reviewCount: 130,
    description: DESC.outer, features: FEATURES.outer, colors: [BLACK, OLIVE],
    sizes: S({ S: 5, M: 8, L: 4, XL: 0 }), pairWith: [1, 9, 10, 4],
  }),
  p({
    id: 15, slug: 'beanie', name: 'Beanie', price: 5074,
    category: 'accessories', rating: 4.5, reviewCount: 260,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, STONE, CREAM],
    sizes: S({ 'One size': 30 }), pairWith: [1, 2],
  }),
  p({
    id: 16, slug: 'windbreaker', name: 'Windbreaker', price: 26096, oldPrice: 31895,
    category: 'outerwear', rating: 4.7, reviewCount: 175,
    description: DESC.outer, features: FEATURES.outer, colors: [BLACK, NAVY, OLIVE],
    sizes: S({ S: 6, M: 9, L: 5, XL: 3 }), pairWith: [1, 10, 3, 4],
  }),
  p({
    id: 17, slug: 'cargo-shorts', name: 'Cargo Shorts', price: 13048,
    category: 'pants', rating: 4.4, reviewCount: 140,
    description: DESC.pants, features: FEATURES.pants, colors: [BLACK, OLIVE, STONE],
    sizes: S({ S: 11, M: 14, L: 9, XL: 6 }), pairWith: [2, 13, 4, 20], customizable: true,
  }),
  p({
    id: 18, slug: 'baseball-cap', name: 'Baseball Cap', price: 5799,
    category: 'accessories', rating: 4.4, reviewCount: 210,
    description: DESC.acc, features: FEATURES.acc, colors: [BLACK, STONE],
    sizes: S({ 'One size': 22 }), pairWith: [1, 3],
  }),
  p({
    id: 19, slug: 'zip-hoodie', name: 'Zip Hoodie', price: 20297,
    category: 'hoodies', rating: 4.7, reviewCount: 280,
    description: DESC.hood, features: FEATURES.hood, colors: [BLACK, STONE, OLIVE],
    sizes: S({ S: 8, M: 11, L: 7, XL: 4 }), pairWith: [2, 3, 10, 4], customizable: true,
  }),
  p({
    id: 20, slug: 'mesh-shorts', name: 'Mesh Shorts', price: 9424,
    category: 'pants', isNew: true, rating: 4.5, reviewCount: 88,
    description: DESC.pants, features: FEATURES.pants, colors: [BLACK, NAVY, CREAM],
    sizes: S({ S: 12, M: 15, L: 10, XL: 6 }), pairWith: [2, 10, 4, 17], customizable: true,
  }),
];

/* ------------------------------------------------------------------ *
 * Category list (counts computed)
 * ------------------------------------------------------------------ */
const countOf = (slug) => products.filter((x) => x.category === slug).length;

export const categories = [
  { slug: 'all', name: 'All Products', count: products.length },
  { slug: 'hoodies', name: 'Hoodies', count: countOf('hoodies') },
  { slug: 't-shirts', name: 'T-Shirts', count: countOf('t-shirts') },
  { slug: 'pants', name: 'Pants', count: countOf('pants') },
  { slug: 'outerwear', name: 'Outerwear', count: countOf('outerwear') },
  { slug: 'accessories', name: 'Accessories', count: countOf('accessories') },
];

/* ------------------------------------------------------------------ *
 * Selectors
 * ------------------------------------------------------------------ */
export function getProductBySlug(slug) {
  return products.find((x) => x.slug === slug);
}

export function getProductById(id) {
  return products.find((x) => String(x.id) === String(id));
}

export function getProductsByIds(ids = []) {
  return ids.map(getProductById).filter(Boolean);
}

export function getProductsByCategory(slug) {
  if (!slug || slug === 'all') return products;
  return products.filter((x) => x.category === slug);
}

export function getNewArrivals() {
  return products.filter((x) => x.isNew);
}

export function getFeaturedProducts(count = 4) {
  return products.slice(0, count);
}

export function getLowStock(product, sizeLabel) {
  const entry = product?.sizes?.find((s) => s.label === sizeLabel);
  return entry ? entry.stock : 0;
}
