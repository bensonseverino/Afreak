# CMS Connection Report — <date>

Environment: <prod-domain>, commit <commit-sha>, D1 id hash <D1-id-hash>, content_version <content-version>

## Issue 1 — hero & lookbook: root causes

- The homepage used to render its own hard-coded hero slides and lookbook tiles. That broke link ④ in the spec's connection chain (frontend never read the live API data for those modules), so edited CMS content could never reach the homepage.
- The current storefront code no longer owns that content path. Hero and homepage lookbook are rendered from `GET /api/home → heroSlides / lookbook` (via `useHome()` and the mappers in `src/lib/catalog.js`). Static defaults remain only in `src/data/defaults.js` and are used only when the API returns an empty set; API errors render an explicit error state instead of pretending copy is live.
- Evidence from this workspace:
  - `src/components/home/Hero.jsx` imports `useHome` and `DEFAULT_HERO_SLIDES`, renders `cmsSlides ?? DEFAULT_HERO_SLIDES`, and shows `ContentUnavailable` on error.
  - `src/components/home/Lookbook.jsx` imports `useHome` and `DEFAULT_LOOKBOOK`, renders `cmsItems ?? DEFAULT_LOOKBOOK`, and shows `ContentUnavailable` on error.
  - `src/lib/catalog.js` mappers (`mapHeroSlide`, `mapLookbookItem`, `mapImage`) shape the API response into the component contract and make media URLs absolute via `assetUrl()`.
  - `src/data/defaults.js` is the only hard-coded hero/lookbook source left; the module doc explicitly says it is first-run-only fallback, with `FALLBACK CONTENT:` visibility in dev and on `?debug=1`.
- What is still needed to close Issue 1 on the live site (evidence not in this workspace):
  - Check ② (D1): confirm the live remote DB has active `hero_slides` and `lookbook_items` rows with non-NULL `media_id` joined to real `media` rows.
  - Check ③ (public API): confirm `curl -s "<live-domain>/api/home?_=<ts>"` returns `heroSlides` with real `image.url` and `lookbook` with real items.
  - Check ⑤ (rendering): confirm those `image.url` values return HTTP 200 when loaded directly.
- If any of those three fail, the break is not in the frontend code in this workspace; it is at the API/DB/media layer and needs live-domain evidence before a fix is chosen.

## Issue 2 — product page 404: root causes

- Observed (from the reported symptom, not from a live network capture in this workspace): clicking a product showed a 404 instead of the product page.
- Code that governs the product page in this workspace:
  - Route is `/product/:slug` → lazy `<ProductDetail />`, mounted inside public `<Layout>` in `src/App.jsx`. That satisfies P-11 (route placement) for a single-page app built and served by Cloudflare Pages with the right `_redirects`/`_routes.json`.
  - `ProductDetail` reads `const { slug } = useParams()` and calls `useProduct(slug)`. It renders a success page when `product` loaded, a "Product not found" path when `notFound`, and a generic error path otherwise. This is the correct kind of per-state handling the spec wants, but it still depends on the API returning the right shape and status.
  - `useProduct(slug)` in `src/lib/catalog.js` calls `fetchProductDetail(slug)`, which hits `/products/${encodeURIComponent(slug)}` and expects `res.data` to map to the storefront product shape.
- Three strings to record for one product in the live-domain report (P-1 diagnostic step 3) — not available in this workspace without the live API:
  - Slug in D1: `SELECT id,slug,status FROM products` (whichever row links from a normal card).
  - URL the card links to: the actual `to` on a product card / showcase / pair-with / cart / order item.
  - Path the API request used: the exact outgoing request URL and HTTP status from the network tab.
- Likely causes to rule out on the live site:
  - P-1: SPA fallback missing on direct load/refresh (Pages returns 404 for `/product/<slug>` when the app is not running client-side). In this workspace that is a hosting/deploy artifact, not a code bug, so the fix belongs in `public/_redirects`, `public/_routes.json`, and the build output, plus redeploy.
  - P-2/P-3: any card or link that uses a full `<a href>` reload or a URL that does not match `/product/:slug`. The spec wants a single `paths.product(slug)` used everywhere; this workspace does not yet have that path helper in the frontend source inspected here.
  - P-4: the detail query may be too strict (INNER JOIN to variants/images/categories), so a published product with no variants/images/category returns no row. Spec wants the base query on `products` only, with separate fetches or LEFT JOINs.
  - P-5: list vs detail status logic differ, so a draft or differently-flagged product links from a stale or cached page.
  - P-6: slug problems — NULL/empty, duplicate, uppercase, unsafe characters, trailing slash. Frontend here encodes with `encodeURIComponent`, but a working slug round-trip still depends on DB hygiene + case-insensitive lookup.
  - P-7: any product list still drawn from static/mock data instead of the API. In this workspace, the card shape and list queries should be checked against mock sources — the grep in the spec (`data/products`, `mock`, `const slides=`, `const looks=`) is the right follow-up.
  - P-8: API route ordering or param handling: if the server registers `/products/:slugOrId` incorrectly, or shadows it with an earlier route, or expects an id when the frontend sends a slug, the request can 404 at the API layer.
  - P-9: frontend maps every failure to a product-not-found/NotFound-style page instead of distinguishing 404 vs error. This workspace has a `notFound` branch, so the remaining risk is whether `useProduct` correctly detects a true 404 vs a network/5xx failure.
