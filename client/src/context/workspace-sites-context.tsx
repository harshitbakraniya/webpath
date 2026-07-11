import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { listSites } from '../api/pages.api';
import type { SiteDocument } from '../types/page';

type WorkspaceSitesContextValue = {
  sites: SiteDocument[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const WorkspaceSitesContext = createContext<WorkspaceSitesContextValue | undefined>(undefined);

export function WorkspaceSitesProvider({ children }: { children: React.ReactNode }) {
  const [sites, setSites] = useState<SiteDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await listSites();
      setSites(data);
    } catch {
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ sites, loading, refresh }), [sites, loading, refresh]);

  return <WorkspaceSitesContext.Provider value={value}>{children}</WorkspaceSitesContext.Provider>;
}

export function useWorkspaceSites() {
  const ctx = useContext(WorkspaceSitesContext);
  if (!ctx) throw new Error('useWorkspaceSites must be used within WorkspaceSitesProvider');
  return ctx;
}
