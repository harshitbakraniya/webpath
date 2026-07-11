import { useDraggable } from '@dnd-kit/core';
import type { ElementType } from '../../types/page';

const BLOCKS: { type: ElementType; label: string }[] = [
  { type: 'section', label: 'Section' },
  { type: 'heading', label: 'Heading' },
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button' },
  { type: 'divider', label: 'Divider' },
  { type: 'spacer', label: 'Spacer' },
];

function DraggableBlock({ type, label }: { type: ElementType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-block-${type}`,
    data: { kind: 'new-block', elementType: type },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50 ${isDragging ? 'opacity-50' : ''}`}
    >
      {label}
    </button>
  );
}

export function BlockLibraryPanel() {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Blocks</h3>
      <div className="space-y-2">
        {BLOCKS.map((block) => (
          <DraggableBlock key={block.type} type={block.type} label={block.label} />
        ))}
      </div>
    </aside>
  );
}
