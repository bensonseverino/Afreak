import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ME_KEY } from './useCustomer';

export function useAddresses({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['addresses'],
    enabled,
    queryFn: async () => (await api('/account/addresses')).data,
  });
}

function invalidate(client) {
  client.invalidateQueries({ queryKey: ['addresses'] });
  client.invalidateQueries({ queryKey: ['overview'] });
  client.invalidateQueries({ queryKey: ME_KEY });
}

export function useCreateAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (address) => (await api('/account/addresses', { method: 'POST', body: address })).data,
    onSuccess: () => invalidate(client),
  });
}

export function useUpdateAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...address }) =>
      (await api(`/account/addresses/${id}`, { method: 'PUT', body: address })).data,
    onSuccess: () => invalidate(client),
  });
}

export function useDeleteAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api(`/account/addresses/${id}`, { method: 'DELETE' })).data,
    onSuccess: () => invalidate(client),
  });
}

export function useSetDefaultAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type = 'shipping' }) =>
      (await api(`/account/addresses/${id}/default?type=${type}`, { method: 'POST' })).data,
    onSuccess: () => invalidate(client),
  });
}
