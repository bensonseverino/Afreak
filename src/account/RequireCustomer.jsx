import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../hooks/useCustomer';
import AccountSkeleton from './components/AccountSkeleton';

/**
 * Gates the account area on the real session (`GET /api/account/me`):
 * loading → skeleton, signed out → `/account/login?next=…`, and a customer who
 * must change their password → `/account/change-password` (spec §6.1).
 */
export default function RequireCustomer({ children }) {
  const { data, isPending } = useMe();
  const location = useLocation();

  if (isPending) return <AccountSkeleton />;

  const customer = data?.customer;
  if (!customer) {
    const current = `${location.pathname}${location.search}`;
    const next = current.startsWith('/') && !current.startsWith('//') ? current : '/account';
    return <Navigate to={`/account/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (customer.mustChangePassword) {
    return <Navigate to="/account/change-password" replace />;
  }

  return children;
}
