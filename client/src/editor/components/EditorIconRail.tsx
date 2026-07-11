import { FileText, Layers, Plus, Settings, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EditorIconRailProps {
  elementsOpen: boolean;
  onElementsToggle: () => void;
  storeOpen: boolean;
  onStoreToggle: () => void;
  pagesOpen: boolean;
  onPagesToggle: () => void;
  navigatorOpen: boolean;
  onNavigatorToggle: () => void;
}

function RailTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap',
          'rounded-md bg-[var(--e-text)] px-2 py-1 text-[11px] font-medium text-[var(--e-bg)] shadow-md',
          'opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        {label}
        <span
          aria-hidden
          className="absolute right-full top-1/2 -mr-px -translate-y-1/2 border-4 border-transparent border-r-[var(--e-text)]"
        />
      </span>
    </div>
  );
}

export function EditorIconRail({
  elementsOpen,
  onElementsToggle,
  storeOpen,
  onStoreToggle,
  pagesOpen,
  onPagesToggle,
  navigatorOpen,
  onNavigatorToggle,
}: EditorIconRailProps) {
  return (
    <aside className="relative z-30 flex w-14 shrink-0 flex-col items-center border-r border-[var(--e-border)] bg-[var(--e-surface)] py-3">
      <div className="mb-3">
        <RailTooltip label="Add elements">
          <button
            type="button"
            onClick={onElementsToggle}
            aria-label="Add elements"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
              elementsOpen
                ? 'border-[var(--palette-reversed-grey)] bg-[var(--palette-reversed-grey)] text-white'
                : 'border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)] hover:border-[var(--e-accent)] hover:bg-[var(--e-hover)]',
            )}
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </RailTooltip>
      </div>

      <div className="mb-2">
        <RailTooltip label="Store">
          <button
            type="button"
            onClick={onStoreToggle}
            aria-label="Store"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
              storeOpen
                ? 'border-[var(--palette-reversed-grey)] bg-[var(--palette-reversed-grey)] text-white'
                : 'border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)] hover:border-[var(--e-accent)] hover:bg-[var(--e-hover)]',
            )}
          >
            <Store className="h-5 w-5" />
          </button>
        </RailTooltip>
      </div>

      <div className="mb-2">
        <RailTooltip label="Pages">
          <button
            type="button"
            onClick={onPagesToggle}
            aria-label="Pages"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
              pagesOpen
                ? 'border-[var(--palette-reversed-grey)] bg-[var(--palette-reversed-grey)] text-white'
                : 'border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)] hover:border-[var(--e-accent)] hover:bg-[var(--e-hover)]',
            )}
          >
            <FileText className="h-5 w-5" />
          </button>
        </RailTooltip>
      </div>

      <div className="mb-2">
        <RailTooltip label="Navigator">
          <button
            type="button"
            onClick={onNavigatorToggle}
            aria-label="Navigator"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              navigatorOpen
                ? 'bg-[var(--palette-reversed-grey)] text-white'
                : 'text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]',
            )}
          >
            <Layers className="h-5 w-5" />
          </button>
        </RailTooltip>
      </div>

      <div className="mt-auto">
        <RailTooltip label="Settings">
          <button
            type="button"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--e-text-subtle)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text-muted)]"
          >
            <Settings className="h-4 w-4" />
          </button>
        </RailTooltip>
      </div>
    </aside>
  );
}
