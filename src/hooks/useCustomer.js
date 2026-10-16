import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClerk, useSession, useSessionList, useUser } from '@clerk/react';
import { api } from '../lib/api';
import { useAccount } from '../context/AccountContext';

export const ME_KEY = ['me'];

/**
 * `me` resolves to `{ customer, counts }` for the signed-in Clerk user, and is
 * disabled while signed out — being signed out is a valid state, not an error.
 */
export function useMe() {
  const { ready, signedIn, userId } = useAccount();
  return useQuery({
    queryKey: [...ME_KEY, userId || 'anon'],
    enabled: ready && signedIn,
    staleTime: 30 * 1000,
    queryFn: async () => (await api('/account/me')).data,
  });
}

export function useIsSignedIn() {
  const { ready, signedIn, user } = useAccount();
  const query = useMe();
  return {
    signedIn: Boolean(ready && signedIn),
    loading: !ready,
    me: query.data ?? null,
    user,
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

/** Ends the Clerk session and drops cached account data. */
export function useLogout() {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Leave the account area before the session ends: staying put would let the
      // route guard bounce the visitor to the sign-in page instead of the shop.
      navigate('/', { replace: true });
      client.clear();
      await signOut();
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

export function useExportData() {
  return useMutation({
    mutationFn: async () => (await api('/account/export')).data,
  });
}

/* ------------------------------------------------------------------ *
 * Sessions — Clerk is the source of truth for devices.
 * ------------------------------------------------------------------ */
function titleCase(value) {
  const s = String(value || '');
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

// Fallback for the current session, where Clerk does not always expose activity.
function userAgentLabel() {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
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
  return [browser, os].filter(Boolean).join(' on ');
}

function sessionDevice(session, isCurrent) {
  const activity = session?.latestActivity || {};
  const browser = titleCase(activity.browserName);
  const os = titleCase(activity.osName);
  if (browser && os) return `${browser} on ${os}`;
  if (browser || os) return browser || os;
  if (activity.deviceType) return titleCase(activity.deviceType);
  if (isCurrent) return userAgentLabel() || 'This device';
  return 'Unknown device';
}

const toIso = (value) => (value instanceof Date ? value.toISOString() : value || null);

export function useSessions() {
  const { isLoaded, sessions } = useSessionList();
  const { session: current } = useSession();

  const data = useMemo(
    () =>
      (sessions || [])
        .filter((s) => s.status === 'active')
        .map((s) => {
          const isCurrent = s.id === current?.id;
          return {
            id: s.id,
            device: sessionDevice(s, isCurrent),
            createdAt: toIso(s.createdAt),
            lastUsedAt: toIso(s.lastActiveAt) || toIso(s.createdAt),
            current: isCurrent,
          };
        })
        .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt)),
    [sessions, current]
  );

  return { data: isLoaded ? data : undefined, isLoading: !isLoaded };
}

function revoke(session) {
  return session.status === 'active' ? session.revoke() : session.remove();
}

export function useRevokeSession() {
  const { sessions } = useSessionList();
  return useMutation({
    mutationFn: async (id) => {
      const session = (sessions || []).find((s) => s.id === id);
      if (!session) throw new Error('That device is no longer signed in.');
      await revoke(session);
    },
  });
}

export function useRevokeOtherSessions() {
  const { sessions } = useSessionList();
  const { session: current } = useSession();
  return useMutation({
    mutationFn: async () => {
      const others = (sessions || []).filter((s) => s.id !== current?.id);
      await Promise.all(others.map(revoke));
    },
  });
}

/** Deletes the Clerk user and erases the matching local account record. */
export function useDeleteAccount() {
  const { user } = useUser();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You are not signed in.');
      // The local record can only be erased while the session is still valid.
      await api('/account', { method: 'DELETE' });
      await user.delete();
    },
    onSuccess: () => client.clear(),
  });
}
