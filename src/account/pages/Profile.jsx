import { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Toast from '../../components/ui/Toast';
import { Checkbox } from '../../components/checkout/ContactSection';
import { useMe, useUpdateMe } from '../../hooks/useCustomer';

/**
 * Profile (spec §8.7). Identifiers and the name live with Clerk, the identity
 * provider; marketing preferences live in the account record.
 */
export default function Profile() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { data: me } = useMe();
  const update = useUpdateMe();
  const customer = me?.customer;

  const [form, setForm] = useState({ firstName: '', lastName: '', marketingOptIn: false, smsOptIn: false });
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setForm((prev) => ({
      ...prev,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      marketingOptIn: Boolean(customer.marketingOptIn),
      smsOptIn: Boolean(customer.smsOptIn),
    }));
  }, [customer]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (user) {
        await user.update({ firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      }
      await update.mutateAsync({ marketingOptIn: form.marketingOptIn, smsOptIn: form.smsOptIn });
      flash('Saved');
    } catch (err) {
      flash(err?.errors?.[0]?.longMessage || err?.message || 'Could not save your changes');
    } finally {
      setSaving(false);
    }
  };

  const email = user?.primaryEmailAddress?.emailAddress || '';
  const phone = user?.primaryPhoneNumber?.phoneNumber || '';
  const pending = saving || update.isPending;

  return (
    <div>
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">Profile</h1>

      <form onSubmit={handleSave} className="mt-5 space-y-6 pb-28 md:pb-0">
        <section className="border border-line bg-paper p-4 md:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="profile-first"
              label="First name"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
            />
            <Field
              id="profile-last"
              label="Last name"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </div>
        </section>

        <section className="border border-line bg-paper p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite">Email</p>
              <p className="text-[14px] text-ink mt-1 truncate">{email || 'Not added'}</p>
            </div>
            {email && <Badge variant="default">VERIFIED</Badge>}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-line">
            <div className="min-w-0">
              <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite">Phone</p>
              <p className="text-[14px] text-ink mt-1 truncate">{phone || 'Not added'}</p>
            </div>
            {phone && <Badge variant="default">VERIFIED</Badge>}
          </div>

          <p className="pt-4 border-t border-line text-[12px] text-graphite">
            Email, phone and sign-in security are managed by Clerk.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => openUserProfile()}
            className="h-12 px-6 text-[12px]"
          >
            Manage email &amp; security
          </Button>
        </section>

        <section className="border border-line bg-paper p-4 md:p-5 space-y-4">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Preferences</h2>
          <Checkbox
            id="pref-email"
            checked={form.marketingOptIn}
            onChange={(e) => set('marketingOptIn', e.target.checked)}
          >
            Email me about new drops
          </Checkbox>
          {phone && (
            <Checkbox
              id="pref-sms"
              checked={form.smsOptIn}
              onChange={(e) => set('smsOptIn', e.target.checked)}
            >
              SMS updates
            </Checkbox>
          )}
        </section>

        <div className="hidden md:block">
          <Button variant="primary" type="submit" disabled={pending} className="h-12 px-8 text-[12px]">
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>

        {/* Mobile sticky save */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-paper border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="primary" type="submit" disabled={pending} className="w-full h-12 text-[12px]">
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
