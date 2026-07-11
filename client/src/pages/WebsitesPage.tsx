import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useWorkspaceSites } from '../context/workspace-sites-context';
import { WebsiteListItem } from '../components/websites/WebsiteListItem';
import { CreateWebsiteModal } from '../components/websites/CreateWebsiteModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function WebsitesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sites, loading, refresh } = useWorkspaceSites();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (site) => site.name.toLowerCase().includes(q) || site.slug.toLowerCase().includes(q),
    );
  }, [sites, query]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('create');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (loading) return <div className="text-[var(--e-text-muted)]">Loading websites...</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--e-text-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sites..."
              className="pl-9"
            />
          </div>
          <Button type="button" onClick={() => setModalOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            New website
          </Button>
        </div>

        {sites.length === 0 ? (
          <div className="webpath-empty-state rounded-xl p-12 text-center">
            <p className="text-[var(--e-text-muted)]">You don&apos;t have any websites yet.</p>
            <Button type="button" className="mt-4" onClick={() => setModalOpen(true)}>
              Create your first website
            </Button>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="webpath-empty-state rounded-xl p-12 text-center">
            <p className="text-[var(--e-text-muted)]">No sites match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredSites.map((site) => (
              <WebsiteListItem
                key={site.id}
                site={site}
                onDelete={() => void refresh()}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWebsiteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={() => void refresh()}
      />
    </>
  );
}
