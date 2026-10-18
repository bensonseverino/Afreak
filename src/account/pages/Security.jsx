import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';
import PasswordField from '../components/PasswordField';
import SessionRow from '../components/SessionRow';
import {
  useChangePassword,
  useDeleteAccount,
  useExportData,
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from '../../hooks/useCustomer';

function PasswordForm({ onMessage }) {
  const changePassword = useChangePassword();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (changePassword.isPending) return;

    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Enter your current password.';
    if (form.newPassword.length < 8) next.newPassword = 'Use at least 8 characters.';
    if (form.confirm !== form.newPassword) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    changePassword.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setForm({ currentPassword: '', newPassword: '', confirm: '' });
          onMessage('Password updated');
        },
        onError: (err) => {
          if (err?.status === 400 && err.fields) setErrors(err.fields);
          onMessage(err?.message || 'Could not update your password');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
      <PasswordField
        id="security-current"
        label="Current password"
        value={form.currentPassword}
        onChange={(e) => set('currentPassword', e.target.value)}
        error={errors.currentPassword}
        autoComplete="current-password"
        enterKeyHint="next"
        required
      />
      <PasswordField
        id="security-new"
        label="New password"
        value={form.newPassword}
        onChange={(e) => set('newPassword', e.target.value)}
        error={errors.newPassword}
        hint="At least 8 characters."
        autoComplete="new-password"
        enterKeyHint="next"
        required
      />
      <PasswordField
        id="security-confirm"
        label="Confirm new password"
        value={form.confirm}
        onChange={(e) => set('confirm', e.target.value)}
        error={errors.confirm}
        autoComplete="new-password"
        enterKeyHint="go"
        required
      />
      <Button variant="primary" type="submit" disabled={changePassword.isPending} className="h-12 px-6 text-[12px]">
        {changePassword.isPending ? 'Saving…' : 'Change password'}
      </Button>
    </form>
  );
}

export default function Security() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

  const [toast, setToast] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

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
    if (!deletePassword) {
      setDeleteError('Enter your password.');
      return;
    }
    setDeleteError('');
    deleteAccount.mutate(deletePassword, {
      onSuccess: () => {
        setDeleteOpen(false);
        navigate('/', { replace: true });
      },
      onError: (err) => setDeleteError(err?.message || 'Could not delete your account'),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">Security</h1>

      {/* Password */}
      <section className="border border-line bg-paper p-4 md:p-5">
        <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Password</h2>
        <p className="text-[13px] text-graphite mt-1">
          Choose a new password. You&apos;ll stay signed in on this device.
        </p>
        <PasswordForm onMessage={flash} />
      </section>

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
        ) : list.length === 0 ? (
          <p className="mt-3 text-[13px] text-graphite">No other devices are signed in.</p>
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
          type="button"
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
          onClick={() => {
            setDeletePassword('');
            setDeleteError('');
            setDeleteOpen(true);
          }}
          className="mt-4 h-12 px-6 text-[12px] border-danger text-danger hover:bg-danger hover:text-paper"
          type="button"
        >
          Delete account
        </Button>
      </section>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account" size="sm">
        <div className="text-[14px] text-graphite leading-relaxed">
          This permanently deletes your account and its saved details. This cannot be undone. Enter
          your password to confirm.
        </div>
        <div className="mt-4">
          <PasswordField
            id="delete-password"
            label="Password"
            value={deletePassword}
            onChange={(e) => {
              setDeletePassword(e.target.value);
              setDeleteError('');
            }}
            error={deleteError}
            autoComplete="current-password"
            enterKeyHint="go"
          />
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(false)}
            className="flex-1 h-12 text-[12px]"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={deleteAccount.isPending}
            className="flex-1 h-12 text-[12px] bg-danger border-danger hover:bg-danger/90 hover:border-danger/90"
            type="button"
          >
            {deleteAccount.isPending ? 'Deleting…' : 'Delete account'}
          </Button>
        </div>
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
