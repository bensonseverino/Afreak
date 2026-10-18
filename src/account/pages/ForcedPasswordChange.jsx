import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AuthShell from '../components/AuthShell';
import AuthNotice from '../components/AuthNotice';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Skeleton from '../../components/ui/Skeleton';
import PasswordField from '../components/PasswordField';
import { ME_KEY, useChangePassword, useLogout, useMe } from '../../hooks/useCustomer';

export default function ForcedPasswordChange() {
  const { data, isPending } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const changePassword = useChangePassword();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  if (isPending) {
    return (
      <AuthShell>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full mt-6" />
      </AuthShell>
    );
  }

  const customer = data?.customer;
  if (!customer) {
    return <Navigate to="/account/login?next=%2Faccount%2Fchange-password" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (changePassword.isPending) return;
    setNotice(null);

    const next = {};
    if (!currentPassword) next.currentPassword = 'Enter your current password.';
    if (newPassword.length < 8) next.newPassword = 'Use at least 8 characters.';
    if (confirm !== newPassword) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ME_KEY });
          navigate('/account', { replace: true });
        },
        onError: (err) => {
          if (err?.status === 400 && err.fields?.currentPassword) {
            setErrors({ currentPassword: err.fields.currentPassword });
          }
          setNotice({ tone: 'danger', title: 'Could not save', body: err?.message || 'Please try again.' });
        },
      }
    );
  };

  return (
    <AuthShell>
      <h1 className="font-display font-extrabold uppercase text-[28px] leading-none text-ink">Set a new password</h1>
      <p className="mt-3 text-[14px] text-graphite leading-relaxed">
        For your security, choose a new password before continuing.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <PasswordField
          id="change-current"
          label="Current (temporary) password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.currentPassword}
          autoComplete="current-password"
          enterKeyHint="next"
          required
        />
        <PasswordField
          id="change-new"
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
          hint="At least 8 characters."
          autoComplete="new-password"
          enterKeyHint="next"
          required
        />
        <PasswordField
          id="change-confirm"
          label="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          enterKeyHint="go"
          required
        />

        {notice && (
          <AuthNotice tone={notice.tone} title={notice.title}>
            {notice.body}
          </AuthNotice>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={changePassword.isPending}
          className="w-full h-14 text-[12px]"
        >
          {changePassword.isPending ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="spinner" size={16} className="animate-spin" /> Saving…
            </span>
          ) : (
            'Save password'
          )}
        </Button>
      </form>

      <div className="mt-6 text-[13px] text-graphite">
        <button
          type="button"
          onClick={() => logout()}
          disabled={loggingOut}
          className="text-ink underline disabled:opacity-50"
        >
          Sign out
        </button>
        <span className="mx-2 text-line">·</span>
        <Link to="/" className="text-ink underline">
          Back to shop
        </Link>
      </div>
    </AuthShell>
  );
}
