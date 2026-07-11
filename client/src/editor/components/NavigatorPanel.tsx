import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Collision,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PageElement } from '../../types/page';
import { cn } from '../../lib/utils';

type SectionKey = 'header' | 'body' | 'footer';

function containerIdFor(section: SectionKey, parentId: string | null) {
  return parentId ? parentId : `${section}-root`;
}

function parentIdFromContainer(containerId: string, section: SectionKey): string | null {
  return containerId === `${section}-root` ? null : containerId;
}

function sortableContainerId(collision: Collision): string | undefined {
  const sortable = collision.data?.droppableContainer?.data?.current?.sortable as
    | { containerId?: string }
    | undefined;
  return sortable?.containerId;
}

/** Prefer drop targets in the same sibling list as the dragged item. */
const siblingCollisionDetection: CollisionDetection = (args) => {
  const collisions = closestCenter(args);
  const activeContainerId = args.active?.data.current?.containerId as string | undefined;
  if (!activeContainerId || collisions.length === 0) return collisions;

  const siblings = collisions.filter((c) => sortableContainerId(c) === activeContainerId);
  return siblings.length > 0 ? siblings : collisions;
};

function SortableNavigatorItem({
  element,
  depth,
  section,
  parentId,
  selectedId,
  onSelect,
  dragDisabled,
}: {
  element: PageElement;
  depth: number;
  section: SectionKey;
  parentId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  dragDisabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (element.children?.length ?? 0) > 0;
  const isSelected = selectedId === element.id;
  const childIds = useMemo(() => element.children?.map((c) => c.id) ?? [], [element.children]);
  const containerId = containerIdFor(section, parentId);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    disabled: dragDisabled,
    data: { section, parentId, containerId, label: element.name || element.type },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(isDragging && 'z-10 opacity-40')}
      >
        <div
          className={cn(
            'flex w-full items-center gap-0.5 rounded text-left text-xs',
            isSelected ? 'bg-[var(--palette-reversed-grey)] text-white' : 'text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]',
          )}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {!dragDisabled ? (
            <button
              type="button"
              ref={setActivatorNodeRef}
              className={cn(
                'flex h-6 w-5 shrink-0 touch-none cursor-grab items-center justify-center active:cursor-grabbing',
                isSelected ? 'text-white/80' : 'text-[var(--e-text-subtle)]',
              )}
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3 w-3" />
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}

          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="flex h-6 w-4 shrink-0 items-center justify-center"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          <button
            type="button"
            onClick={() => onSelect(element.id)}
            className="min-w-0 flex-1 truncate py-1 pr-2 text-left"
          >
            {element.name || element.type}
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <SortableContext
          id={containerIdFor(section, element.id)}
          items={childIds}
          strategy={verticalListSortingStrategy}
        >
          {element.children!.map((child) => (
            <SortableNavigatorItem
              key={child.id}
              element={child}
              depth={depth + 1}
              section={section}
              parentId={element.id}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}

function NavigatorSection({
  section,
  label,
  elements,
  selectedId,
  onSelect,
  rootDragDisabled,
}: {
  section: SectionKey;
  label: string;
  elements: PageElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  rootDragDisabled?: boolean;
}) {
  const rootIds = useMemo(() => elements.map((el) => el.id), [elements]);
  if (!elements.length) return null;

  return (
    <div className="mb-3">
      <div className="mb-1 px-2 text-[10px] uppercase tracking-wide text-[var(--e-text-subtle)]">{label}</div>
      <SortableContext
        id={containerIdFor(section, null)}
        items={rootIds}
        strategy={verticalListSortingStrategy}
      >
        {elements.map((el) => (
          <SortableNavigatorItem
            key={el.id}
            element={el}
            depth={0}
            section={section}
            parentId={null}
            selectedId={selectedId}
            onSelect={onSelect}
            dragDisabled={rootDragDisabled}
          />
        ))}
      </SortableContext>
    </div>
  );
}

export function NavigatorPanel({
  header,
  body,
  footer,
  selectedId,
  onSelect,
  onMoveElement,
  open,
}: {
  header: PageElement[];
  body: PageElement[];
  footer: PageElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveElement: (
    id: string,
    newParentId: string | null,
    index: number,
    section: SectionKey,
  ) => void;
  open: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    setActiveLabel(String(event.active.data.current?.label ?? 'Element'));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveLabel('');

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeSortable = active.data.current?.sortable as
      | { containerId: string; index: number }
      | undefined;
    const overSortable = over.data.current?.sortable as
      | { containerId: string; index: number }
      | undefined;

    const containerId =
      (active.data.current?.containerId as string | undefined) ?? activeSortable?.containerId;
    const overContainerId =
      (over.data.current?.containerId as string | undefined) ?? overSortable?.containerId;

    if (!containerId || !overContainerId || containerId !== overContainerId) return;
    if (activeSortable == null || overSortable == null) return;

    const section = active.data.current?.section as SectionKey | undefined;
    if (!section) return;

    const parentId = parentIdFromContainer(containerId, section);
    onMoveElement(String(active.id), parentId, overSortable.index, section);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveLabel('');
  };

  if (!open) return null;

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-[var(--e-border)] bg-[var(--e-surface)]">
      <div className="border-b border-[var(--e-border)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--e-text)]">Navigator</span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={siblingCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-y-auto p-2">
          <NavigatorSection
            section="header"
            label="Header (site)"
            elements={header}
            selectedId={selectedId}
            onSelect={onSelect}
            rootDragDisabled
          />
          <NavigatorSection section="body" label="Body" elements={body} selectedId={selectedId} onSelect={onSelect} />
          <NavigatorSection
            section="footer"
            label="Footer (site)"
            elements={footer}
            selectedId={selectedId}
            onSelect={onSelect}
            rootDragDisabled
          />
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeId ? (
            <div className="flex items-center gap-2 rounded-md border border-[var(--e-accent)] bg-[var(--e-surface)] px-3 py-2 text-xs font-medium text-[var(--e-text)] shadow-lg">
              <GripVertical className="h-3 w-3 text-[var(--e-text-muted)]" />
              {activeLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </aside>
  );
}
