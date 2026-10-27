/**
 * In-browser mock of the AFREAK account API.
 *
 * Mirrors the contract in `AFREAK_ACCOUNT_DASHBOARD_SPEC.md` (section 5) so the
 * UI can be built and tested without a Cloudflare Worker. Everything is stored
 * in localStorage. Swap `lib/api.js` for a real fetch wrapper when the Hono
 * Pages Functions backend exists — the shapes are identical.
 *
 * Authentication is owned by the real API (HttpOnly session cookie). The mock
 * API never sees a password or a session: `AccountProvider` publishes the
 * signed-in customer from `GET /api/account/me` to `lib/identity.js` before any
 * mock query runs, and `requireCustomer` below resolves (or lazily provisions)
 * the matching customer row from it.
 *
 * Deliberate deviations (documented in README):
 *  - Order numbers/prices are integers, never touching a real payment provider.
 *  - The first signed-in customer adopts the seeded demo account (`seed: true`)
 *    so the dashboard has content to show before a real backend exists.
 */
import { products, categories } from '../data/products';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING, EXPRESS_SHIPPING } from '../utils/shipping';
import { getIdentity } from './identity';

const DB_KEY = 'afreak.account.db.v3';
const RETURN_WINDOW_DAYS = 14;
const DEMO_PAYMENTS = true;

/* ------------------------------------------------------------------ *
 * Small utilities
 * ------------------------------------------------------------------ */
const nowIso = () => new Date().toISOString();
const dayMs = 24 * 60 * 60 * 1000;
const daysFrom = (iso, days) => new Date(new Date(iso).getTime() + days * dayMs).toISOString();
const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cents = (euros) => Math.round(Number(euros || 0) * 100);
const orderNumber = () => `AF-${Math.floor(100000 + Math.random() * 900000)}`;

export function apiError(status, code, message, fields) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  if (fields) err.fields = fields;
  return err;
}

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */
function emptyDb() {
  return {
    customers: [],
    addresses: [],
    paymentMethods: [],
    wishlistItems: [],
    orders: [],
    returnRequests: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    /* fall through to seed */
  }
  const seeded = seed();
  save(seeded);
  return seeded;
}

function save(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable — the mock resets on reload */
  }
}

/* ------------------------------------------------------------------ *
 * Seed data
 * ------------------------------------------------------------------ */
function makeItem(slug, { color, size, qty = 1, print } = {}) {
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  return {
    id: uid('oi'),
    productId: product.id,
    variantId: uid('v'),
    name: product.name,
    slug: product.slug,
    color: color ?? null,
    size: size ?? null,
    qty,
    unitPriceCents: cents(product.price),
    image: product.images?.[0] || null,
    print: print || null,
  };
}

function totalsFor(items, promoCode, deliveryMethod = 'standard') {
  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);
  const discountCents = promoCode === 'AFREAK10' ? Math.round(subtotalCents * 0.1) : 0;
  const netCents = subtotalCents - discountCents;
  let shippingCents = 0;
  if (netCents > 0) {
    if (deliveryMethod === 'express') shippingCents = cents(EXPRESS_SHIPPING);
    else shippingCents = netCents >= cents(FREE_SHIPPING_THRESHOLD) ? 0 : cents(FLAT_SHIPPING);
  }
  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents: 0,
    totalCents: netCents + shippingCents,
    currency: 'EUR',
  };
}

export const STATUS_FLOW = ['pending', 'paid', 'in_production', 'shipped', 'delivered'];
export const STATUS_LABELS = {
  pending: 'PENDING',
  paid: 'PAID',
  in_production: 'IN PRODUCTION',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  refunded: 'REFUNDED',
};

function timelineFor(status, createdAt, trackingNumber) {
  if (status === 'cancelled' || status === 'refunded') {
    return [
      { key: 'pending', label: 'ORDER PLACED', date: createdAt, done: true },
      { key: status, label: STATUS_LABELS[status], date: daysFrom(createdAt, 1), done: true },
    ];
  }
  const upto = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW.map((key, index) => ({
    key,
    label: STATUS_LABELS[key],
    date: index <= upto ? daysFrom(createdAt, index === 0 ? 0 : index * 1.5) : null,
    done: index <= upto,
    current: index === upto,
    note: key === 'shipped' && trackingNumber ? `Tracking ${trackingNumber}` : undefined,
  }));
}

