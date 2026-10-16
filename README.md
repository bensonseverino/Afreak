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
* The navbar shows Clerk's `<UserButton>` when signed in (with a "Your account"
  menu link into the dashboard) and a sign-in link when signed out.

### Identity → account data

`AccountProvider` (`src/context/AccountContext.jsx`) publishes the signed-in Clerk
user to `src/lib/identity.js` **during render**, before any account query runs, and
clears the react-query cache when the session ends or the user changes. The mock
API's `resolveCustomer()` reads that identity, then finds, provisions or adopts the
matching customer row. `useMe()` (`src/hooks/useCustomer.js`) is gated on
`isLoaded && isSignedIn` and keyed by `userId`.

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

## Mock backend

`src/lib/api.js` dispatches to `src/lib/mockBackend.js` when `VITE_API_BASE` is
unset, mirroring the account API contract (`AFREAK_ACCOUNT_DASHBOARD_SPEC.md` §5)
so the UI is fully functional offline. `upload`/latency are simulated.

Implemented routes: `GET|PATCH /account/me`, `GET /account/overview`,
`GET /account/orders`, `GET /account/orders/:number`,
`POST /account/orders/:number/reorder`, `POST /account/orders/:number/return`,
`GET|PUT|DELETE /account/wishlist[/:productId]`, `GET|POST|DELETE /account/addresses`,
`GET|POST|DELETE /account/payment-methods`, `GET /account/export`,
`DELETE /account`, `POST /orders`.

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

* **Checkout is client-side only.** It validates the form and hands the order to
  the success page; it does not post to the account API, so guest/signed-in
  checkout is not yet linked to the dashboard's order history.
* No real payment provider — cards are validated, never charged.
* Only a Clerk **development** instance is configured; production keys and a
  deployment are still to do. New-device sign-ins therefore ask for an email code.