- What is still needed to close Issue 2 (evidence not in this workspace):
  - Reproduce the 404 with DevTools open and record (a) document request or API request, (b) exact status, (c) the three strings above.
  - Compare list and detail query logic on the server.
  - Confirm the server detail route exists, is reachable, returns the agreed JSON shape, and returns a real 404 JSON envelope only when the product truly does not exist.

## Module audit

| # | Module | ① Admin | ② DB | ③ API | ④ Frontend | ⑤ Render | Fix applied |
|---|--------|---------|------|-------|------------|----------|-------------|
| 1 | Hero slides | Not verified in this workspace | Not verified in this workspace | `src/lib/catalog.js` `mapHeroSlide` + `useHome` reads `home.heroSlides` | `src/components/home/Hero.jsx` renders API slides; defaults only when API empty; error state on failure | `src/components/ui/CmsImage` + `assetUrl()` make media URLs absolute; priority on first slide | In this workspace: removed the old hard-coded-only hero path; homepage now reads `GET /home`. Live-side checks still required. |
| 2 | Lookbook | Not verified in this workspace | Not verified in this workspace | `src/lib/catalog.js` `mapLookbookItem` + `useHome` reads `home.lookbook`; `useLookbook()` reads `GET /lookbook` | Homepage strip renders first 4 from `home.lookbook`; `/lookbook` page renders full set | Same image mapping as hero | In this workspace: homepage lookbook now reads `GET /home`. Live-side checks still required. |
| 3 | Promo bar | Not verified in this workspace | Not verified in this workspace | `useHome` reads `home.promoBar`; `useSettings` reads `settings.promoBar` | `PromoBar` reads from CMS-backed data path | Hide when inactive/empty per code shape | In this workspace: promo bar reads from the CMS-backed public data hook. Live-side checks still required. |
| 4 | Shipping banner | Not verified in this workspace | Not verified in this workspace | `useHome` reads `home.shippingBanner`; `useSettings` reads shipping rules including threshold | `ShippingBanner` renders title/subtitle/CTA; free-shipping threshold can fill subtitle when CMS subtitle is empty | Image-free section; threshold displayed via `Price` | In this workspace: shipping banner reads CMS-backed data and ties into the settings/shipping threshold path. Live-side checks still required. |
| 5 | Shipping rules | Not verified in this workspace | Not verified in this workspace | `useSettings` reads `settings.shipping.thresholdCents/flatCents/expressCents` | Shipping banner + cart/checkout shipping paths consume the threshold/rates | Threshold text updates where the banner uses it | In this workspace: the storefront hook exposes shipping threshold/rates from public settings. Live-side checks still required. |
| 6 | Showcase product | Not verified in this workspace | Not verified in this workspace | `useHome` reads `home.showcase`; `mapShowcase` maps the card + CMS description/features | `ProductShowcase` renders the chosen product; hides when null; VIEW PRODUCT uses the product slug path | Image from CMS card; features from CMS data | In this workspace: showcase reads `GET /home`. Live-side checks still required. |
| 7 | Featured / New flags | Not verified in this workspace | Not verified in this workspace | `useHome` reads `home.featured` and `home.newArrivals` | `FeaturedProducts`, `NewArrivals` render from API data; cards link by slug path | Cards should use `paths.product(slug)` once that helper exists | In this workspace: featured/new arrivals read from `GET /home`. Live-side checks still required; product-link centralization still required. |
| 8 | Menu feature tile | Not verified in this workspace | Not verified in this workspace | `useSettings` + `useHome` feed `menuFeature`; image mapped via `mapMenuFeature` | Mobile/tablet menu feature tile uses CMS text/link/image | Image mapped through `mapImage` | In this workspace: menu feature tile reads CMS-backed data with image mapping. Live-side checks still required. |
| 9 | Footer & social | Not verified in this workspace | Not verified in this workspace | `useHome` reads `home.footer`; `useSettings` reads store/social | `Footer` renders blurb + social, hides empty fields | Social links hidden when empty per code shape | In this workspace: footer reads CMS-backed data. Live-side checks still required. |
| 10 | Categories | Not verified in this workspace | Not verified in this workspace | `GET /api/categories` expected; frontend category hooks expected | Desktop nav, hamburger SHOP list, shop filters, other-categories cards expected | Category image handling expected | In this workspace: category-driven UI exists; live API wiring should be confirmed against the spec. |
| 11 | Products + product page | See Issue 2 above | See Issue 2 above | `useProducts` + `useProduct(slug)` call `/products` and `/products/:slug` | Cards, shop grid, PDP, wishlist, cart, order items expected to use product slugs | PDP has success / not-found / error branches | In this workspace: route and PDP state handling exist; live API + slug hygiene + card-link centralization still need confirmation. |
| 12 | Product images | Not verified in this workspace | Not verified in this workspace | Expected in product detail response; mapped through `detailToProduct` | PDP gallery, cards, color-linked images expected | `CmsImage` / `assetUrl` used | In this workspace: image mapping exists on the storefront side. Live-side checks still required. |
| 13 | Variants & stock | Not verified in this workspace | Not verified in this workspace | Expected in product detail response; mapped through `detailToProduct` | Size/color selectors, sold-out styling, notify-me expected | `useProductVariants` + PDP components expected | In this workspace: variant/color/size selection logic exists in storefront. Live-side checks still required. |
| 14 | Features / highlights | Not verified in this workspace | Not verified in this workspace | Expected in product detail response; `features` mapped | PDP highlights + showcase icons expected | Icons/text from CMS fields expected | In this workspace: features are mapped for showcase and PDP. Live-side checks still required. |
| 15 | Related / pair-with / accessories | Not verified in this workspace | Not verified in this workspace | Expected in product detail response (`pairWith`, `accessories`, `related`) | Pair-it-with, accessory card, related grid expected | Links should open correct product page | In this workspace: pair-with/accessories/related are mapped in `detailToProduct`. Live-side checks still required. |
| 16 | SEO fields | Present in `ProductDetail` via `useDocumentMeta` | Not verified in this workspace | Expected `seo.title` / `seo.description` in product response | `ProductDetail` applies title + meta description from product data | Title/meta updated from API data | In this workspace: `src/hooks/useDocumentMeta.js` applies CMS SEO fields and restores them on unmount. Live-side checks still required. |
| 17 | Reviews moderation | Not verified in this workspace | Not verified in this workspace | Expected `/api/products/:slug/reviews` + product response fields | PDP stars / counts / list expected | Approve/reject expected to affect visibility | In this workspace: PDP has a reviews preview component. Live-side checks still required. |
| 18 | Review submission | Not verified in this workspace | Not verified in this workspace | Expected `POST /api/products/:slug/reviews` | PDP review form expected | Pending submission expected to appear in admin | In this workspace: the storefront form path should be confirmed against the spec. Live-side checks still required. |
| 19 | Contact form | Not verified in this workspace | Not verified in this workspace | Expected `POST /api/forms/contact` | Contact page expected | Submission expected in admin inbox | In this workspace: contact UI exists; live form endpoint should be confirmed. |
| 20 | Newsletter | Not verified in this workspace | Not verified in this workspace | Expected `POST /api/forms/newsletter` | Footer / menu newsletter signup expected | Subscription expected in admin subscribers | In this workspace: newsletter form component exists. Live-side checks still required. |
| 21 | Notify-me | Not verified in this workspace | Not verified in this workspace | Expected `POST /api/forms/notify-me` | PDP size grid notify-me expected | Submission expected in admin inbox | In this workspace: notify-me path should be confirmed against the spec. Live-side checks still required. |
| 22 | Custom print | Not verified in this workspace | Not verified in this workspace | Expected `POST /api/uploads/artwork` + `/api/forms/custom-print` | PDP custom-print modal + custom-print page expected | File downloadable in admin; never public | In this workspace: `CustomPrintModal` exists and was edited in this session. Live-side checks still required. |
| 23 | Promo codes | Not verified in this workspace | Not verified in this workspace | Expected `/api/promo/validate` + quote/orders | Cart & checkout expected | Create/disable/expire expected in admin | In this workspace: promo code validation path should be confirmed. Live-side checks still required. |
| 24 | Orders | Not verified in this workspace | Not verified in this workspace | Expected `POST /api/orders` | Checkout → success flow expected | Order appears in admin; stock decremented; order item links open product pages | In this workspace: order success page exists. Live-side checks still required. |
| 25 | Customers / approvals | Not verified in this workspace | Not verified in this workspace | Expected `/api/account/*` | Sign-up / sign-in / account flow expected | Sign-up → PENDING → approve → can sign in expected | In this workspace: account pages exist. Live-side checks still required. |
| 26 | Later CMS-managed content | Not applicable yet | Not applicable yet | Not applicable yet | Not applicable yet | Apply this same chain before marking done | Pending — any later CMS content must pass the ①–⑤ chain. |
| 27 | Site settings | Not verified in this workspace | Not verified in this workspace | `useSettings` reads `settings.store` (name, email, social) | Header/footer, formatting expected | Changes reflected where store settings are used | In this workspace: settings hook exposes store fields. Live-side checks still required. |
| 28 | Metrics | Not applicable in this workspace | Not applicable in this workspace | Expected `/api/track` | Event tracking expected | Events increment on the server | In this workspace: analytics/tracking hook exists. Live-side checks still required. |
| 29 | Deep links / client routes | Not applicable in this workspace | Not applicable in this workspace | Not applicable in this workspace | Route table in `App.jsx`; client-side routing | Direct load + refresh returns the app on Pages | In this workspace: route table and lazy-loaded pages exist. Hosting-level SPA fallback still required for direct-load 404s. |

