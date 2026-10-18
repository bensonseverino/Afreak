# AFREAK — storefront

Custom-print streetwear storefront: shop, product detail, cart, checkout and a
customer account dashboard. Frontend-only — there is no real backend yet, so the
account API is served by an in-browser mock (see [Mock backend](#mock-backend)).

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 + React 19 |
| Styling | Tailwind CSS v4 (design tokens in `src/index.css` under `@theme`) |
| Routing | `react-router-dom` (declarative `BrowserRouter`) |
| Server state | `@tanstack/react-query` |
| Identity | **Clerk** (`@clerk/react`) |
| Account data | In-browser mock over `localStorage`, keyed by Clerk user id |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run lint
```

### Environment

`.env.local` (git-ignored) holds the Clerk keys:

| Variable | Used by |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | the app (Clerk loads its instance with this) |
| `CLERK_SECRET_KEY` | the Clerk CLI / Backend API for local tooling only |

Vite only exposes `VITE_`-prefixed variables to the browser, so the secret key
never reaches the client bundle. Never commit this file, and never ship a
frontend-only build with the secret key set.

`VITE_API_BASE` is optional: leave it unset to use the in-browser mock, or point
it at a Cloudflare Pages/Hono project and `src/lib/api.js` will call the real API
with the same call sites and response shapes.

## Authentication (Clerk)

Clerk is the only identity provider. The original mocked OTP flow (email/SMS
codes, mock sessions, `hash()`-based tokens) has been removed.

* `src/App.jsx` wraps the router in `<ClerkProvider>` with `routerPush` /
  `routerReplace` wired to `useNavigate`, plus `signInUrl="/sign-in"`,
  `signUpUrl="/sign-up"` and `afterSignOutUrl="/"`.
* `src/lib/clerkAppearance.js` maps Clerk's theming onto the AFREAK design tokens
  (square corners, ink/paper, Inter, uppercase buttons) and is passed to
  `ClerkProvider` so every Clerk surface matches the storefront.
* `/sign-in` and `/sign-up` render Clerk's prebuilt components inside the
  storefront's two-panel `AuthShell` (`routing="path"`).
* `src/account/RequireCustomer.jsx` gates `/account/*` on the Clerk session and
  forwards the intended page via `?next=`, so visitors land where they were
  heading after signing in.
* On tablet and up the header carries our own account dropdown
  (`src/components/layout/UserMenu.jsx`) rather than Clerk's popover, so every
  entry lands on a dashboard page: signed in it shows the name and email plus
  **Profile** (`/account/profile`), **Orders**, **Wishlist** and **Sign out**;
  signed out it offers **Sign in** / **Create account**. It closes on Escape
  (focus returns to the trigger), a press outside, focus leaving the control, or
  a route change. Below 768px the same entries live in the hamburger menu
  (signed out it offers **Sign in** and **Create account**).

### Identity → account data

`AccountProvider` (`src/context/AccountContext.jsx`) publishes the signed-in Clerk
user to `src/lib/identity.js` **during render**, before any account query runs, and
clears the react-query cache when the session ends or the user changes. The mock
API's `resolveCustomer()` reads that identity, then finds, provisions or adopts the
matching customer row. `useMe()` (`src/hooks/useCustomer.js`) is gated on
`isLoaded && isSignedIn` and keyed by `userId`.

Accounts are also mirrored server-side. Clerk posts `user.created` /
`user.updated` / `user.deleted` to the backend's `/api/webhooks/clerk`, which
verifies the Svix signature and upserts a row into its `customers` table (the CMS
exposes it read-only at `/admin/customers`). That sync is independent of the mock
account API here, which remains the source of the dashboard's orders, addresses
and wishlist.

Account surfaces that map onto Clerk rather than the mock:

| Surface | Behaviour |
| --- | --- |
| Profile — name | Saved to Clerk (`user.update`) |
| Profile — email / phone | Read from Clerk; edited in Clerk's profile modal |
| Profile — preferences | Stored on the mock customer record |
| Security — sessions | Clerk sessions, with real per-device revocation |
| Security — delete account | `user.delete()`, then the visitor is returned to the shop |

### Demo account

So the dashboard has something to show, the mock seeds a demo account and the
**first Clerk user to sign in adopts it**: six orders (one per status), one saved
address, a Visa •••• 4242, and two wishlist items. Clerk's email, phone and name
overwrite the seeded ones, and every later Clerk user gets a fresh, empty account.

To reset the mock data, clear the `afreak.account.db.v3` key in `localStorage`.

## Navigation

`src/config/nav.js` is the single source of truth for links: the desktop nav,
the mobile/tablet menu and the menu footer all read from it.

**Mobile & tablet menu** (`AFREAK_HAMBURGER_MENU_SPEC.md`) — shown below 1024px,
never rendered at `lg` and up:

* `<768px` full-screen black takeover sliding in from the left; `768–1023px`
  480px left drawer over a scrim.
* Black `bg-ink` panel, numbered oversized Archivo links, hairline dividers,
  `volt` on the active row and on the pressed/hover slice. Square corners,
  no shadows.
* Contents: underline search, SHOP accordion (all products / new arrivals +
  live categories), the primary links, secondary links (wishlist, orders, help,
  sign in / out), a promo tile and a shipping/socials footer.
* Categories come from `GET /categories` through TanStack Query
  (`staleTime` 5 min) and are prefetched on hamburger hover/press/focus and on
  first idle below 1024px — the panel always paints immediately from the static
  fallback in `src/data/products.js`, so there is no skeleton.
* Data comes from `GET /settings/public` (`shipping.threshold_cents`,
  `menu_feature`), also with a built-in fallback.
* Behaviour: Escape, browser Back/Android back gesture (a history entry is
  pushed while open), route change, scrim tap, swipe-left (>60px or fast) and
  the viewport growing to `lg` all close it. Focus moves to the close button and
  returns to the hamburger; the menu and the cart drawer are mutually exclusive.
* Menu links navigate with `replace`, so a tap consumes the history entry the
  menu pushed and the Back button still returns to the page the visitor was on.

`/shop` reads its facets from the query string, which is what the menu,
footer and header links target: `?category=<slug>`, `?new=1`,
`?customizable=1` and `?q=<search>`. All are shareable and combine with the
sidebar filters.

**Z-index ladder** (CSS custom properties in `src/index.css`, keep new overlays
on it): header `40` · sticky bars `45` · menu scrim `60` · menu panel `70` ·
cart drawer `80` · modals/sheets `90` · toasts `100`.

## Mock backend

`src/lib/api.js` dispatches to `src/lib/mockBackend.js` when `VITE_API_BASE` is
unset, mirroring the account API contract (`AFREAK_ACCOUNT_DASHBOARD_SPEC.md` §5)
so the UI is fully functional offline. `upload`/latency are simulated.

Implemented routes: `GET|PATCH /account/me`, `GET /account/overview`,
`GET /account/orders`, `GET /account/orders/:number`,
`POST /account/orders/:number/reorder`, `POST /account/orders/:number/return`,
`GET|PUT|DELETE /account/wishlist[/:productId]`, `GET|POST|DELETE /account/addresses`,
`GET|POST|DELETE /account/payment-methods`, `GET /account/export`,
`DELETE /account`, `POST /orders`, plus the public `GET /categories` and
`GET /settings/public` used by the mobile menu.

### localStorage keys

| Key | Purpose |
| --- | --- |
| `afreak.account.db.v3` | mock account database (customers, orders, addresses, payment methods, wishlist) |
| `afreak.cart.v2` | cart lines |
| `afreak.checkout.form` | non-card checkout fields (session-scoped) |
| `afreak.lastOrder` | order handed from checkout to the success page (session-scoped) |
| `afreak.wishlist.v1` | wishlist for signed-out visitors (merged in on sign-in) |

## Routes

| Path | Area |
| --- | --- |
| `/`, `/shop`, `/shop/:category`, `/product/:slug` | storefront |
| `/lookbook`, `/about`, `/journal`, `/contact` | content |
| `/cart`, `/checkout`, `/checkout/success` | bag and checkout |
| `/sign-in`, `/sign-up` | Clerk auth (own chrome) |
| `/account` (+ `orders`, `payment-methods`, `addresses`, `wishlist`, `profile`, `security`) | account dashboard |
| `/account/orders/:number/invoice` | printable invoice |

`/account/login` is kept as a redirect to `/sign-in` for older links.

## Known gaps

* **Account data is still browser-local.** The backend holds a synced
  `customers` row (identity fields only); orders, addresses, payment methods and
  the wishlist are not served by the API yet.
* **Checkout is client-side only.** It validates the form and hands the order to
  the success page; it does not post to the account API, so guest/signed-in
  checkout is not yet linked to the dashboard's order history.
* No real payment provider — cards are validated, never charged.
* Only a Clerk **development** instance is configured; production keys and a
  deployment are still to do. New-device sign-ins therefore ask for an email code.
* The mobile menu's promo tile is a placeholder — `menu_feature.mediaId` is
  returned by the mock but there is no media library yet.
* The header search icon (`/search`) and the menu's help links (`/size-guide`,
  `/shipping-returns`, `/faq`) have no routes yet and land on the 404 page;
  in-menu product search itself does work (`/shop?q=`).
