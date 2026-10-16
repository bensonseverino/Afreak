import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useMe, ME_KEY } from '../hooks/useCustomer';
import { getProductById } from '../data/products';

const LOCAL_KEY = 'afreak.wishlist.v1';
const WishlistContext = createContext(null);

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function persistLocal(ids) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/**
 * Hearts on product cards + PDP. Signed out the list lives in localStorage;
 * on sign-in it is merged into the account, then kept server-side with
 * optimistic updates.
 */
export function WishlistProvider({ children }) {
  const client = useQueryClient();
  const { data: me } = useMe();
  const signedIn = Boolean(me?.customer);

  const [localIds, setLocalIds] = useState(loadLocal);

  const serverQuery = useQuery({
    queryKey: ['wishlist'],
    enabled: signedIn,
    queryFn: async () => (await api('/account/wishlist')).data,
  });

  // Merge guest wishlist into the account once, right after signing in.
  useEffect(() => {
    if (!signedIn || localIds.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        await Promise.all(localIds.map((id) => api(`/account/wishlist/${id}`, { method: 'PUT' })));
      } catch {
        /* ignore merge failures — the list stays local */
      } finally {
        if (!cancelled) {
          setLocalIds([]);
          persistLocal([]);
          client.invalidateQueries({ queryKey: ['wishlist'] });
          client.invalidateQueries({ queryKey: ME_KEY });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, localIds, client]);

  const serverIds = useMemo(
    () => new Set((serverQuery.data || []).map((p) => Number(p.id))),
    [serverQuery.data]
  );
  const ids = signedIn ? serverIds : new Set(localIds);

  // Full product objects for the wishlist page.
  const list = useMemo(
    () => (signedIn ? serverQuery.data || [] : localIds.map(getProductById).filter(Boolean)),
    [signedIn, serverQuery.data, localIds]
  );

  const has = useCallback((id) => ids.has(Number(id)), [ids]);

  const toggle = useCallback(
    (product) => {
      const pid = Number(product?.id);
      if (!Number.isFinite(pid)) return;

      if (signedIn) {
        const wished = serverIds.has(pid);
        client.setQueryData(['wishlist'], (prev = []) =>
          wished ? prev.filter((p) => Number(p.id) !== pid) : [product, ...prev]
        );
        const request = wished
          ? api(`/account/wishlist/${pid}`, { method: 'DELETE' })
          : api(`/account/wishlist/${pid}`, { method: 'PUT' });
        request
          .then(() => client.invalidateQueries({ queryKey: ME_KEY }))
          .catch(() => client.invalidateQueries({ queryKey: ['wishlist'] }));
      } else {
        setLocalIds((prev) => {
          const next = prev.includes(pid) ? prev.filter((x) => x !== pid) : [pid, ...prev];
          persistLocal(next);
          return next;
        });
      }
    },
    [signedIn, serverIds, client]
  );

  const remove = useCallback((id) => toggle({ id }), [toggle]);

  const value = useMemo(
    () => ({
      ids,
      list,
      has,
      toggle,
      remove,
      count: ids.size,
      signedIn,
      loading: signedIn && serverQuery.isLoading,
    }),
    [ids, list, has, toggle, remove, signedIn, serverQuery.isLoading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
