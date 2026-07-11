import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useWorkspaceSites } from '../context/workspace-sites-context';
import { getWorkspaceSlug } from '../lib/workspace';
import { SiteDetailPanel } from '../components/websites/SiteDetailPanel';
import { Button } from '../components/ui/button';

export function WorkspaceDashboardPage() {
  const { user } = useAuth();
  const { sites, loading, refresh } = useWorkspaceSites();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSiteId = searchParams.get('site');
  const selectedSite = sites.find((s) => s.id === activeSiteId);

  useEffect(() => {
    if (!user || loading) return;
    const slug = getWorkspaceSlug(user);
    const next = new URLSearchParams(searchParams);

    if (searchParams.get('workspace') !== slug) {
      next.set('workspace', slug);
    }

    if (!searchParams.get('tab') && sites.length > 0 && !activeSiteId) {
      next.set('site', sites[0].id);
    }

    if (activeSiteId && !sites.find((s) => s.id === activeSiteId) && sites.length > 0) {
      next.set('site', sites[0].id);
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [user, loading, sites, activeSiteId, searchParams, setSearchParams]);

  const handleDelete = async (siteId: string) => {
    await refresh();
    if (!user) return;
    const remaining = sites.filter((s) => s.id !== siteId);
    const next = new URLSearchParams({ workspace: getWorkspaceSlug(user) });
    if (remaining[0]) next.set('site', remaining[0].id);
    setSearchParams(next, { replace: true });
  };

  if (loading) {
    return <div className="text-[var(--e-text-muted)]">Loading workspace...</div>;
  }

  if (!selectedSite) {
    return (
      <div className="webpath-empty-state flex flex-col items-center justify-center rounded-xl p-16 text-center">
        <p className="text-[var(--e-text-muted)]">No site selected. Create a site to get started.</p>
        <Button
          type="button"
          className="mt-4"
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.set('create', '1');
            setSearchParams(next);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New site
        </Button>
      </div>
    );
  }

  return <SiteDetailPanel site={selectedSite} onDelete={(id) => void handleDelete(id)} />;
}
