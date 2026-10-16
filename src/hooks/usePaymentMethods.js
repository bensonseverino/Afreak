import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ME_KEY } from './useCustomer';

export function usePaymentMethods({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['payment-methods'],
    enabled,
    queryFn: async () => (await api('/account/payment-methods')).data,
  });
}

function invalidate(client) {
  client.invalidateQueries({ queryKey: ['payment-methods'] });
  client.invalidateQueries({ queryKey: ['overview'] });
  client.invalidateQueries({ queryKey: ME_KEY });
}

export function usePaymentSetup() {
  return useMutation({
    mutationFn: async () => (await api('/account/payment-methods/setup', { method: 'POST' })).data,
  });
}

export function useCreatePaymentMethod() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (method) =>
      (await api('/account/payment-methods', { method: 'POST', body: method })).data,
    onSuccess: () => invalidate(client),
  });
}

export function useSetDefaultPaymentMethod() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id) =>
      (await api(`/account/payment-methods/${id}/default`, { method: 'POST' })).data,
    onSuccess: () => invalidate(client),
  });
}

export function useDeletePaymentMethod() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api(`/account/payment-methods/${id}`, { method: 'DELETE' })).data,
    onSuccess: () => invalidate(client),
  });
}
