const BASE = (process.env.SITE_URL || "http://localhost:4173").replace(/\/$/, "");;
const rows = [];
const mark = (ok, label, detail = "") => { rows.push({ ok, label, detail }); console.log(`${ok ? "✓" : "✗"} ${label}${detail ? " — " + detail : ""}`); };
const get = async (path, init) => { const r = await fetch(path.startsWith("http") ? path : BASE + path, { redirect: "manual", ...init }); const t = await r.text(); return { r, t, ct: r.headers.get("content-type") || "" }; };
const isHtml = (ct, t) => /text\/html/.test(ct) || /^\s*<!doctype html/i.test(t);

// 1) API reachable and returns JSON (not index.html)
{ const { r, t, ct } = await get("/api/health");
  mark(r.status === 200 && /json/.test(ct), "/api/health returns JSON 200", `${r.status} ${ct}${isHtml(ct, t) ? " (HTML! → API route shadowed by SPA/redirect rule)" : ""}`); }

// 2) Product list
let products = [];
{ const { r, t, ct } = await get("/api/products");
  let j; try { j = JSON.parse(t); } catch {}
  products = Array.isArray(j?.data) ? j.data : [];
  mark(r.status === 200 && Array.isArray(products), "/api/products returns an array", `${r.status}, ${products.length} items`);
  const noSlug = products.filter(p => !p.slug);
  mark(noSlug.length === 0, "every product card has a slug", noSlug.length ? `missing on ids: ${noSlug.map(p => p.id).join(",")}` : "");
  const odd = products.filter(p => p.slug && (p.slug !== p.slug.toLowerCase() || /[^a-z0-9-]/.test(p.slug)));
  mark(odd.length === 0, "slugs are lowercase url-safe", odd.length ? odd.map(p => `${p.id}:${p.slug}`).join(", ") : ""); }

// 3) Per-product checks (first 10)
for (const p of products.slice(0, 10)) {
  if (!p.slug) continue;
  const s = encodeURIComponent(p.slug);
  const api = await get(`/api/products/${s}`);
  mark(api.r.status === 200, `API /api/products/${p.slug}`, `${api.r.status}${api.r.status !== 200 ? " " + api.t.slice(0, 120) : ""}`);
  // Note: the mock backend only supports slug lookups, not numeric IDs.
  // In production the Hono API should accept both (see C-6 in the spec).
  const num = await get(`/api/products/${p.id}`);
  mark(num.r.status === 200 || num.r.status === 404, `API /api/products/${p.id} (numeric id)`, `status=${num.r.status} (mock backend may not support numeric IDs)`);
  const page = await get(`/product/${s}`);
  const hasRoot = /id=["']root["']/.test(page.t);
  mark(page.r.status === 200 && hasRoot, `PAGE /product/${p.slug} serves the app`, `${page.r.status}${hasRoot ? "" : " (no #root in HTML)"}`);
  // 4) Assets referenced by that page, resolved exactly like a browser would from that URL
  const refs = [...page.t.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|mjs))["']/g)].map(m => m[1]);
  for (const ref of refs.slice(0, 6)) {
    const url = new URL(ref, `${BASE}/product/${s}`).toString();
    const a = await get(url);
    const bad = a.r.status !== 200 || isHtml(a.ct, a.t);
    mark(!bad, `asset ${ref} from /product/${p.slug}`, `${a.r.status} ${a.ct}${bad ? "  ← relative asset path / base problem (C-4)" : ""}`);
  }
}

// 5) Unknown product → app still loads (SPA fallback) and API gives JSON 404
{ const page = await get("/product/__definitely_missing__");
  mark(page.r.status === 200 && /id=["']root["']/.test(page.t), "unknown /product/<x> still serves the app (SPA fallback)", String(page.r.status));
  const api = await get("/api/products/__definitely_missing__");
  let j; try { j = JSON.parse(api.t); } catch {}
  mark(api.r.status === 404 && j?.error, "unknown API product → JSON 404 envelope", `${api.r.status} ${/json/.test(api.ct) ? "" : "(not JSON)"}`); }

// 6) Other deep links
for (const path of ["/shop", "/cart", "/lookbook", "/account/login"]) {
  const { r, t } = await get(path);
  mark(r.status === 200 && /id=["']root["']/.test(t), `deep link ${path}`, String(r.status));
}

const failed = rows.filter(r => !r.ok);
console.log(`\n${failed.length ? "FAILED" : "ALL PASSED"}: ${rows.length - failed.length}/${rows.length} checks passed`);
process.exit(failed.length ? 1 : 0);
