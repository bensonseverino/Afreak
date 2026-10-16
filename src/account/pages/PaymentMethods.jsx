import { useState } from 'react';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';
import PaymentMethodCard from '../components/PaymentMethodCard';
import AddPaymentModal from '../components/AddPaymentModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useSetDefaultPaymentMethod,
} from '../../hooks/usePaymentMethods';

const MAX = 5;

export default function PaymentMethods() {
  const { data: methods, isLoading } = usePaymentMethods();
  const create = useCreatePaymentMethod();
  const setDefault = useSetDefaultPaymentMethod();
  const remove = useDeletePaymentMethod();

  const [addOpen, setAddOpen] = useState(false);
  const [toRemove, setToRemove] = useState(null);
  const [toast, setToast] = useState('');

  const list = methods || [];

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAdd = (values) => {
    create.mutate(values, {
      onSuccess: () => {
        setAddOpen(false);
        flash('Payment method saved');
      },
      onError: (err) => flash(err?.message || 'Could not save that method'),
    });
  };

  const handleDefault = (method) => {
    setDefault.mutate(method.id, {
      onSuccess: () => flash('Default payment method updated'),
      onError: () => flash('Could not update the default'),
    });
  };

  const handleRemove = () => {
    if (!toRemove) return;
    remove.mutate(toRemove.id, {
      onSuccess: () => {
        setToRemove(null);
        flash('Payment method removed');
      },
      onError: () => {
        setToRemove(null);
        flash('Could not remove that method');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">
        Payment methods
      </h1>

      <div className="mt-4 border border-line bg-paper p-4 flex items-start gap-3">
        <Icon name="lock" size={18} className="text-graphite shrink-0 mt-0.5" />
        <p className="text-[12px] text-graphite leading-relaxed">
          Your payment details are tokenised and stored securely by our payment provider. Afreak never
          stores your full card number.
        </p>
      </div>

      {list.length < MAX && (
        <Button
          variant="primary"
          onClick={() => setAddOpen(true)}
          className="w-full sm:w-auto h-12 px-6 mt-5 text-[12px]"
          leftIcon="plus"
        >
          Add payment method
        </Button>
      )}

      <div className="mt-5 space-y-3">
        {list.length === 0 ? (
          <EmptyState
            icon="creditCard"
            title="No saved payment methods"
            action={
              <Button variant="primary" onClick={() => setAddOpen(true)} className="h-12 px-6 text-[12px]">
                Add payment method
              </Button>
            }
          >
            Save a card for faster checkout. It&apos;s tokenised — we never see the number.
          </EmptyState>
        ) : (
          list.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={handleDefault}
              onRemove={setToRemove}
            />
          ))
        )}
      </div>

      {list.length > 0 && (
        <p className="mt-5 text-[12px] text-graphite border border-line p-4">
          PayPal, Apple Pay and mobile money are coming soon.
        </p>
      )}

      <AddPaymentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        loading={create.isPending}
      />

      <ConfirmDialog
        open={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        title="Remove payment method"
        confirmLabel="Remove"
        onConfirm={handleRemove}
        loading={remove.isPending}
      >
        Remove {toRemove?.brand} •••• {toRemove?.last4}? You can add it again later.
      </ConfirmDialog>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
