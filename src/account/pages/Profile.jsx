import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Toast from '../../components/ui/Toast';
import { Checkbox } from '../../components/checkout/ContactSection';
import { useMe, useUpdateMe } from '../../hooks/useCustomer';

/**
 * Profile (spec §6.7): the customer can edit their name and marketing
 * preference. Email and phone are read-only — an admin changes them, so we
 * point the customer at the contact form instead.
 */
export default function Profile() {
  const { data: me } = useMe();
  const update = useUpdateMe();
  const customer = me?.customer;

  const [form, setForm] = useState({ firstName: '', lastName: '', marketingOptIn: false });
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      marketingOptIn: Boolean(customer.marketingOptIn),
    });
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
      await update.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        marketingOptIn: form.marketingOptIn,
      });
      flash('Saved');
    } catch (err) {
      flash(err?.message || 'Could not save your changes');
    } finally {
      setSaving(false);
    }
  };

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
              enterKeyHint="next"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
            />
            <Field
              id="profile-last"
              label="Last name"
              autoComplete="family-name"
              enterKeyHint="next"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </div>
        </section>

        <section className="border border-line bg-paper p-4 md:p-5 space-y-4">
          <div>
            <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite">Email</p>
            <p className="text-[14px] text-ink mt-1 break-words">{customer?.email || 'Not added'}</p>
          </div>

          <div className="pt-4 border-t border-line">
            <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite">Phone</p>
            <p className="text-[14px] text-ink mt-1 break-words">{customer?.phone || 'Not added'}</p>
          </div>

          <p className="pt-4 border-t border-line text-[12px] text-graphite">
            To change your email or phone number,{' '}
            <Link to="/contact?subject=account" className="text-ink underline">
              contact us
            </Link>
            .
          </p>
        </section>

        <section className="border border-line bg-paper p-4 md:p-5 space-y-4">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Preferences</h2>
          <Checkbox
            id="pref-marketing"
            checked={form.marketingOptIn}
            onChange={(e) => set('marketingOptIn', e.target.checked)}
          >
            Email/SMS me about new drops
          </Checkbox>
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
