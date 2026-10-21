import useCurrency from '../../hooks/useCurrency';
import { relativeTime } from '../../lib/currency';

/**
 * "Rates updated 3 hours ago" / stale fallback note shown under the switcher.
 * The admin card shows the same wording, so shoppers and staff never disagree.
 */
export default function RateNote({ className = '' }) {
  const { loading, updatedAt, stale, failed } = useCurrency();
  const relative = relativeTime(updatedAt);

  const label =
    loading && !updatedAt
      ? 'Checking live rates…'
      : failed && !updatedAt
        ? 'Rates unavailable'
        : !relative || stale
          ? 'Using last known rates'
          : `Rates updated ${relative}`;

  return <p className={className}>{label}</p>;
}
