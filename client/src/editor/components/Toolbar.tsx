import type { ComponentType } from 'react';
import { ChevronLeft, Globe, Monitor, Redo2, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Breakpoint, SitePageSummary } from '../../types/page';
import { ThemeToggle } from '../../components/ThemeToggle';
import { cn } from '../../lib/utils';

interface ToolbarProps {
  pageTitle?: string;
  pages?: SitePageSummary[];
  currentPageId?: string;
  onPageChange?: (pageId: string) => void;
  breakpoint: Breakpoint;
  onBreakpointChange: (bp: Breakpoint) => void;
  onUndo: () => void;
  onRedo: () => void;
  onPublish: () => void;
  saveStatus: 'saved' | 'saving' | 'dirty' | 'error';
  canUndo: boolean;
  canRedo: boolean;
}

const breakpoints: { id: Breakpoint; icon: ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function Toolbar({
  pageTitle,
  pages = [],
  currentPageId,
  onPageChange,
  breakpoint,
  onBreakpointChange,
  onUndo,
  onRedo,
  onPublish,
  saveStatus,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const statusLabel = {
    saved: 'Saved',
    saving: 'Saving…',
    dirty: 'Unsaved',
    error: 'Error',
  }[saveStatus];

  return (
    <div className="flex h-11 items-center justify-between border-b border-[var(--e-border)] bg-[var(--e-surface)] px-3">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-[var(--e-text-muted)] hover:text-[var(--e-text)]">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        {pages.length > 1 && onPageChange ? (
          <select
            value={currentPageId}
            onChange={(e) => onPageChange(e.target.value)}
            className="rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-2 py-1 text-sm text-[var(--e-text)]"
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium text-[var(--e-text)]">{pageTitle ?? 'Untitled'}</span>
        )}
        <span className="text-xs text-[var(--e-text-subtle)]">· {statusLabel}</span>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] p-0.5">
        {breakpoints.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => onBreakpointChange(id)}
            className={cn(
              'flex h-7 w-8 items-center justify-center rounded transition-colors',
              breakpoint === id
                ? 'bg-[var(--e-active)] text-[var(--e-text)]'
                : 'text-[var(--e-text-muted)] hover:text-[var(--e-text)]',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle variant="editor" />
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex h-8 w-8 items-center justify-center rounded text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)] disabled:opacity-30"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex h-8 w-8 items-center justify-center rounded text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)] disabled:opacity-30"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="flex items-center gap-1.5 rounded-md bg-[var(--palette-reversed-grey)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--palette-reversed-grey)]/80"
        >
          <Globe className="h-3.5 w-3.5" />
          Publish
        </button>
      </div>
    </div>
  );
}
