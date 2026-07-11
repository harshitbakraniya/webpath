import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { WorkspaceSitesProvider } from '../../context/workspace-sites-context';
import { buildDashboardUrl } from '../../lib/workspace';
import Header from './Header';
import { SiteTabsBar } from './SiteTabsBar';
import { DashboardContent } from './DashboardContent';

export function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--e-text-muted)]">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <WorkspaceSitesProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 pt-14 container mx-auto mt-6 gap-6">
          <SiteTabsBar />
          <main className="flex-1 overflow-y-auto p-1">
            <DashboardContent />
          </main>
        </div>
      </div>
    </WorkspaceSitesProvider>
  );
}

export function DashboardProfileRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={buildDashboardUrl(user, { tab: 'profile' })} replace />;
}