function buildOrder({
  number,
  status,
  createdAt,
  items,
  customerId = null,
  email,
  phone = null,
  promoCode = null,
  trackingNumber = null,
  deliveryMethod = 'standard',
  paymentSummary = null,
  address,
}) {
  const clean = items.filter(Boolean);
  return {
    id: uid('ord'),
    number: number || orderNumber(),
    customerId,
    email,
    phoneE164: phone,
    status,
    paymentStatus: ['pending', 'cancelled'].includes(status) ? 'unpaid' : 'paid',
    deliveryMethod,
    promoCode,
    items: clean,
    totals: totalsFor(clean, promoCode, deliveryMethod),
    shippingAddress: address,
    trackingNumber,
    paymentSummary,
    notes: null,
    createdAt,
    updatedAt: createdAt,
  };
}

const SEED_ADDRESS = {
  id: 'addr_home',
  customerId: 'cus_seed_demo',
  label: 'Home',
  firstName: 'Alex',
  lastName: 'Mwangi',
  phone: '+254712345678',
  line1: '14 Riverside Drive',
  line2: 'Apt 3B',
  city: 'Nairobi',
  region: 'Nairobi',
  postalCode: '00100',
  country: 'Kenya',
  isDefaultShipping: true,
  isDefaultBilling: true,
  createdAt: daysFrom('2026-05-14T09:00:00.000Z', 0),
};

const SEED_PAYMENT = {
  id: 'pm_seed_visa',
  customerId: 'cus_seed_demo',
  provider: 'demo',
  providerPmId: 'pm_demo_4242',
  type: 'card',
  brand: 'Visa',
  last4: '4242',
  expMonth: 8,
  expYear: 2027,
  billingName: 'Alex Mwangi',
  isDefault: true,
  createdAt: daysFrom('2026-05-14T09:10:00.000Z', 0),
};

function seed() {
  const db = emptyDb();
  const alexId = 'cus_seed_demo';
  // The demo row has no identity id yet: the first customer to sign in adopts it
  // (see resolveCustomer) so the dashboard has content before a real backend.
  db.customers.push({
    id: alexId,
    identityId: null,
    seed: true,
    email: 'alex@mail.com',
    phoneE164: '+254712345678',
    emailVerifiedAt: '2026-05-14T09:00:00.000Z',
    phoneVerifiedAt: '2026-05-14T09:00:00.000Z',
    firstName: 'Alex',
    lastName: 'Mwangi',
    marketingOptIn: 1,
    smsOptIn: 0,
    providerCustomerId: null,
    status: 'active',
    createdAt: '2026-05-14T09:00:00.000Z',
    lastLoginAt: daysFrom('2026-10-10T08:00:00.000Z', 0),
  });

  db.addresses.push({ ...SEED_ADDRESS });
  db.paymentMethods.push({ ...SEED_PAYMENT });
  db.wishlistItems.push(
    { customerId: alexId, productId: 2, createdAt: daysFrom('2026-09-01T10:00:00.000Z', 0) },
    { customerId: alexId, productId: 16, createdAt: daysFrom('2026-09-18T11:00:00.000Z', 0) }
  );

  db.orders.push(
    buildOrder({
      number: 'AF-460220',
      status: 'cancelled',
      createdAt: '2026-04-11T12:05:00.000Z',
      customerId: alexId,
      email: 'alex@mail.com',
      phone: '+254712345678',
      items: [makeItem('track-pants', { color: 'Black', size: 'L' })],
      address: SEED_ADDRESS,
      paymentSummary: 'Visa •••• 4242',
    }),
    buildOrder({
      number: 'AF-482913',
      status: 'delivered',
      createdAt: '2026-06-02T10:20:00.000Z',
      customerId: alexId,
      email: 'alex@mail.com',
      phone: '+254712345678',
      promoCode: 'AFREAK10',
      items: [
        makeItem('utility-hoodie', { color: 'Black', size: 'L' }),
        makeItem('beanie', { color: 'Stone', size: 'One size' }),
      ],
      address: SEED_ADDRESS,
      paymentSummary: 'Visa •••• 4242',
    }),
    buildOrder({
      number: 'AF-511204',
      status: 'shipped',
      createdAt: '2026-09-28T14:40:00.000Z',
      customerId: alexId,
      email: 'alex@mail.com',
      phone: '+254712345678',
      trackingNumber: 'AFRK9921KE',
      deliveryMethod: 'express',
      items: [makeItem('windbreaker', { color: 'Navy', size: 'M' })],
      address: SEED_ADDRESS,
      paymentSummary: 'Visa •••• 4242',
    }),
    buildOrder({
      number: 'AF-530877',
      status: 'in_production',
      createdAt: '2026-10-05T09:15:00.000Z',
      customerId: alexId,
      email: 'alex@mail.com',
      phone: '+254712345678',
      items: [
        makeItem('graphic-tee', {
          color: 'Black',
          size: 'M',
          qty: 2,
          print: { placement: 'Front', hasArtwork: true },
        }),
      ],
      address: SEED_ADDRESS,
      paymentSummary: 'Visa •••• 4242',
    }),
    buildOrder({
      number: 'AF-545112',
      status: 'paid',
      createdAt: '2026-10-11T16:02:00.000Z',
      customerId: alexId,
      email: 'alex@mail.com',
      phone: '+254712345678',
      items: [
        makeItem('cargo-pants', { color: 'Olive', size: 'L' }),
        makeItem('tech-cap', { color: 'Black', size: 'One size' }),
      ],
      address: SEED_ADDRESS,
      paymentSummary: 'Visa •••• 4242',
    }),
    buildOrder({
      number: 'AF-552001',
      status: 'pending',
      createdAt: '2026-10-16T08:45:00.000Z',
      customerId: alexId,
      email: 'alex@mail.com',
      phone: '+254712345678',
      items: [makeItem('puffer-vest', { color: 'Black', size: 'M' })],
      address: SEED_ADDRESS,
      paymentSummary: 'Visa •••• 4242',
    }),

    // Guest orders — linked automatically when a matching identifier is verified.
    buildOrder({
      number: 'AF-442190',
      status: 'delivered',
      createdAt: '2026-03-20T11:30:00.000Z',
      email: 'guest@mail.com',
      items: [makeItem('bucket-hat', { color: 'Cream', size: 'One size' })],
      address: { ...SEED_ADDRESS, id: uid('addr'), firstName: 'Guest', lastName: 'Shopper' },
      paymentSummary: 'Mastercard •••• 8210',
    }),
    buildOrder({
      number: 'AF-556777',
      status: 'pending',
      createdAt: '2026-10-15T13:20:00.000Z',
      email: 'guest@mail.com',
      items: [makeItem('socks-pack', { color: 'Black', size: 'One size', qty: 2 })],
      address: { ...SEED_ADDRESS, id: uid('addr'), firstName: 'Guest', lastName: 'Shopper' },
      paymentSummary: 'Mastercard •••• 8210',
    })
  );

  return db;
}

