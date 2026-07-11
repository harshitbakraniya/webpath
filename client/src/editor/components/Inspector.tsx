import { useEffect, useRef, useState } from 'react';
import { findElement } from '../utils/tree';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { Breakpoint, LinkType, PageElement, SitePageSummary } from '../../types/page';
import { StylePanel } from './inspector/StylePanel';

interface InspectorProps {
  root: PageElement[];
  selectedId: string | null;
  breakpoint: Breakpoint;
  sitePages?: SitePageSummary[];
  onUpdateElement: (id: string, patch: Partial<PageElement>, options?: { recordHistory?: boolean }) => void;
  onUpdateStyle: (id: string, breakpoint: Breakpoint, patch: Record<string, string>, options?: { recordHistory?: boolean }) => void;
  onRemove: (id: string) => void;
}

function useDebouncedCallback<T extends (...args: never[]) => void>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => clearTimeout(timer.current), []);

  return (...args: Parameters<T>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delay);
  };
}

export function Inspector({
  root,
  selectedId,
  breakpoint,
  sitePages = [],
  onUpdateElement,
  onUpdateStyle,
  onRemove,
}: InspectorProps) {
  const element = selectedId ? findElement(root, selectedId) : null;

  const [content, setContent] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [buttonHref, setButtonHref] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('page');
  const [pageSlug, setPageSlug] = useState('home');
  const [linkHref, setLinkHref] = useState('');
  const contentFocused = useRef(false);

  useEffect(() => {
    if (!element) return;
    setContent(element.content ?? '');
    setImageSrc((element.props?.src as string) ?? '');
    setButtonHref((element.props?.href as string) ?? '');
    setLinkType((element.props?.linkType as LinkType) || 'page');
    setPageSlug((element.props?.pageSlug as string) || 'home');
    setLinkHref((element.props?.href as string) ?? '');
  }, [element?.id, breakpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!element || contentFocused.current) return;
    setContent(element.content ?? '');
  }, [element?.content, element?.id]);

  const debouncedUpdateContent = useDebouncedCallback((id: string, value: string) => {
    onUpdateElement(id, { content: value }, { recordHistory: false });
  }, 300);

  const commitContent = () => {
    if (!selectedId || !element) return;
    onUpdateElement(selectedId, { content }, { recordHistory: true });
  };

  const currentStyles = element?.styles?.[breakpoint] ?? {};

  const commitLinkProps = (patch: Record<string, unknown>) => {
    if (!selectedId || !element) return;
    onUpdateElement(selectedId, { props: { ...element.props, ...patch } }, { recordHistory: true });
  };

  const isLinkElement = element?.type === 'link' || element?.type === 'logo';
  const isDataDriven =
    element?.type === 'productGrid' ||
    element?.type === 'cartList' ||
    element?.type === 'cartSummary' ||
    element?.type === 'cartIcon';
  const showTextContent =
    element &&
    (element.type === 'heading' ||
      element.type === 'text' ||
      element.type === 'button' ||
      element.type === 'link' ||
      (element.type === 'logo' && !element.props?.src));

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-[var(--e-border)] bg-[var(--e-surface)]">
      <div className="border-b border-[var(--e-border)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--e-text)]">{element?.name || element?.type || 'No selection'}</span>
        {element && <p className="mt-0.5 text-[10px] text-[var(--e-text-subtle)]">{element.type}</p>}
      </div>

      {!element ? (
        <div className="p-4 text-sm text-[var(--e-text-subtle)]">Select an element on the canvas to edit its properties.</div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-between border-b border-[var(--e-border)] py-3">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--e-text-muted)]">Settings</span>
            {!element.locked && (
              <button type="button" onClick={() => onRemove(selectedId!)} className="text-xs text-red-400 hover:text-red-300">
                Delete
              </button>
            )}
          </div>

          <div className="space-y-4 py-3">
            {isDataDriven && (
              <p className="rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-3 py-2 text-xs leading-relaxed text-[var(--e-text-muted)]">
                Content for this block is live (products / cart). Style the layout below — text and items are not edited here.
              </p>
            )}
            {showTextContent && (
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--e-text-muted)]">
                  {element.type === 'logo' ? 'Brand text' : 'Content'}
                </Label>
                {element.type === 'text' ? (
                  <textarea
                    value={content}
                    rows={4}
                    onChange={(e) => {
                      const value = e.target.value;
                      setContent(value);
                      debouncedUpdateContent(selectedId!, value);
                    }}
                    onFocus={() => {
                      contentFocused.current = true;
                    }}
                    onBlur={() => {
                      contentFocused.current = false;
                      commitContent();
                    }}
                    className="w-full resize-y rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-3 py-2 text-sm text-[var(--e-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--e-accent)]"
                  />
                ) : (
                  <Input
                    value={content}
                    onChange={(e) => {
                      const value = e.target.value;
                      setContent(value);
                      debouncedUpdateContent(selectedId!, value);
                    }}
                    onFocus={() => {
                      contentFocused.current = true;
                    }}
                    onBlur={() => {
                      contentFocused.current = false;
                      commitContent();
                    }}
                    className="border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)]"
                  />
                )}
              </div>
            )}

            {(element.type === 'image' || element.type === 'logo') && (
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--e-text-muted)]">Image URL</Label>
                <Input
                  value={imageSrc}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImageSrc(value);
                    onUpdateElement(selectedId!, { props: { ...element.props, src: value } }, { recordHistory: false });
                  }}
                  onBlur={() =>
                    onUpdateElement(selectedId!, { props: { ...element.props, src: imageSrc } }, { recordHistory: true })
                  }
                  placeholder="Leave empty to use brand text"
                  className="border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)]"
                />
              </div>
            )}

            {isLinkElement && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[var(--e-text-muted)]">Link type</Label>
                  <select
                    value={linkType}
                    onChange={(e) => {
                      const value = e.target.value as LinkType;
                      setLinkType(value);
                      commitLinkProps({ linkType: value });
                    }}
                    className="w-full rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-3 py-2 text-sm text-[var(--e-text)]"
                  >
                    <option value="page">Page</option>
                    <option value="anchor">Section anchor</option>
                    <option value="url">External URL</option>
                  </select>
                </div>

                {linkType === 'page' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--e-text-muted)]">Page</Label>
                    <select
                      value={pageSlug}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPageSlug(value);
                        commitLinkProps({ linkType: 'page', pageSlug: value });
                      }}
                      className="w-full rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-3 py-2 text-sm text-[var(--e-text)]"
                    >
                      {sitePages.map((page) => (
                        <option key={page.id} value={page.slug}>
                          {page.title} ({page.slug})
                        </option>
                      ))}
                      {!sitePages.length && <option value="home">Home</option>}
                    </select>
                  </div>
                )}

                {(linkType === 'anchor' || linkType === 'url') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--e-text-muted)]">
                      {linkType === 'anchor' ? 'Anchor (e.g. #contact)' : 'URL'}
                    </Label>
                    <Input
                      value={linkHref}
                      onChange={(e) => {
                        const value = e.target.value;
                        setLinkHref(value);
                        onUpdateElement(
                          selectedId!,
                          { props: { ...element.props, linkType, href: value } },
                          { recordHistory: false },
                        );
                      }}
                      onBlur={() => commitLinkProps({ linkType, href: linkHref })}
                      className="border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)]"
                    />
                  </div>
                )}
              </>
            )}

            {element.type === 'button' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--e-text-muted)]">Link</Label>
                <Input
                  value={buttonHref}
                  onChange={(e) => {
                    const value = e.target.value;
                    setButtonHref(value);
                    onUpdateElement(selectedId!, { props: { ...element.props, href: value } }, { recordHistory: false });
                  }}
                  onBlur={() =>
                    onUpdateElement(selectedId!, { props: { ...element.props, href: buttonHref } }, { recordHistory: true })
                  }
                  className="border-[var(--e-border)] bg-[var(--e-surface-2)] text-[var(--e-text)]"
                />
              </div>
            )}
          </div>

          <StylePanel
            elementId={selectedId!}
            elementType={element.type}
            breakpoint={breakpoint}
            styles={currentStyles}
            onUpdateStyle={onUpdateStyle}
          />
        </div>
      )}
    </aside>
  );
}
