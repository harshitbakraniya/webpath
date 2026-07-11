import { ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { getWorkspaceName } from '../../lib/workspace';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

export function WorkspaceSwitcher() {
  const { user } = useAuth();
  if (!user) return null;

  const workspaceName = getWorkspaceName(user);
  const initial = workspaceName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex w-full items-center gap-3 rounded-lg border border-[var(--e-border)] bg-[var(--e-surface)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--e-hover)]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--palette-shy-blunt)] text-sm font-semibold text-[var(--palette-jet-black)] dark:bg-[var(--palette-smoked-pearl)] dark:text-[var(--palette-bright-grey)]">
            {initial}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--e-text)] dark:text-[var(--pallete-grey)]">{workspaceName}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--e-text-subtle)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="font-medium">{workspaceName}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