/* ------------------------------------------------------------------ *
 * Customer resolution
 * ------------------------------------------------------------------ */
// Resolve (or lazily provision) the customer row for the signed-in account.
// The first customer adopts the seeded demo account so the dashboard is not
// empty in this frontend-only build; everyone else gets a fresh account.
function resolveCustomer(db) {
  const identity = getIdentity();
  if (!identity || !identity.id) {
    throw apiError(401, 'UNAUTHENTICATED', 'You are not signed in.');
  }

  let customer = db.customers.find((c) => c.identityId === identity.id);
  if (!customer) {
    customer = db.customers.find((c) => c.seed && !c.identityId);
    if (customer) {
      customer.identityId = identity.id;
      customer.seed = false;
    }
  }

  if (!customer) {
    customer = {
      id: identity.id,
      identityId: identity.id,
      seed: false,
      email: null,
      phoneE164: null,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      firstName: null,
      lastName: null,
      marketingOptIn: 0,
      smsOptIn: 0,
      providerCustomerId: null,
      status: 'active',
      createdAt: nowIso(),
      lastLoginAt: nowIso(),
    };
    db.customers.push(customer);
  }

  // The account session is the source of truth for identifiers and name.
  if (identity.email) {
    customer.email = identity.email;
    customer.emailVerifiedAt = customer.emailVerifiedAt || nowIso();
  }
  if (identity.phone) {
    customer.phoneE164 = identity.phone;
    customer.phoneVerifiedAt = customer.phoneVerifiedAt || nowIso();
  }
  if (identity.firstName) customer.firstName = identity.firstName;
  if (identity.lastName) customer.lastName = identity.lastName;
  customer.lastLoginAt = nowIso();

  linkGuestOrders(db, customer);
  save(db);
  return customer;
}

/* ------------------------------------------------------------------ *
 * Presenters
 * ------------------------------------------------------------------ */
