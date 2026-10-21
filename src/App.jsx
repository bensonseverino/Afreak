import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AccountProvider } from './context/AccountContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { UIProvider, useUI } from './context/UIContext';
import { WishlistProvider } from './context/WishlistContext';
import { setAppNavigate } from './lib/authNav';
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
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Account area — lazy so the storefront bundle stays light (spec §9).
const AccountLogin = lazy(() => import('./account/pages/AccountLogin'));
const AccountSignUp = lazy(() => import('./account/pages/AccountSignUp'));
const ForgotPassword = lazy(() => import('./account/pages/ForgotPassword'));
const ForcedPasswordChange = lazy(() => import('./account/pages/ForcedPasswordChange'));
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

// Mobile/tablet menu: its own chunk, mounted only once the hamburger is used (§8).
const MobileMenu = lazy(() => import('./components/layout/MobileMenu'));

// Registers the router's navigation so non-React modules (`lib/api.js`) can
// redirect on a `403 PASSWORD_CHANGE_REQUIRED`.
function RouterBridge() {
  const navigate = useNavigate();
  setAppNavigate(navigate);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
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

/**
 * Overlays that live outside the page tree: the mobile/tablet menu (portal) and
 * the cart drawer. The menu stays unmounted until it is first opened.
 */
function Overlays() {
  const { hasOpenedMenu } = useUI();
  return (
    <>
      {hasOpenedMenu && (
        <Suspense fallback={null}>
          <MobileMenu />
        </Suspense>
      )}
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RouterBridge />
      <CurrencyProvider>
        <AccountProvider>
          <CartProvider>
            <UIProvider>
              <WishlistProvider>
                <ScrollToTop />
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    {/* Checkout uses its own minimal chrome. */}
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Auth: full-screen two-panel design, own chrome (spec §6.1). */}
                    <Route path="/account/login" element={<AccountLogin />} />
                    <Route path="/account/sign-up" element={<AccountSignUp />} />
                    <Route path="/account/forgot-password" element={<ForgotPassword />} />
                    <Route path="/account/change-password" element={<ForcedPasswordChange />} />

                    {/* Redirects for the old auth URLs, so bookmarks keep working. */}
                    <Route path="/sign-in" element={<Navigate to="/account/login" replace />} />
                    <Route path="/sign-up" element={<Navigate to="/account/sign-up" replace />} />

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
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<Terms />} />
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
                <Overlays />
              </WishlistProvider>
            </UIProvider>
          </CartProvider>
        </AccountProvider>
      </CurrencyProvider>
    </BrowserRouter>
  );
}

export default App;
