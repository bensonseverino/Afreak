import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ME_KEY } from './useCustomer';

function qs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.set(k, v);
  });
  const str = search.toString();
  return str ? `?${str}` : '';
}

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => (await api('/account/overview')).data,
  });
}

export function useOrders(params = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await api(`/account/orders${qs(params)}`);
      return { data: res.data, meta: res.meta };
    },
    placeholderData: (previous) => previous,
  });
}

export function useOrder(number) {
  return useQuery({
    queryKey: ['order', number],
    enabled: Boolean(number),
    queryFn: async () => (await api(`/account/orders/${encodeURIComponent(number)}`)).data,
  });
}

export function useReorder() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (number) =>
      (await api(`/account/orders/${encodeURIComponent(number)}/reorder`, { method: 'POST' })).data,
    onSuccess: () => client.invalidateQueries({ queryKey: ME_KEY }),
  });
}

export function useRequestReturn() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ number, items, reason, note }) =>
      (await api(`/account/orders/${encodeURIComponent(number)}/return`, {
        method: 'POST',
        body: { items, reason, note },
      })).data,
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ['order', variables.number] });
      client.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