function publicCustomer(c) {
  return {
    id: c.id,
    firstName: c.firstName || '',
    lastName: c.lastName || '',
    email: c.email || '',
    phone: c.phoneE164 || '',
    emailVerified: Boolean(c.emailVerifiedAt),
    phoneVerified: Boolean(c.phoneVerifiedAt),
    marketingOptIn: Boolean(c.marketingOptIn),
    smsOptIn: Boolean(c.smsOptIn),
    createdAt: c.createdAt,
  };
}

function publicAddress(a) {
  return { ...a };
}

function publicPaymentMethod(pm) {
  const now = new Date();
  const expired = pm.expYear < now.getFullYear() ||
    (pm.expYear === now.getFullYear() && pm.expMonth < now.getMonth() + 1);
  const expiringSoon = !expired && pm.expYear === now.getFullYear() && pm.expMonth <= now.getMonth() + 3;
  return {
    id: pm.id,
    brand: pm.brand,
    last4: pm.last4,
    expMonth: pm.expMonth,
    expYear: pm.expYear,
    billingName: pm.billingName,
    type: pm.type,
    isDefault: pm.isDefault,
    expired,
    expiringSoon,
  };
}

function orderThumbs(order) {
  return order.items.slice(0, 3).map((i) => i.image || null);
}

function orderSummary(order) {
  return {
    number: order.number,
    createdAt: order.createdAt,
    status: order.status,
    totalCents: order.totals.totalCents,
    currency: order.totals.currency,
    itemCount: order.items.reduce((n, i) => n + i.qty, 0),
    thumbs: orderThumbs(order),
    names: order.items.map((i) => i.name),
    trackingNumber: order.trackingNumber,
  };
}

function returnForOrder(db, order) {
  return db.returnRequests.find((r) => r.number === order.number) || null;
}

function deliveredAt(order) {
  const delivered = timelineFor(order.status, order.createdAt, order.trackingNumber).find(
    (t) => t.key === 'delivered'
  );
  return delivered?.date || null;
}

function canReturn(db, order) {
  if (order.status !== 'delivered') return false;
  const at = deliveredAt(order);
  if (!at) return false;
  if (Date.now() - new Date(at).getTime() > RETURN_WINDOW_DAYS * dayMs) return false;
  return !returnForOrder(db, order);
}

function orderDetail(db, order) {
  const existingReturn = returnForOrder(db, order);
  return {
    number: order.number,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    items: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      color: i.color,
      size: i.size,
      qty: i.qty,
      unitPriceCents: i.unitPriceCents,
      image: i.image,
      print: i.print ? { placement: i.print.placement } : null,
      hasArtwork: Boolean(i.print?.hasArtwork),
    })),
    timeline: timelineFor(order.status, order.createdAt, order.trackingNumber),
    address: order.shippingAddress,
    deliveryMethod: order.deliveryMethod,
    promoCode: order.promoCode,
    totals: order.totals,
    paymentSummary: order.paymentSummary,
    trackingNumber: order.trackingNumber,
    canReturn: canReturn(db, order),
    canReorder: order.status !== 'cancelled' && order.status !== 'refunded',
    returnRequest: existingReturn
      ? { status: existingReturn.status, createdAt: existingReturn.createdAt }
      : null,
  };
}

