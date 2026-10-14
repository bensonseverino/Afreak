export const products = [
  { id: 1, slug: "utility-hoodie", name: "Utility Hoodie", price: 120, category: "hoodies", colors: ["#000000", "#D9D9D6"], sizes: ["XS","S","M","L","XL"], isNew: true },
  { id: 2, slug: "oversized-t-shirt", name: "Oversized T-Shirt", price: 60, category: "t-shirts", colors: ["#000000", "#D9D9D6"], sizes: ["XS","S","M","L","XL"] },
  { id: 3, slug: "cargo-pants", name: "Cargo Pants", price: 140, category: "pants", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"] },
  { id: 4, slug: "tech-cap", name: "Tech Cap", price: 45, category: "accessories", colors: ["#000000", "#D9D9D6"], sizes: ["One size"] },
  { id: 5, slug: "tech-cargo-hoodie", name: "Tech Cargo Hoodie", price: 160, category: "hoodies", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"], isNew: true },
  { id: 6, slug: "bucket-hat", name: "Bucket Hat", price: 40, category: "accessories", colors: ["#000000", "#D9D9D6"], sizes: ["One size"], isNew: true },
  { id: 7, slug: "shoulder-bag", name: "Shoulder Bag", price: 70, category: "accessories", colors: ["#000000", "#D9D9D6"], sizes: ["One size"], isNew: true },
  { id: 8, slug: "graphic-tee", name: "Graphic Tee", price: 55, category: "t-shirts", colors: ["#000000", "#D9D9D6", "#F5F5F3"], sizes: ["XS","S","M","L","XL"], oldPrice: 75 },
  { id: 9, slug: "heavyweight-hoodie", name: "Heavyweight Hoodie", price: 130, category: "hoodies", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"], oldPrice: 165 },
  { id: 10, slug: "track-pants", name: "Track Pants", price: 110, category: "pants", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"] },
  { id: 11, slug: "socks-pack", name: "Socks Pack (3)", price: 25, category: "accessories", colors: ["#000000", "#D9D9D6", "#F5F5F3"], sizes: ["One size"] },
  { id: 12, slug: "crossbody-bag", name: "Crossbody Bag", price: 85, category: "accessories", colors: ["#000000", "#D9D9D6"], sizes: ["One size"], isNew: true },
  { id: 13, slug: "long-sleeve-tee", name: "Long Sleeve Tee", price: 70, category: "t-shirts", colors: ["#000000", "#D9D9D6"], sizes: ["XS","S","M","L","XL"] },
  { id: 14, slug: "puffer-vest", name: "Puffer Vest", price: 150, category: "outerwear", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"], isNew: true },
  { id: 15, slug: "beanie", name: "Beanie", price: 35, category: "accessories", colors: ["#000000", "#D9D9D6", "#F5F5F3"], sizes: ["One size"] },
  { id: 16, slug: "windbreaker", name: "Windbreaker", price: 180, category: "outerwear", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"], oldPrice: 220 },
  { id: 17, slug: "cargo-shorts", name: "Cargo Shorts", price: 90, category: "pants", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"] },
  { id: 18, slug: "baseball-cap", name: "Baseball Cap", price: 40, category: "accessories", colors: ["#000000", "#D9D9D6"], sizes: ["One size"] },
  { id: 19, slug: "zip-hoodie", name: "Zip Hoodie", price: 140, category: "hoodies", colors: ["#000000", "#D9D9D6"], sizes: ["S","M","L","XL"] },
  { id: 20, slug: "mesh-shorts", name: "Mesh Shorts", price: 65, category: "pants", colors: ["#000000", "#D9D9D6", "#F5F5F3"], sizes: ["S","M","L","XL"], isNew: true },
];

export const categories = [
  { slug: "all", name: "All Products", count: 20 },
  { slug: "hoodies", name: "Hoodies", count: 5 },
  { slug: "t-shirts", name: "T-Shirts", count: 4 },
  { slug: "pants", name: "Pants", count: 4 },
  { slug: "outerwear", name: "Outerwear", count: 2 },
  { slug: "accessories", name: "Accessories", count: 5 },
];

export const colors = [
  { name: "Black", hex: "#000000" },
  { name: "Gray", hex: "#D9D9D6" },
  { name: "Cream", hex: "#F5F5F3" },
  { name: "Brown", hex: "#8B7355" },
  { name: "Green", hex: "#4A5D4E" },
  { name: "Blue", hex: "#3B5B7A" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Olive", hex: "#6B7B5C" },
];

export const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

export function formatPrice(price) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(price);
}

export function getProductBySlug(slug) {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug) {
  if (categorySlug === 'all' || !categorySlug) return products;
  return products.filter(p => p.category === categorySlug);
}

export function getNewArrivals() {
  return products.filter(p => p.isNew);
}

export function getFeaturedProducts(count = 4) {
  return products.slice(0, count);
}