## Product link audit

| Product id | Name | Slug | Status | API 200? | Page 200? | Notes |
|---|---|---|---|---|---|---|
| <product-id> | <name> | <slug> | <status> | <pending live evidence> | <pending live evidence> | Record (a) D1 slug, (b) card URL, (c) API path used for one real product. To be filled from the live site/network capture. |

## Deep-link audit

| Route | Direct load | Refresh | Notes |
|---|---|---|---|
| `/` | <pending live evidence> | <pending live evidence> | SPA fallback must return the app on Pages direct loads. |
| `/shop` | <pending live evidence> | <pending live evidence> | Same hosting check. |
| `/shop/<category>` | <pending live evidence> | <pending live evidence> | Same hosting check. |
| `/product/<slug>` | <pending live evidence> | <pending live evidence> | This is the reported failure path. Needs the doc-request vs API-request classification. |
| `/cart` | <pending live evidence> | <pending live evidence> | Same hosting check. |
| `/checkout` | <pending live evidence> | <pending live evidence> | Same hosting check. |
| `/lookbook` | <pending live evidence> | <pending live evidence> | Same hosting check. |
| `/account/login` | <pending live evidence> | <pending live evidence> | Same hosting check. |
| `/admin` | <pending live evidence> | <pending live evidence> | Same hosting check. |

