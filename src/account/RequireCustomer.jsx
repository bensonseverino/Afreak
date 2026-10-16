import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import Skeleton from '../components/ui/Skeleton';

// Gates the account area on the Clerk session: skeleton while Clerk loads, then
// a redirect to `/sign-in` that remembers where the visitor was heading.
export default function RequireCustomer({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
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

  if (!isSignedIn) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  return children;
}