function wishlistCards(db, customerId) {
  const ids = db.wishlistItems
    .filter((w) => w.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((w) => w.productId);
  return ids
    .map((id) => products.find((p) => String(p.id) === String(id)))
    .filter(Boolean);
}

function linkGuestOrders(db, customer) {
  let linked = 0;
  db.orders.forEach((o) => {
    if (o.customerId) return;
    const matchesEmail = customer.email && o.email && o.email.toLowerCase() === customer.email.toLowerCase();
    const matchesPhone = customer.phoneE164 && o.phoneE164 && o.phoneE164 === customer.phoneE164;
    if (matchesEmail || matchesPhone) {
      o.customerId = customer.id;
      linked += 1;
    }
  });
  return linked;
}

function requireCustomer(db) {
  const customer = resolveCustomer(db);
  if (!customer || customer.status !== 'active') {
    throw apiError(401, 'UNAUTHENTICATED', 'This account is no longer active.');
  }
  return { customer };
}

/* ------------------------------------------------------------------ *
 * Route handlers
 * ------------------------------------------------------------------ */
function countFor(db, customerId) {
  const orders = db.orders.filter((o) => o.customerId === customerId);
  return {
    orders: orders.length,
    activeOrders: orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length,
    wishlist: db.wishlistItems.filter((w) => w.customerId === customerId).length,
    addresses: db.addresses.filter((a) => a.customerId === customerId).length,
    paymentMethods: db.paymentMethods.filter((p) => p.customerId === customerId).length,
  };
}

const handlers = {
  'GET /account/me': (db, _ctx, { customer }) => ({
    customer: publicCustomer(customer),
    counts: countFor(db, customer.id),
  }),

  'PATCH /account/me': (db, { body }, { customer }) => {
    if (body.firstName !== undefined) customer.firstName = String(body.firstName).trim() || null;
    if (body.lastName !== undefined) customer.lastName = String(body.lastName).trim() || null;
    if (body.marketingOptIn !== undefined) customer.marketingOptIn = body.marketingOptIn ? 1 : 0;
    if (body.smsOptIn !== undefined) customer.smsOptIn = body.smsOptIn ? 1 : 0;
    save(db);
    return publicCustomer(customer);
  },

  'GET /account/overview': (db, _ctx, { customer }) => {
    const mine = db.orders
      .filter((o) => o.customerId === customer.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const active = mine.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status));
    const latest = mine[0] ? orderDetail(db, mine[0]) : null;
    const defaultAddress = db.addresses.find((a) => a.customerId === customer.id && a.isDefaultShipping) ||
      db.addresses.find((a) => a.customerId === customer.id) ||
      null;
    const defaultPayment = db.paymentMethods.find((p) => p.customerId === customer.id && p.isDefault) ||
      db.paymentMethods.find((p) => p.customerId === customer.id) ||
      null;
    return {
      latestOrder: latest,
      activeOrders: active.map(orderSummary),
      recentOrders: mine.slice(0, 3).map(orderSummary),
      defaultAddress: defaultAddress ? publicAddress(defaultAddress) : null,
      defaultPaymentMethod: defaultPayment ? publicPaymentMethod(defaultPayment) : null,
      wishlistPreview: wishlistCards(db, customer.id).slice(0, 4),
      counts: countFor(db, customer.id),
    };
  },

  'GET /account/orders': (db, { query }, { customer }) => {
    const status = query.status || 'all';
    const q = String(query.q || '').trim().toLowerCase();
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Number(query.limit) || 10);

    let mine = db.orders
      .filter((o) => o.customerId === customer.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (status === 'active') mine = mine.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status));
    else if (status === 'delivered') mine = mine.filter((o) => o.status === 'delivered');
    else if (status === 'cancelled') mine = mine.filter((o) => ['cancelled', 'refunded'].includes(o.status));

    if (q) mine = mine.filter((o) => o.number.toLowerCase().includes(q));

    const total = mine.length;
    const start = (page - 1) * limit;
    return {
      data: mine.slice(start, start + limit).map(orderSummary),
      meta: { total, page, pages: Math.max(1, Math.ceil(total / limit)), limit },
    };
  },

  'GET /account/orders/:number': (db, { params }, { customer }) => {
    const order = db.orders.find((o) => o.number === params.number && o.customerId === customer.id);
    if (!order) throw apiError(404, 'NOT_FOUND', 'We could not find that order.');
    return orderDetail(db, order);
  },

  'POST /account/orders/:number/reorder': (db, { params }, { customer }) => {
    const order = db.orders.find((o) => o.number === params.number && o.customerId === customer.id);
    if (!order) throw apiError(404, 'NOT_FOUND', 'We could not find that order.');
    const added = [];
    const unavailable = [];
    order.items.forEach((i) => {
      const product = products.find((p) => String(p.id) === String(i.productId));
      const sizeEntry = product?.sizes?.find((s) => s.label === i.size);
      if (!product || (sizeEntry && sizeEntry.stock <= 0)) {
        unavailable.push({ name: i.name, size: i.size });
        return;
      }
      added.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        color: i.color,
        size: i.size,
        qty: i.qty,
        image: product.images?.[0] || null,
        print: { enabled: false, placement: null, fileName: null },
        maxQty: Math.min(sizeEntry?.stock ?? 10, 10),
        kind: 'product',
      });
    });
    return { added, unavailable };
  },

  'POST /account/orders/:number/return': (db, { params, body }, { customer }) => {
    const order = db.orders.find((o) => o.number === params.number && o.customerId === customer.id);
    if (!order) throw apiError(404, 'NOT_FOUND', 'We could not find that order.');
    if (!canReturn(db, order)) {
      throw apiError(409, 'RETURN_NOT_ALLOWED', 'This order is not eligible for a return.');
    }
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      throw apiError(422, 'VALIDATION', 'Select at least one item to return.');
    }
    const request = {
      id: uid('ret'),
      number: order.number,
      customerId: customer.id,
      items,
      reason: body.reason || items[0]?.reason || 'Other',
      note: body.note || '',
      status: 'requested',
      createdAt: nowIso(),
    };
    db.returnRequests.push(request);
    save(db);
    return { id: request.id, status: request.status, createdAt: request.createdAt };
  },

  'GET /account/addresses': (db, _ctx, { customer }) =>
    db.addresses
      .filter((a) => a.customerId === customer.id)
      .sort((a, b) => Number(b.isDefaultShipping) - Number(a.isDefaultShipping)),

  'POST /account/addresses': (db, { body }, { customer }) => {
    const mine = db.addresses.filter((a) => a.customerId === customer.id);
    if (mine.length >= 10) throw apiError(409, 'LIMIT_REACHED', 'You can save up to 10 addresses.');
    const makeDefault = mine.length === 0 || body.isDefaultShipping;
    const address = {
      id: uid('addr'),
      customerId: customer.id,
      label: body.label || null,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      line1: body.line1,
      line2: body.line2 || null,
      city: body.city,
      region: body.region || null,
      postalCode: body.postalCode || null,
      country: body.country,
      isDefaultShipping: Boolean(makeDefault),
      isDefaultBilling: Boolean(makeDefault),
      createdAt: nowIso(),
    };
    if (makeDefault) {
      mine.forEach((a) => {
        a.isDefaultShipping = false;
        a.isDefaultBilling = false;
      });
    }
    db.addresses.push(address);
    save(db);
    return publicAddress(address);
  },

  'PUT /account/addresses/:id': (db, { params, body }, { customer }) => {
    const address = db.addresses.find((a) => a.id === params.id && a.customerId === customer.id);
    if (!address) throw apiError(404, 'NOT_FOUND', 'Address not found.');
    Object.assign(address, {
      label: body.label ?? address.label,
      firstName: body.firstName ?? address.firstName,
      lastName: body.lastName ?? address.lastName,
      phone: body.phone ?? address.phone,
      line1: body.line1 ?? address.line1,
      line2: body.line2 ?? address.line2,
      city: body.city ?? address.city,
      region: body.region ?? address.region,
      postalCode: body.postalCode ?? address.postalCode,
      country: body.country ?? address.country,
    });
    save(db);
    return publicAddress(address);
  },

  'DELETE /account/addresses/:id': (db, { params }, { customer }) => {
    const before = db.addresses.length;
    db.addresses = db.addresses.filter((a) => !(a.id === params.id && a.customerId === customer.id));
    if (db.addresses.length === before) throw apiError(404, 'NOT_FOUND', 'Address not found.');
    save(db);
    return { ok: true };
  },

  'POST /account/addresses/:id/default': (db, { params, query }, { customer }) => {
    const type = query.type === 'billing' ? 'billing' : 'shipping';
    const mine = db.addresses.filter((a) => a.customerId === customer.id);
    const target = mine.find((a) => a.id === params.id);
    if (!target) throw apiError(404, 'NOT_FOUND', 'Address not found.');
    mine.forEach((a) => {
      if (type === 'shipping') a.isDefaultShipping = a.id === target.id;
      else a.isDefaultBilling = a.id === target.id;
    });
    save(db);
    return publicAddress(target);
  },

  'GET /account/payment-methods': (db, _ctx, { customer }) =>
    db.paymentMethods
      .filter((p) => p.customerId === customer.id)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(publicPaymentMethod),

  'POST /account/payment-methods/setup': (_db, _ctx, { customer }) => {
    if (DEMO_PAYMENTS) return { demo: true };
    return { clientSecret: `seti_${customer.id}_placeholder` }; // TODO: Stripe SetupIntent
  },

  'POST /account/payment-methods': (db, { body }, { customer }) => {
    const mine = db.paymentMethods.filter((p) => p.customerId === customer.id);
    if (mine.length >= 5) throw apiError(409, 'LIMIT_REACHED', 'You can save up to 5 payment methods.');
    if (!DEMO_PAYMENTS) {
      // TODO: retrieve brand/last4/expiry from the provider using body.providerPmId.
      throw apiError(501, 'NOT_IMPLEMENTED', 'Live payment methods are not wired yet.');
    }
    if (!/^\d{4}$/.test(String(body.last4 || ''))) {
      throw apiError(422, 'VALIDATION', 'Enter the last 4 digits.', { last4: 'Enter 4 digits.' });
    }
    const makeDefault = mine.length === 0 || body.isDefault;
    if (makeDefault) mine.forEach((p) => { p.isDefault = false; });
    const pm = {
      id: uid('pm'),
      customerId: customer.id,
      provider: 'demo',
      providerPmId: uid('pm_demo'),
      type: 'card',
      brand: body.brand || 'Visa',
      last4: String(body.last4),
      expMonth: Number(body.expMonth),
      expYear: Number(body.expYear),
      billingName: body.billingName || null,
      isDefault: Boolean(makeDefault),
      createdAt: nowIso(),
    };
    db.paymentMethods.push(pm);
    save(db);
    return publicPaymentMethod(pm);
  },

  'POST /account/payment-methods/:id/default': (db, { params }, { customer }) => {
    const mine = db.paymentMethods.filter((p) => p.customerId === customer.id);
    const target = mine.find((p) => p.id === params.id);
    if (!target) throw apiError(404, 'NOT_FOUND', 'Payment method not found.');
    mine.forEach((p) => { p.isDefault = p.id === target.id; });
    save(db);
    return publicPaymentMethod(target);
  },

  'DELETE /account/payment-methods/:id': (db, { params }, { customer }) => {
    const before = db.paymentMethods.length;
    db.paymentMethods = db.paymentMethods.filter(
      (p) => !(p.id === params.id && p.customerId === customer.id)
    );
    if (db.paymentMethods.length === before) throw apiError(404, 'NOT_FOUND', 'Payment method not found.');
    save(db);
    return { ok: true };
  },

  'GET /account/wishlist': (db, _ctx, { customer }) => wishlistCards(db, customer.id),

  'PUT /account/wishlist/:productId': (db, { params }, { customer }) => {
    const productId = Number(params.productId);
    const exists = db.wishlistItems.some(
      (w) => w.customerId === customer.id && String(w.productId) === String(productId)
    );
    if (!exists) {
      db.wishlistItems.push({ customerId: customer.id, productId, createdAt: nowIso() });
      save(db);
    }
    return { ok: true, productId };
  },

  'DELETE /account/wishlist/:productId': (db, { params }, { customer }) => {
    db.wishlistItems = db.wishlistItems.filter(
      (w) => !(w.customerId === customer.id && String(w.productId) === String(params.productId))
    );
    save(db);
    return { ok: true };
  },

  'GET /account/export': (db, _ctx, { customer }) => ({
    customer: publicCustomer(customer),
    addresses: db.addresses.filter((a) => a.customerId === customer.id),
    paymentMethods: db.paymentMethods
      .filter((p) => p.customerId === customer.id)
      .map(publicPaymentMethod),
    orders: db.orders.filter((o) => o.customerId === customer.id).map((o) => orderDetail(db, o)),
    wishlist: wishlistCards(db, customer.id).map((p) => ({ id: p.id, slug: p.slug, name: p.name })),
    exportedAt: nowIso(),
  }),

  // Identity is owned by the real account API (`DELETE /account`); this erases
  // the local record.
  'DELETE /account': (db, _ctx, { customer }) => {
    const id = customer.id;
    db.customers = db.customers.filter((c) => c.id !== id);
    db.addresses = db.addresses.filter((a) => a.customerId !== id);
    db.paymentMethods = db.paymentMethods.filter((p) => p.customerId !== id);
    db.wishlistItems = db.wishlistItems.filter((w) => w.customerId !== id);
    // Orders are kept for accounting but unlinked from the account.
    db.orders.forEach((o) => {
      if (o.customerId === id) o.customerId = null;
    });
    save(db);
    return { ok: true };
  },

  /* ---------------------------------------------------------------- *
   * Public storefront data (menu, footer). No auth required.
   * ---------------------------------------------------------------- */
  // Forms: the mock acknowledges submissions so the UI flow stays testable
  // without a Worker. Real records are written by the Hono API.
  'POST /forms/newsletter': () => ({ subscribed: true }),
  'POST /forms/contact': () => ({ received: true }),
  'POST /forms/notify-me': () => ({ received: true }),
  'POST /forms/custom-print': () => ({ received: true }),
  'POST /uploads/artwork': () => ({ artworkKey: 'artwork/mock/artwork.png' }),

  // Reviews: approved list + pending submission.
  'GET /products/:slug/reviews': () => ({
    data: [],
    meta: { total: 0, page: 1, pages: 1 },
  }),
  'POST /products/:slug/reviews': () => ({ received: true }),

  'GET /categories': () =>
    categories
      .filter((category) => category.slug !== 'all')
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        count: category.count,
      })),

  'GET /settings/public': () => ({
    shipping: {
      threshold_cents: cents(FREE_SHIPPING_THRESHOLD),
      flat_cents: cents(FLAT_SHIPPING),
      express_cents: cents(EXPRESS_SHIPPING),
      free_over_threshold: true,
    },
    menu_feature: {
      eyebrow: 'New collection SS26',
      title: 'Shop the drop',
      url: '/shop?new=1',
      mediaId: null,
    },
  }),

  // Public: the storefront checkout creates orders here so they show up in the
  // account afterwards (guest orders link when a customer's email/phone matches).
  'POST /orders': (db, { body }, { customer }) => {
    const lines = Array.isArray(body.items) ? body.items : [];
    if (lines.length === 0) throw apiError(422, 'VALIDATION', 'Your bag is empty.');
    const items = lines.map((l) => ({
      id: uid('oi'),
      productId: l.productId ?? null,
      variantId: l.variantId ?? null,
      name: l.name,
      slug: l.slug || null,
      color: l.color || null,
      size: l.size || null,
      qty: Number(l.qty) || 1,
      unitPriceCents: l.unitPriceCents ?? cents(l.price),
      image: l.image || null,
      print: l.print?.enabled
        ? { placement: l.print.placement, hasArtwork: true }
        : null,
    }));
    const order = buildOrder({
      status: 'pending',
      createdAt: nowIso(),
      items,
      customerId: customer?.id || null,
      email: body.email,
      phone: body.phone || null,
      promoCode: body.promoCode || null,
      deliveryMethod: body.deliveryMethod || 'standard',
      paymentSummary: body.paymentSummary || null,
      address: body.address || null,
    });
    db.orders.push(order);
    save(db);
    return { number: order.number, totalCents: order.totals.totalCents, email: order.email };
  },
};

