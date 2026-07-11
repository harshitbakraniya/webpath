import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import {
  PAGE_TEMPLATES,
  PageTemplatePreview,
  type PageTemplateId,
  type PageTemplateOption,
} from './pageTemplates';

export type { PageTemplateId } from './pageTemplates';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueSlug(base: string, existing: string[]) {
  const root = slugify(base) || 'page';
  if (!existing.includes(root)) return root;
  let i = 2;
  while (existing.includes(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}

interface AddPageModalProps {
  open: boolean;
  saving: boolean;
  existingSlugs?: string[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    templateId: PageTemplateId;
    title: string;
    slug: string;
    addToNav: boolean;
  }) => void;
}

export function AddPageModal({
  open,
  saving,
  existingSlugs = [],
  onOpenChange,
  onSubmit,
}: AddPageModalProps) {
  const [templateId, setTemplateId] = useState<PageTemplateId>('privacy');

  const selected = useMemo(
    () => PAGE_TEMPLATES.find((t) => t.id === templateId) ?? PAGE_TEMPLATES[0],
    [templateId],
  );

  const businessTemplates = PAGE_TEMPLATES.filter((t) => t.group === 'business');
  const standardTemplates = PAGE_TEMPLATES.filter((t) => t.group === 'standard');

  useEffect(() => {
    if (!open) return;
    setTemplateId('privacy');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const createFromTemplate = (tpl: PageTemplateOption) => {
    if (saving) return;
    onSubmit({
      templateId: tpl.id,
      title: tpl.defaultTitle,
      slug: uniqueSlug(tpl.defaultSlug, existingSlugs),
      addToNav: tpl.addToNavDefault,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close add page"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="relative z-10 flex h-[min(760px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--e-border)] bg-[var(--e-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-page-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--e-border)] px-6 py-5">
          <div>
            <h2 id="add-page-title" className="text-2xl font-semibold tracking-tight text-[var(--e-text)]">
              Add page
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--e-text-muted)]">
              Choose any page and customize it by changing the text, images and more.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--e-text-subtle)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--e-border)] bg-[var(--e-surface)]">
            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              <button
                type="button"
                onClick={() => setTemplateId('blank')}
                onDoubleClick={() => createFromTemplate(PAGE_TEMPLATES[0])}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  templateId === 'blank'
                    ? 'bg-[var(--e-hover)] text-[var(--e-text)]'
                    : 'text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]',
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                New empty page
              </button>

              <div className="my-2 border-t border-[var(--e-border)]" />

              {businessTemplates.map((tpl) => (
                <SidebarItem
                  key={tpl.id}
                  label={tpl.title}
                  active={templateId === tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  onDoubleClick={() => createFromTemplate(tpl)}
                />
              ))}

              <div className="my-2 border-t border-[var(--e-border)]" />

              {standardTemplates.map((tpl) => (
                <SidebarItem
                  key={tpl.id}
                  label={tpl.title}
                  active={templateId === tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  onDoubleClick={() => createFromTemplate(tpl)}
                />
              ))}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col bg-[var(--palette-bright-grey)]">
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[var(--e-border)] bg-[var(--e-surface)] shadow-sm">
                <PageTemplatePreview templateId={templateId} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--e-border)] bg-[var(--e-surface)] px-5 py-4">
              <Button
                type="button"
                disabled={saving}
                onClick={() => createFromTemplate(selected)}
                className="shrink-0"
              >
                {saving ? 'Adding…' : 'Add page'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  active,
  onClick,
  onDoubleClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
        active ? 'bg-[var(--e-hover)] font-medium text-[var(--e-text)]' : 'text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]',
      )}
    >
      {label}
    </button>
  );
}
