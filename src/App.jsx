import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react';
import { clerkAppearance } from './lib/clerkAppearance';
import { AccountProvider } from './context/AccountContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/layout/Layout';
import CartDrawer from './components/cart/CartDrawer';
import Home from './pages/Home';

const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Lookbook = lazy(() => import('./pages/Lookbook'));
const About = lazy(() => import('./pages/About'));
const Journal = lazy(() => import('./pages/Journal'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Account area — lazy so the storefront bundle stays light (spec §9).
const SignIn = lazy(() => import('./account/pages/SignIn'));
const SignUp = lazy(() => import('./account/pages/SignUp'));
const AccountLayout = lazy(() => import('./account/AccountLayout'));
const RequireCustomer = lazy(() => import('./account/RequireCustomer'));
const AccountOverview = lazy(() => import('./account/pages/AccountOverview'));
const OrdersList = lazy(() => import('./account/pages/OrdersList'));
const OrderDetail = lazy(() => import('./account/pages/OrderDetail'));
const Invoice = lazy(() => import('./account/pages/Invoice'));
const PaymentMethods = lazy(() => import('./account/pages/PaymentMethods'));
const Addresses = lazy(() => import('./account/pages/Addresses'));
const Wishlist = lazy(() => import('./account/pages/Wishlist'));
const Profile = lazy(() => import('./account/pages/Profile'));
const Security = lazy(() => import('./account/pages/Security'));

// Clerk needs the router so its internal navigation stays client-side.
function ClerkWithRouter({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Legacy link target: `/account/login?next=…` → `/sign-in?next=…`.
function LegacyLoginRedirect() {
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next');
  const search = next ? `?next=${encodeURIComponent(next)}` : '';
  return <Navigate to={`/sign-in${search}`} replace />;
}

function RouteFallback() {
  return (
    <div className="max-w-wide mx-auto px-6 py-16" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-1/3 bg-card mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[5/6] bg-card" />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
        <AccountProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Checkout uses its own minimal chrome. */}
                  <Route path="/checkout" element={<Checkout />} />

                  {/* Auth: Clerk-hosted, full-screen two-panel design, own chrome. */}
                  <Route path="/sign-in/*" element={<SignIn />} />
                  <Route path="/sign-up/*" element={<SignUp />} />
                  <Route path="/account/login" element={<LegacyLoginRedirect />} />

                  {/* Print-friendly invoice: standalone so the printout has no nav/footer. */}
                  <Route
                    path="/account/orders/:number/invoice"
                    element={
                      <RequireCustomer>
                        <Invoice />
                      </RequireCustomer>
                    }
                  />

                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:category" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/lookbook" element={<Lookbook />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout/success" element={<OrderSuccess />} />

                    <Route
                      path="/account"
                      element={
                        <RequireCustomer>
                          <AccountLayout />
                        </RequireCustomer>
                      }
                    >
                      <Route index element={<AccountOverview />} />
                      <Route path="orders" element={<OrdersList />} />
                      <Route path="orders/:number" element={<OrderDetail />} />
                      <Route path="payment-methods" element={<PaymentMethods />} />
                      <Route path="addresses" element={<Addresses />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="security" element={<Security />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AccountProvider>
      </ClerkWithRouter>
    </BrowserRouter>
  );
}

export default App;