/* ------------------------------------------------------------------ *
 * Dispatcher
 * ------------------------------------------------------------------ */
const ROUTES = Object.keys(handlers).map((key) => {
  const [method, pattern] = key.split(' ');
  const paramNames = [];
  const regex = new RegExp(
    '^' +
      pattern.replace(/:([A-Za-z0-9_]+)/g, (_m, name) => {
        paramNames.push(name);
        return '([^/]+)';
      }) +
      '$'
  );
  return { method, regex, paramNames, handler: handlers[key] };
});

function parseQuery(path) {
  const idx = path.indexOf('?');
  if (idx === -1) return [{}, path];
  const query = {};
  new URLSearchParams(path.slice(idx + 1)).forEach((v, k) => {
    query[k] = v;
  });
  return [query, path.slice(0, idx)];
}

export async function handleMockRequest(rawPath, { method = 'GET', body } = {}) {
  await delay(180 + Math.random() * 220);

  const [query, pathname] = parseQuery(rawPath.replace(/^\/api/, ''));

  const db = load();
  const route = ROUTES.find((r) => r.method === method.toUpperCase() && r.regex.test(pathname));

  if (!route) {
    throw apiError(404, 'NOT_FOUND', `No mock route for ${method} ${pathname}`);
  }

  const match = pathname.match(route.regex);
  const params = {};
  route.paramNames.forEach((name, i) => {
    params[name] = decodeURIComponent(match[i + 1]);
  });

  const needsAuth = pathname.startsWith('/account/');
  // Public routes still resolve the customer when signed in, so e.g. a checkout
  // order is attributed to the right account. Signed out they stay anonymous.
  let ctxCustomer = null;
  if (needsAuth || getIdentity()?.id) {
    ctxCustomer = requireCustomer(db).customer;
  }

  const result = route.handler(db, { params, body: body || {}, query }, {
    customer: ctxCustomer,
  });
  // List endpoints return `{ data, meta }` themselves; pass those through so
  // `api()` yields the documented top-level shape. Everything else is wrapped.
  if (result && typeof result === 'object' && !Array.isArray(result) && 'data' in result && 'meta' in result) {
    return result;
  }
  return { data: result };
}

export default handleMockRequest;