## Still open / needs your decision

- This workspace is a frontend-only React storefront (Vite + TanStack Query + React Router). The server/backend artifacts the spec references (Hono Pages Functions, D1, R2, `wrangler`, `server/`, `functions/`, `scripts/`, `shared/`, `docs/CMS_CONNECTION_REPORT.md`) are not present here, so I could not run the live checks (D1 remote queries, `curl` the live API, `/media/` image loads, direct-load deep-link checks). Those checks need the live domain and the backend project.
- I can still do the frontend-side deliverables that live entirely in this storefront:
  - Create a single `src/lib/paths.js` with `paths.product(slug)` and use `<Link>` everywhere a product is linked, replacing hand-rolled URLs and any `<a href>` used for internal navigation.
  - Remove any remaining static/mock product data from product lists and PDP-adjacent components, so cards cannot link to slugs the API does not serve (P-7).
  - Confirm `useProduct` correctly separates true 404 from network/5xx so the PDP shows the designed Not Found page only on a real 404.
  - Add/tighten the PDP SKU/variant ready state so a published product with no variants/images/category still renders the page with an unavailable notice rather than a 404.
  - Confirm the product title/meta/SEO plumbing uses `useDocumentMeta` consistently across dynamic pages.
- The part that cannot be finished from this workspace alone:
  - Confirming the live `GET /home` returns real hero/lookbook rows with live media.
  - Confirming the live `GET /api/products/:slug` returns 200 for every published product and a real 404 only for missing/draft products.
  - Confirming Pages hosting serves `/product/:slug` and the other client routes as the app on direct load/refresh (P-1).
- Decision point: do you want me to (a) finish the frontend-only deliverables above and write the report as a frontend-grounded audit with the live checks left as explicit open items, or (b) stop here and surface the exact live evidence you need to collect before any further fix is chosen?
