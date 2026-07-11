import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { buildDashboardUrl } from '../lib/workspace';

export function DashboardCreateRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={buildDashboardUrl(user, { create: true })} replace />;
}
