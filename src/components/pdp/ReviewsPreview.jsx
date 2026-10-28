import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Stars from '../ui/Stars';
import Button from '../ui/Button';
import { api } from '../../lib/api';
import { formatCount } from '../../utils/format';
import { paths } from '../../lib/productPaths';

const EMPTY_FORM = { name: '', email: '', rating: '5', title: '', body: '' };

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * PDP reviews (audit rows 17 & 18).
 *
 * Approved reviews are read from `GET /products/:slug/reviews`; submissions go
 * to `POST /products/:slug/reviews`, which stores them as `pending` for the
 * admin Reviews screen. The section therefore shows live moderated content and
 * never hides the submission path behind a placeholder button.
 */
export default function ReviewsPreview({
  slug,
  rating = 0,
  reviewCount = 0,
  distribution = null,
  className = '',
}) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('ok');

  const reviews = useQuery({
    queryKey: ['reviews', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await api(`/products/${encodeURIComponent(slug)}/reviews?limit=6`);
      return {
        items: Array.isArray(res.data) ? res.data : [],
        meta: res.meta ?? {},
      };
    },
    staleTime: 15 * 1000,
    retry: 1,
  });

  const submit = useMutation({
    mutationFn: (body) =>
      api(`/products/${encodeURIComponent(slug)}/reviews`, { method: 'POST', body }),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setFormOpen(false);
      setFeedbackTone('ok');
      setFeedback("Thanks — your review is pending moderation and will appear once approved.");
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
    },
    onError: (err) => {
      setFeedbackTone('danger');
      setFeedback(err?.message || 'Could not submit your review. Please try again.');
    },
  });

  const rows = [5, 4, 3, 2, 1].map((stars) => {
    const count = Number(distribution?.[stars] ?? distribution?.[String(stars)] ?? 0);
    const pct = reviewCount > 0 && distribution ? Math.round((count / reviewCount) * 100) : 0;
    return { stars, count, pct };
  });

  const submitted = (event) => {
    event.preventDefault();
    setFeedback('');
    submit.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      rating: Number(form.rating),
      title: form.title.trim() || undefined,
      body: form.body.trim(),
    });
  };

  return (
    <section id="reviews" className={`scroll-mt-24 ${className}`} aria-label="Customer reviews">
      <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink mb-6">Reviews</h2>

      <div className="grid gap-8 md:grid-cols-[240px_1fr] mb-10">
        <div>
          <p className="font-display font-extrabold text-[56px] leading-none text-ink">{rating}</p>
          <Stars value={rating} size={16} className="mt-2" />
          <p className="text-[12px] text-graphite mt-2">Based on {formatCount(reviewCount)} reviews</p>
          <Link to={paths.product(slug)} className="text-[12px] text-ink underline mt-3 inline-block">
            View product
          </Link>
        </div>

        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.stars} className="flex items-center gap-3">
              <span className="w-10 text-[12px] text-graphite shrink-0">{row.stars} star</span>
              <span className="flex-1 h-1.5 bg-line">
                <span className="block h-full bg-ink" style={{ width: `${row.pct}%` }} />
              </span>
              <span className="w-10 text-right text-[12px] text-graphite shrink-0">{row.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      {reviews.isError ? (
        <p className="text-[13px] text-graphite mb-6">
          Reviews could not be loaded right now.
        </p>
      ) : reviews.isPending ? (
        <p className="text-[13px] text-graphite mb-6">Loading reviews…</p>
      ) : reviews.data.items.length === 0 ? (
        <p className="text-[13px] text-graphite mb-6">No approved reviews yet — be the first.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3 mb-8">
          {reviews.data.items.map((review) => (
            <li key={review.id} className="border border-line p-5">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="font-sans font-semibold text-[13px] text-ink truncate">
                  {review.author}
                  {review.verified && (
                    <span className="ml-2 text-[10px] uppercase tracking-label text-ok">Verified</span>
                  )}
                </span>
                <span className="text-[12px] text-graphite shrink-0">{formatDate(review.date)}</span>
              </div>
              <Stars value={review.rating} size={13} />
              {review.title && (
                <p className="font-sans font-semibold text-[13px] text-ink mt-3">{review.title}</p>
              )}
              <p className="text-[13px] text-graphite mt-2 leading-relaxed">{review.body}</p>
            </li>
          ))}
        </ul>
      )}

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className={`mb-4 text-[13px] ${feedbackTone === 'danger' ? 'text-danger' : 'text-ok'}`}
        >
          {feedback}
        </p>
      )}

      {!formOpen ? (
        <Button variant="outline" size="md" onClick={() => setFormOpen(true)}>
          Write a review
        </Button>
      ) : (
        <form onSubmit={submitted} className="border border-line p-5 max-w-xl space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[12px] font-medium text-ink">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                autoComplete="name"
                className="mt-1 w-full h-11 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="font-sans text-[12px] font-medium text-ink">Email (not published)</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
                autoComplete="email"
                className="mt-1 w-full h-11 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:border-ink"
              />
            </label>
          </div>

          <label className="block max-w-[180px]">
            <span className="font-sans text-[12px] font-medium text-ink">Rating</span>
            <select
              value={form.rating}
              onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
              className="mt-1 w-full h-11 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:border-ink"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-sans text-[12px] font-medium text-ink">Title (optional)</span>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              maxLength={120}
              className="mt-1 w-full h-11 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="font-sans text-[12px] font-medium text-ink">Review</span>
            <textarea
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              required
              rows={4}
              maxLength={4000}
              className="mt-1 w-full px-3 py-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:border-ink resize-none"
            />
          </label>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="md" disabled={submit.isPending}>
              {submit.isPending ? 'Submitting…' : 'Submit review'}
            </Button>
            <Button type="button" variant="outline" size="md" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
