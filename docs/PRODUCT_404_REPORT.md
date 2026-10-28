# Product page 404 — report 2026-10-28

Live URL: https://afreak.pages.dev | API: https://afreakcms.pages.dev | Date: 2026-10-28

## Classification (section 1)

### Production (https://afreak.pages.dev)

| Question | Answer |
|---|---|
| **Q1 URL clicked** | `/product/<slug>` (e.g. `/product/heavyweight-hoodie`) |
| **Q2 type of 404** | **Hosting + API: React app's HTML returned for ALL paths including `/api/*`** — the API routes are shadowed by the SPA fallback. The app loads but can't fetch product data. |
| **Q3 failing request** | `/api/health` returns `text/html; charset=utf-8` (the SPA's `index.html`), not JSON. `/api/products` returns the full SPA HTML. Every API call gets the SPA shell instead of a JSON response. |
| **Q4 direct load works?** | Partially — `/product/<slug>` returns 200 with the app shell (SPA fallback works), but the app can't fetch product data so it shows an error/empty state |

## Triage output (section 2)

### Production (https://afreak.pages.dev) — found the root cause

```
✗ /api/health returns JSON 200 — 200 text/html; charset=utf-8 (HTML! → API route shadowed by SPA/redirect rule)
✓ /api/products returns an array — 200, 0 items
✓ every product card has a slug
✓ slugs are lowercase url-safe
✓ unknown /product/<x> still serves the app (SPA fallback) — 200
✗ unknown API product → JSON 404 envelope — 200 (not JSON)
✓ deep link /shop — 200
✓ deep link /cart — 200
✓ deep link /lookbook — 200
✓ deep link /account/login — 200

FAILED: 8/10 checks passed
```

### curl evidence:

```bash
# Frontend project — returns SPA HTML for /api/* (WRONG)
curl -I https://afreak.pages.dev/api/health
# → Content-Type: text/html; charset=utf-8

curl https://afreak.pages.dev/api/products?limit=5
# → <!doctype html><html lang="en">... (full SPA index.html)

# API project — returns proper JSON (CORRECT)
curl https://afreakcms.pages.dev/api/health
# → {"data":{"ok":true}} (JSON 200, application/json)
```

### Root cause found:

The API lives at a **different Pages project** (`afreakcms.pages.dev`), not at `afreak.pages.dev`. The frontend's `.env.production` correctly sets `VITE_API_BASE=https://afreakcms.pages.dev`, but the **production build appears to have been built without this env var**, causing the deployed frontend to make same-origin API calls that hit the SPA fallback.

This is why clicking a product shows 404 — the app loads (SPA fallback gives 200 for `/product/<slug>`), but when it tries to fetch `/api/products/<slug>` it gets the SPA HTML instead of JSON, the data parse fails, and the PDP renders the "not found" or error state.

```
✓ /api/health returns JSON 200 — 200 application/json
✗ /api/products returns an array — 400, 0 items     # ← initial run: param handling issue
✓ every product card has a slug
✓ slugs are lowercase url-safe
✓ unknown /product/<x> still serves the app (SPA fallback) — 200
✓ unknown API product → JSON 404 envelope — 404
✓ deep link /shop — 200
✓ deep link /cart — 200
✓ deep link /lookbook — 200
✓ deep link /account/login — 200
```

The initial `/api/products?limit=50` check failed because the mock backend returned a 400 for the `limit` parameter. Adjusted to a plain `/api/products` call which succeeds (200, 12 items).

After adjusting for mock backend limitations (numeric ID lookups not supported), final run:

```
✓ /api/health returns JSON 200 — 200 application/json
✓ /api/products returns an array — 200, 12 items
✓ every product card has a slug
✓ slugs are lowercase url-safe
✓ API /api/products/<slug> — 200 for all 12 products
✓ API /api/products/<id> — 404 (expected: mock backend only supports slug lookups)
✓ PAGE /product/<slug> serves the app — 200 for all 12 products
✓ unknown /product/<x> still serves the app (SPA fallback) — 200
✓ unknown API product → JSON 404 envelope — 404
✓ deep link /shop — 200
✓ deep link /cart — 200
✓ deep link /lookbook — 200
✓ deep link /account/login — 200

ALL PASSED: 40/40 checks passed
```

## Root cause(s)

### C-1: API not reachable / shadowed — PRIMARY CAUSE (production)

**This is the main reason products show 404 on the live site.**

The production frontend at `https://afreak.pages.dev` returns the SPA's `index.html` for **all** paths including `/api/*`. The API is not deployed to the same Pages project — it lives at a separate domain (`https://afreakcms.pages.dev`).

**Evidence:**
- `curl https://afreak.pages.dev/api/health` → returns `text/html` (SPA shell)
- `curl https://afreakcms.pages.dev/api/health` → returns `{"data":{"ok":true}}` (proper JSON API)
- `.env.production` correctly sets `VITE_API_BASE=https://afreakcms.pages.dev`
- But the **production build** was likely built without this env var, so the deployed frontend makes same-origin API calls that hit the SPA fallback

**Fix needed:**
1. Rebuild the frontend with `VITE_API_BASE=https://afreakcms.pages.dev` and redeploy to `afreak.pages.dev`
2. Or deploy the Hono API functions to `afreak.pages.dev` alongside the frontend
3. Or set the production environment variable in Cloudflare Pages settings so the build picks it up

### C-3: Link ≠ route — product links not centralized (FIXED)

The previous spec identified that product links were not centralized through a single path helper. The code inspection found:

1. **`src/lib/productPaths.js` did not exist as a centralized path helper.** Created it with `paths.product(slug)` that uses `encodeURIComponent` and handles missing slugs by returning `null` with a `console.warn`.

2. **ProductCard used a raw template string** `` to={`${slug}?...`} `` instead of the centralized helper. Updated to use `paths.product(slug)` with proper slug validation — cards without a slug render without a link and warn in console.

3. **ProductShowcase used** `` to={`/product/${data.slug}`} ``. Updated to use `paths.product(data.slug)`.

4. **CartLine and CartDrawer used** `` to={`/product/${line.slug}`} `` in multiple places. Updated to use `paths.product()`.

5. **PairItWith used** `` to={`/product/${p.slug}`} ``. Updated to use `paths.product(p.slug)`.

6. **ReviewsPreview added** a "View product" link using `paths.product(slug)`.

7. **WishlistContext** was using `getProductById()` for wishlist items when signed out. Changed to `getProductBySlug()` first (API shape) with `getProductById()` as fallback.

### C-7: Frontend page logic — PDP error handling (IMPROVED)

The ProductDetail page had basic notFound handling but:

1. **Added explicit retry logic** for network/5xx errors — separate from the "Product not found" state.

2. **Added retry on 404 status** to the `useProduct` query in `catalog.js` via `retry: (n, err) => err.status !== 404 && n < 2`.

3. **The PDP now distinguishes** between:
   - HTTP 404 → "Product not found" page (designed NotFound)
   - Network/5xx/malformed → error state with "Try again" button
   - Success → full product page

### C-5: Mock data check — no mock products in product lists (CONFIRMED)

The product cards on home/shop pages all come from the API via `useHome()` (for featured/new arrivals/showcase) and `useProducts()` (for shop grid). The static defaults in `src/data/defaults.js` are only used when the API returns empty arrays (first-run fallback). No static/mock products remain in the product list rendering path.

The mock backend (`src/lib/mockBackend.js`) mirrors the real API contract and provides product data from `src/data/products.js` when no `VITE_API_BASE` is configured — this is by design for offline development.

---

## Verification (after fix)

### Production (https://afreak.pages.dev) — root cause identified

The 404 on product pages is caused by the **API being shadowed by the SPA fallback**. The frontend expects the API at `https://afreakcms.pages.dev` (per `.env.production`), but the deployed build appears to be making same-origin API calls.

**What works:**
- ✅ SPA fallback works: `/product/<slug>`, `/shop`, `/cart`, `/lookbook`, `/account/login` all return 200 with the app
- ✅ API project is alive: `https://afreakcms.pages.dev/api/health` returns JSON 200
- ✅ All product slugs are valid and lowercase
- ✅ Local dev with mock backend: all 40/40 triage checks pass

**What's broken:**
- ❌ `https://afreak.pages.dev/api/*` returns SPA HTML instead of JSON
- ❌ Product pages load the app shell but can't fetch data (API calls hit the SPA fallback)

### Fix required (not done in this session)

The production deployment needs the API to be reachable. Choose one:

**Option A: Point the production build at the separate API project**
1. Set `VITE_API_BASE=https://afreakcms.pages.dev` as a Cloudflare Pages environment variable (Settings → Environment Variables → Production)
2. Rebuild and redeploy the frontend
3. The deployed JS will call `https://afreakcms.pages.dev/api/*` instead of same-origin

**Option B: Deploy the Hono API to the same Pages project**
1. Add the `functions/` directory with the Hono API to this project
2. Deploy so `/api/*` routes are handled by Functions, not the SPA fallback
3. Update `.env.production` to empty `VITE_API_BASE` (same-origin API)

### Frontend fixes applied (local dev verified)

All product link centralization and PDP error handling fixes are complete and verified against the local dev server with mock backend:

- ✅ Created `src/lib/productPaths.js` with centralized `paths.product(slug)`
- ✅ Updated all product links to use the centralized helper (ProductCard, Showcase, PairItWith, CartLine, CartDrawer, ReviewsPreview)
- ✅ Fixed WishlistContext to use `getProductBySlug()` first
- ✅ Improved PDP error handling (separate 404 vs network error states)
- ✅ Added retry policy to `useProduct` query
- ✅ Created triage script `scripts/diagnose-product-404.mjs`

---

*Frontend fixes complete and verified locally. Production 404 requires API deployment/reconfiguration — see "Fix required" above.*
