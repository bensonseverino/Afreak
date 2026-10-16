import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';
import SessionRow from '../components/SessionRow';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  useDeleteAccount,
  useExportData,
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from '../../hooks/useCustomer';

export default function Security() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const list = sessions || [];
  const others = list.filter((s) => !s.current);

  const handleExport = () => {
    exportData.mutate(undefined, {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'afreak-data-export.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        flash('Your data is downloading');
      },
      onError: () => flash('Could not export your data'),
    });
  };

  const handleDelete = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        setConfirmOpen(false);
        navigate('/', { replace: true });
      },
      onError: (err) => {
        setConfirmOpen(false);
        flash(err?.message || 'Could not delete your account');
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">Security</h1>

      <div className="border border-line bg-paper p-4 flex items-start gap-3">
        <Icon name="shield" size={18} className="text-graphite shrink-0 mt-0.5" />
        <p className="text-[13px] text-graphite">
          Sign-in, passwords, passkeys and two-factor settings are managed securely by Clerk.
        </p>
      </div>

      {/* Active sessions */}
      <section className="border border-line bg-paper p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Active sessions</h2>
          {others.length > 0 && (
            <button
              type="button"
              onClick={() =>
                revokeOthers.mutate(undefined, {
                  onSuccess: () => flash('Signed out of other devices'),
                  onError: () => flash('Could not sign out other devices'),
                })
              }
              disabled={revokeOthers.isPending}
              className="text-[12px] font-semibold uppercase tracking-label text-ink underline shrink-0"
            >
              Sign out all other devices
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul className="mt-2">
            {list.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                revoking={revoke.isPending && revoke.variables === session.id}
                onRevoke={(s) =>
                  revoke.mutate(s.id, {
                    onSuccess: () => flash('Device signed out'),
                    onError: (err) => flash(err?.message || 'Could not sign out that device'),
                  })
                }
              />
            ))}
          </ul>
        )}
      </section>

      {/* Your data */}
      <section className="border border-line bg-paper p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Your data</h2>
          <p className="text-[13px] text-graphite mt-1">
            Download a JSON copy of your profile, orders, addresses and wishlist.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exportData.isPending}
          className="h-12 px-6 text-[12px] shrink-0"
          leftIcon="download"
        >
          {exportData.isPending ? 'Preparing…' : 'Download my data'}
        </Button>
      </section>

      {/* Danger zone */}
      <section className="border border-danger bg-paper p-4 md:p-5">
        <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-danger flex items-center gap-2">
          <Icon name="alert" size={16} /> Danger zone
        </h2>
        <p className="text-[13px] text-graphite mt-2">
          Deleting your account removes your sign-in, addresses, payment methods and wishlist. Your
          orders are kept for legal and accounting reasons but unlinked from your account.
        </p>
        <Button
          variant="outline"
          onClick={() => setConfirmOpen(true)}
          className="mt-4 h-12 px-6 text-[12px] border-danger text-danger hover:bg-danger hover:text-paper"
        >
          Delete account
        </Button>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete account"
        confirmLabel="Delete account"
        onConfirm={handleDelete}
        loading={deleteAccount.isPending}
      >
        This permanently deletes your account and its saved details. This cannot be undone.
      </ConfirmDialog>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
