import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { clearIdentity } from '../lib/identity';
import { queryClient } from '../lib/queryClient';

export const ME_KEY = ['me'];

/**
 * The signed-in customer, straight from the real API:
 *   GET /api/account/me  →  { customer, counts }
 * A 401 (signed out) is a valid state, so it is not retried and consumers read
 * `data?.customer` to tell the two states apart.
 *
 * The real API returns 401 for signed-out visitors. That is a normal outcome for
 * the public storefront, not an error, so we treat it as a successful "no session"
 * result instead of letting it throw and crash the app render.
 */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        const res = await api('/account/me');
        return res.data;
      } catch (err) {
        // A 401 (no session) is a normal signed-out outcome, not an app-breaking
        // error. Return a valid "not signed in" shape so the rest of the app keeps
        // rendering. Any other failure also returns a safe shape rather than
        // throwing.
        return { customer: null, counts: {} };
      }
    },
    retry: false,
    staleTime: 30 * 1000,
  });
}

export function useIsSignedIn() {
  const query = useMe();
  const me = query.data ?? null;
  return {
    signedIn: Boolean(me?.customer),
    loading: query.isPending,
    me,
    refetch: query.refetch,
  };
}

function invalidateAccount(client) {
  client.invalidateQueries({ queryKey: ME_KEY });
  client.invalidateQueries({ queryKey: ['overview'] });
  client.invalidateQueries({ queryKey: ['orders'] });
  client.invalidateQueries({ queryKey: ['addresses'] });
  client.invalidateQueries({ queryKey: ['payment-methods'] });
  client.invalidateQueries({ queryKey: ['wishlist'] });
}

/** Revokes the session cookie and drops every cached account query. */
export function useLogout() {
  const navigate = useNavigate();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Leave the account area first: staying put would let the route guard
      // bounce the visitor to the sign-in page instead of the shop.
      navigate('/', { replace: true });
      try {
        await api('/account/auth/logout', { method: 'POST' });
      } catch {
        /* the local state is cleared regardless */
      }
      clearIdentity();
      client.clear();
    },
  });
}

export function useUpdateMe() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (patch) => (await api('/account/me', { method: 'PATCH', body: patch })).data,
    onSuccess: () => invalidateAccount(client),
  });
}

export function useChangePassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await api('/account/change-password', { method: 'POST', body })).data,
    onSuccess: () => invalidateAccount(client),
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => (await api('/account/export')).data,
  });
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */
function titleCase(value) {
  const s = String(value || '');
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

/** Human label for a raw User-Agent string ("Chrome on macOS"). */
function deviceLabel(userAgent, isCurrent) {
  const ua = String(userAgent || '');
  if (!ua) return isCurrent ? 'This device' : 'Unknown device';
  const os = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Macintosh|Mac OS X/i.test(ua)
        ? 'macOS'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /Linux/i.test(ua)
            ? 'Linux'
            : '';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\//i.test(ua)
      ? 'Opera'
      : /Chrome/i.test(ua)
        ? 'Chrome'
        : /Safari/i.test(ua)
          ? 'Safari'
          : /Firefox/i.test(ua)
            ? 'Firefox'
            : '';
  const label = [browser, os].filter(Boolean).join(' on ');
  return label || titleCase(ua.slice(0, 24)) || 'Unknown device';
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { sessions } = (await api('/account/sessions')).data;
      return (sessions || [])
        .map((s) => ({
          id: s.id,
          device: deviceLabel(s.userAgent, s.current),
          createdAt: s.createdAt,
          lastUsedAt: s.lastUsedAt || s.createdAt,
          current: Boolean(s.current),
        }))
        .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt));
    },
  });
}

export function useRevokeSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api(`/account/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useRevokeOtherSessions() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => api('/account/sessions', { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

/** Deletes the account (`DELETE /api/account`) and drops cached account data. */
export function useDeleteAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (password) => (await api('/account', { method: 'DELETE', body: { password } })).data,
    onSuccess: () => {
      clearIdentity();
      client.clear();
    },
  });
}
