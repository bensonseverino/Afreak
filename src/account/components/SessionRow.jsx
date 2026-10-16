import Badge from '../../components/ui/Badge';
import { formatRelative } from '../../utils/format';

// Active device row (spec §8.8).
export default function SessionRow({ session, onRevoke, revoking = false }) {
  return (
    <li className="flex items-center justify-between gap-3 py-4 border-b border-line last:border-b-0">
      <div className="min-w-0">
        <p className="font-sans font-semibold text-[14px] text-ink flex items-center gap-2">
          {session.device}
          {session.current && <Badge variant="default">THIS DEVICE</Badge>}
        </p>
        <p className="text-[12px] text-graphite mt-0.5">Last active {formatRelative(session.lastUsedAt)}</p>
      </div>
      {!session.current && (
        <button
          type="button"
          onClick={() => onRevoke?.(session)}
          disabled={revoking}
          className="text-[12px] font-semibold uppercase tracking-label text-graphite underline underline-offset-2 hover:text-danger disabled:opacity-50 shrink-0"
        >
          Sign out
        </button>
      )}
    </li>
  );
}
