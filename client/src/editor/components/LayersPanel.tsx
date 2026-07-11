import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageElement } from '../../types/page';
import { cn } from '../../lib/utils';

function LayerItem({
  element,
  depth,
  selectedId,
  onSelect,
}: {
  element: PageElement;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <button
        {...attributes}
        {...listeners}
        onClick={() => onSelect(element.id)}
        className={cn(
          'flex w-full items-center rounded px-2 py-1 text-left text-xs',
          selectedId === element.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100',
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {element.name || element.type}
      </button>
      {element.children?.map((child) => (
        <LayerItem key={child.id} element={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function LayersPanel({
  root,
  selectedId,
  onSelect,
}: {
  root: PageElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'layers-drop-root', data: { parentId: null } });
  const ids = root.map((el) => el.id);

  return (
    <aside className="w-56 border-r border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Layers</h3>
      <div ref={setNodeRef} className={cn('min-h-[200px] space-y-1', isOver && 'rounded bg-blue-50')}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {root.map((el) => (
            <LayerItem key={el.id} element={el} depth={0} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </SortableContext>
      </div>
    </aside>
  );
}
