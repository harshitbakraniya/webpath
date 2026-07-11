import {
  AlignLeft,
  Box,
  Heading1,
  Image,
  Minus,
  MousePointerClick,
  SeparatorHorizontal,
  Type,
  X,
} from 'lucide-react';
import { useCallback, useRef, type ComponentType } from 'react';
import type { ElementType } from '../../types/page';

const ELEMENTS: { type: ElementType; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { type: 'section', label: 'Section', icon: Box },
  { type: 'container', label: 'Container', icon: Box },
  { type: 'heading', label: 'Heading', icon: Heading1 },
  { type: 'text', label: 'Paragraph', icon: Type },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'button', label: 'Button', icon: MousePointerClick },
  { type: 'link', label: 'Nav Link', icon: Type },
  { type: 'logo', label: 'Logo', icon: Image },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'spacer', label: 'Spacer', icon: SeparatorHorizontal },
];

/** MIME type used in dataTransfer to identify element-panel drags. */
export const ELEMENT_DRAG_MIME = 'application/x-webpath-element';

interface ElementsSlidePanelProps {
  open: boolean;
  onClose: () => void;
  onAddElement: (type: ElementType) => void;
  onDragStart?: (type: ElementType) => void;
  onDragEnd?: () => void;
}

export function ElementsSlidePanel({ open, onClose, onAddElement, onDragStart, onDragEnd }: ElementsSlidePanelProps) {
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, type: ElementType, label: string) => {
      e.dataTransfer.setData(ELEMENT_DRAG_MIME, type);
      e.dataTransfer.effectAllowed = 'copy';

      // Build a compact drag ghost
      const ghost = document.createElement('div');
      ghost.textContent = label;
      Object.assign(ghost.style, {
        position: 'fixed',
        top: '-1000px',
        left: '-1000px',
        padding: '6px 14px',
        borderRadius: '8px',
        background: '#146ef5',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      });
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
      e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);

      onDragStart?.(type);
    },
    [onDragStart],
  );

  const handleDragEnd = useCallback(() => {
    // Clean up the ghost node
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    onDragEnd?.();
  }, [onDragEnd]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col border-r border-[var(--e-border)] bg-[var(--e-surface)] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--e-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-[var(--e-text-muted)]" />
          <span className="text-sm font-medium text-[var(--e-text)]">Add Elements</span>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--e-text-subtle)] hover:text-[var(--e-text)]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-3 text-xs text-[var(--e-text-subtle)]">Drag or click to add to page</p>
        <div className="grid grid-cols-2 gap-2">
          {ELEMENTS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              draggable
              onClick={() => {
                onAddElement(type);
                onClose();
              }}
              onDragStart={(e) => handleDragStart(e, type, label)}
              onDragEnd={handleDragEnd}
              className="flex flex-col items-center gap-2 rounded-lg border border-[var(--e-border)] bg-[var(--e-surface-2)] p-4 text-[var(--e-text-muted)] transition-colors hover:border-[var(--e-accent)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)] active:scale-95 active:opacity-70"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
