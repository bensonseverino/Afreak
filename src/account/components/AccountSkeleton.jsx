import Skeleton from '../../components/ui/Skeleton';

// Loading placeholder for the whole account area while `GET /api/account/me`
// resolves (spec §6.1).
export default function AccountSkeleton() {
  return (
    <div
      className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12"
      aria-busy="true"
      aria-label="Loading your account"
    >
      <Skeleton className="h-24 w-full mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
