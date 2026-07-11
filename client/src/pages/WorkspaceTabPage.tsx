import { useSearchParams } from 'react-router-dom';

const tabCopy: Record<string, { title: string; description: string }> = {
  settings: { title: 'General Settings', description: 'Workspace preferences and defaults.' },
  team: { title: 'Team', description: 'Invite teammates and manage roles.' },
  usage: { title: 'Usage', description: 'View workspace usage and limits.' },
  billing: { title: 'Billing', description: 'Manage your subscription and invoices.' },
};

export function WorkspaceTabPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'settings';
  const copy = tabCopy[tab] ?? tabCopy.settings;

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-[var(--e-text)]">{copy.title}</h1>
      <p className="text-[var(--e-text-muted)]">{copy.description}</p>
      <p className="webpath-empty-state rounded-lg p-8 text-sm text-[var(--e-text-muted)]">
        Coming soon.
      </p>
    </div>
  );
}
