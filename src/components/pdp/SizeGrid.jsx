import { useState } from 'react';
import Icon from '../ui/Icon';
import { api } from '../../lib/api';

// Square size grid with sold-out states + "notify me" inline capture.
// Each entry can have: { label, stock, available }
export default function SizeGrid({
  sizes = [],
  selected,
  onSelect,
  className = '',
  disabled = false,
  productId = null,
  color = null,
}) {
  const [notifyFor, setNotifyFor] = useState(null);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const pick = (entry) => {
    if (!entry.available) {
      setNotifyFor(entry.label);
      setDone(false);
      setStatus('idle');
      setError('');
      return;
    }
    if (disabled) return;
    onSelect?.(entry.label);
  };

  const submitNotify = async (event) => {
    event.preventDefault();
    if (status === 'loading') return;
    if (!email.trim()) return;
    if (!productId) {
      setError('This product is unavailable right now.');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      await api('/forms/notify-me', {
        method: 'POST',
        body: {
          email: email.trim(),
          productId,
          color: color || undefined,
          size: notifyFor || undefined,
        },
      });
      setStatus('success');
      setDone(true);
    } catch (err) {
      setStatus('error');
      setError(err?.message || 'Could not save your request. Please try again.');
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Size">
        {sizes.map((entry) => {
          const out = entry.available === false;
          const active = selected === entry.label;
          return (
            <button
              key={entry.label}
              onClick={() => pick(entry)}
              role="radio"
              aria-checked={active}
              aria-disabled={out || disabled}
              aria-label={out ? `${entry.label}, sold out — notify me` : entry.label}
              className={`relative h-12 flex items-center justify-center font-sans font-medium text-[13px] border transition-colors ${
                active
                  ? 'bg-ink text-paper border-ink'
                  : out
                    ? 'text-stone border-line hover:border-ink cursor-pointer'
                    : disabled
                      ? 'text-stone border-line cursor-not-allowed'
                      : 'text-ink border-line hover:border-ink'
              }`}
              type="button"
              disabled={disabled}
            >
              {entry.label}
              {out && (
                <span
                  className="absolute left-2 right-2 top-1/2 h-px bg-stone -rotate-[22deg] pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {notifyFor && (
        <div className="mt-3 border border-line p-3">
          {done ? (
            <p className="text-[12px] text-ok flex items-center gap-2">
              <Icon name="checkCircle" size={16} /> We&apos;ll email you when {notifyFor} is back.
            </p>
          ) : (
            <form onSubmit={submitNotify} className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] text-graphite flex items-center gap-1.5">
                <Icon name="bell" size={14} /> Notify me · {notifyFor}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 min-w-[150px] h-10 px-3 border border-line text-base focus:outline-none focus:border-ink"
                aria-label={`Email for ${notifyFor} restock`}
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-10 px-4 bg-ink text-paper font-semibold uppercase text-[11px] tracking-label hover:bg-graphite disabled:opacity-60"
              >
                {status === 'loading' ? 'Saving…' : 'Notify'}
              </button>
              {error && (
                <p role="alert" className="w-full text-[12px] text-danger">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
