import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { buildDashboardUrl } from '../lib/workspace';

export function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--e-text-muted)]">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={buildDashboardUrl(user)} replace />;
}
