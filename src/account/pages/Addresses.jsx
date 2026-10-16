import { useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';
import AddressCard from '../components/AddressCard';
import AddressForm from '../components/AddressForm';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '../../hooks/useAddresses';

const MAX = 10;

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [editing, setEditing] = useState(null); // null | {} (new) | address
  const [toRemove, setToRemove] = useState(null);
  const [toast, setToast] = useState('');

  const list = addresses || [];
  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = (values) => {
    const isEdit = Boolean(editing?.id);
    const mutation = isEdit ? update : create;
    const payload = isEdit ? { id: editing.id, ...values } : values;
    mutation.mutate(payload, {
      onSuccess: () => {
        setEditing(null);
        flash(isEdit ? 'Address updated' : 'Address added');
      },
      onError: (err) => flash(err?.message || 'Could not save that address'),
    });
  };

  const handleRemove = () => {
    if (!toRemove) return;
    remove.mutate(toRemove.id, {
      onSuccess: () => {
        setToRemove(null);
        flash('Address removed');
      },
      onError: () => {
        setToRemove(null);
        flash('Could not remove that address');
      },
    });
  };

  const handleDefault = (address) => {
    setDefault.mutate(
      { id: address.id, type: 'shipping' },
      {
        onSuccess: () => flash('Default address updated'),
        onError: () => flash('Could not update the default'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">Addresses</h1>

      {list.length < MAX && (
        <Button
          variant="primary"
          onClick={() => setEditing({})}
          className="w-full sm:w-auto h-12 px-6 mt-5 text-[12px]"
          leftIcon="plus"
        >
          Add address
        </Button>
      )}

      <div className="mt-5">
        {list.length === 0 ? (
          <EmptyState
            icon="pin"
            title="No saved addresses"
            action={
              <Button variant="primary" onClick={() => setEditing({})} className="h-12 px-6 text-[12px]">
                Add address
              </Button>
            }
          >
            Save an address to check out faster next time.
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={setEditing}
                onRemove={setToRemove}
                onSetDefault={handleDefault}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit address' : 'Add address'}
        size="lg"
      >
        <AddressForm
          initial={editing?.id ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          loading={create.isPending || update.isPending}
          submitLabel={editing?.id ? 'Save changes' : 'Add address'}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        title="Remove address"
        confirmLabel="Remove"
        onConfirm={handleRemove}
        loading={remove.isPending}
      >
        Remove the {toRemove?.label || 'selected'} address? This cannot be undone.
      </ConfirmDialog>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
