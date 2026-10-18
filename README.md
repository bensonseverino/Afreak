# AFREAK — storefront

Custom-print streetwear storefront: shop, product detail, cart, checkout and a
customer account dashboard. Identity (signup, sign-in, sessions, password,
delete account) is served by the AFREAK API in the sibling backend project; the
commerce half of the dashboard (orders, addresses, payment methods, wishlist) is
still an in-browser mock (see [Mock backend](#mock-backend)).

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 + React 19 |
| Styling | Tailwind CSS v4 (design tokens in `src/index.css` under `@theme`) |
| Routing | `react-router-dom` (declarative `BrowserRouter`) |
| Server state | `@tanstack/react-query` |
| Identity | Own AFREAK accounts (email/phone + password) via the backend API |
| Account data | In-browser mock over `localStorage`, keyed by the customer id |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run lint
```

### Environment

`.env.local` (git-ignored) holds the API origin:

| Variable | Used by |
| --- | --- |
| `VITE_API_BASE` | origin of the AFREAK API; empty string = same origin |
| `VITE_TURNSTILE_SITE_KEY` | optional Cloudflare Turnstile key for the public auth forms |

`src/lib/api.js` sends identity calls (`/account/me`, `/account/auth/*`, account
sessions, change-password, delete account) to `VITE_API_BASE` with
`credentials: 'include'`, so the session cookie travels with them. Calls that
belong to the mocked commerce half of the dashboard stay in the browser.

For local development against a local API, `.env.development.local`
(git-ignored) overrides `VITE_API_BASE` with an empty value and `vite.config.js`
proxies `/api` to `http://localhost:8788`, where `wrangler pages dev` serves the
backend. Delete that file to fall back to the value in `.env.local`. Never
commit either file; Vite only exposes `VITE_`-prefixed values to the browser.

## Authentication (AFREAK accounts)

Identity is the storefront's own account system, backed by the AFREAK API. The
previous hosted identity provider and the original mocked OTP flow have both been
removed. A visitor requests an account with an **email address or phone number
plus a password**; the request starts as `pending` and can only sign in once an
admin approves it in the CMS.

| Page | Route | Notes |
| --- | --- | --- |
| Sign in | `/account/login` | email/phone + password, pending/rejected/suspended notices |
| Request account | `/account/sign-up` | email/phone toggle, password + confirmation, optional name |
| Forgot password | `/account/forgot-password` | queues a request for an admin to action |
| Change password | `/account/change-password` | forced screen for admin-set/reset passwords |

* Every auth page keeps the existing two-panel `AuthShell` chrome
  (`src/account/components/`), so the design language is unchanged.
* `src/lib/api.js` sends all identity calls to the real API
  (`GET /account/me`, `/account/auth/*`, `/account/change-password`,
  `/account/sessions`, `DELETE /account`) with `credentials: 'include'`. A
  `403 PASSWORD_CHANGE_REQUIRED` response is turned into a redirect to
  `/account/change-password` through `src/lib/authNav.js`.
* `src/account/RequireCustomer.jsx` gates `/account/*` on `GET /account/me`:
  while the query is pending it shows `AccountSkeleton`, signed out it forwards to
  `/account/login?next=…`, and a customer whose password must change is sent to
  `/account/change-password`.
* `src/hooks/useCustomer.js` owns the session hooks (`useMe`, `useLogout`,
  `useUpdateMe`, `useChangePassword`, `useSessions`, `useRevokeSession`,
  `useRevokeOtherSessions`, `useDeleteAccount`). The `me` query is not retried, so
  a `401` is a normal signed-out state.
* On tablet and up the header carries our own account dropdown
  (`src/components/layout/UserMenu.jsx`): signed in it shows the name and email
  plus **Profile** (`/account/profile`), **Orders**, **Wishlist** and **Sign out**;
  signed out it offers **Sign in** / **Create account**. It closes on Escape
  (focus returns to the trigger), a press outside, focus leaving the control, or a
  route change. Below 768px the same entries live in the hamburger menu.

### Identity → account data

`AccountProvider` (`src/context/AccountContext.jsx`) publishes the customer from
`GET /api/account/me` to `src/lib/identity.js` **during render**, before any
account query runs, so the in-browser mock API's `resolveCustomer()` can find,
provision or adopt the matching customer row race-free.

Identity surfaces hit the real API; the commerce surfaces still come from the
mock:

| Surface | Behaviour |
| --- | --- |
| Profile — name, preferences | `PATCH /api/account/me` |
| Profile — email / phone | Read-only; changing them needs support (they are the sign-in identifier) |
| Security — change password | `POST /api/account/change-password` (revokes other sessions) |
| Security — sessions | Real sessions from `GET /api/account/sessions`, with per-device revocation |
| Security — delete account | `DELETE /api/account`; orders are unlinked, not deleted |
| Overview / orders / addresses / payment methods / wishlist | In-browser mock |

### Demo account

So the dashboard has something to show, the mock seeds a demo account and the
**first customer to sign in adopts it**: six orders (one per status), one saved
address, a Visa •••• 4242, and two wishlist items. The real customer's email,
phone and name overwrite the seeded ones, and every later customer gets a fresh,
empty account.

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

Implemented routes: `GET /account/overview`, `GET /account/orders`,
`GET /account/orders/:number`, `POST /account/orders/:number/reorder`,
`POST /account/orders/:number/return`, `GET|PUT|DELETE /account/wishlist[/:productId]`,
`GET|POST|DELETE /account/addresses`, `GET|POST|DELETE /account/payment-methods`,
`GET /account/export`, `POST /orders`, plus the public `GET /categories` and
`GET /settings/public` used by the mobile menu.

Identity paths are excluded from the mock (`isRealAuthPath` in `src/lib/api.js`):
`GET|PATCH /account/me`, `POST /account/change-password`, `/account/auth/*`,
`/account/sessions[/:id]` and `DELETE /account` always reach the real API, even
when no `VITE_API_BASE` is configured.

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
| `/account/login`, `/account/sign-up`, `/account/forgot-password`, `/account/change-password` | own account auth (own chrome) |
| `/account` (+ `orders`, `payment-methods`, `addresses`, `wishlist`, `profile`, `security`) | account dashboard |
| `/account/orders/:number/invoice` | printable invoice |

`/sign-in` and `/sign-up` redirect to `/account/login` and `/account/sign-up` so
older links keep working.

## Known gaps

* **Commerce account data is still browser-local.** Identity is real
  (`customers`, sessions, passwords live in D1), but orders, addresses, payment
  methods and the wishlist are served by the mock, not the API.
* **Checkout is client-side only.** It validates the form and hands the order to
  the success page; it does not post to the account API, so guest/signed-in
  checkout is not yet linked to the dashboard's order history.
* No real payment provider — cards are validated, never charged.
* **No transactional email/SMS yet.** Forgot-password requests are queued for an
  admin instead of sending a reset link, and there is no email verification.
* The mobile menu's promo tile is a placeholder — `menu_feature.mediaId` is
  returned by the mock but there is no media library yet.
* The header search icon (`/search`) and the menu's help links (`/size-guide`,
  `/shipping-returns`, `/faq`) have no routes yet and land on the 404 page;
  in-menu product search itself does work (`/shop?q=`).
