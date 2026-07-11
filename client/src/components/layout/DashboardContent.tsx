import { useSearchParams } from 'react-router-dom';
import { WebsitesPage } from '../../pages/WebsitesPage';
import { WorkspaceTabPage } from '../../pages/WorkspaceTabPage';
import { ProfileSettingsPage } from '../../pages/ProfileSettingsPage';

export function DashboardContent() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'sites';

  if (tab === 'profile') return <ProfileSettingsPage />;
  if (tab === 'sites') return <WebsitesPage />;
  return <WorkspaceTabPage />;
}
