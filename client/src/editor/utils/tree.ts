import { arrayMove } from '@dnd-kit/sortable';
import type { Breakpoint, ElementType, PageElement, PageDocument, StyleProps } from '../../types/page';

export function normalizeElement(element: PageElement): PageElement {
  return {
    ...element,
    styles: element.styles ?? {},
    children: element.children?.map(normalizeElement),
  };
}

export function normalizePageRoot(root: PageElement[]): PageElement[] {
  return (root ?? []).map(normalizeElement);
}

export function normalizePageDocument(doc: PageDocument): PageDocument {
  return {
    ...doc,
    root: normalizePageRoot(doc.root),
  };
}

export function findElement(root: PageElement[], id: string): PageElement | null {
  for (const el of root) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElement(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentWithId(
  root: PageElement[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; parentChildren: PageElement[]; index: number } | null {
  const idx = root.findIndex((el) => el.id === id);
  if (idx >= 0) return { parentId, parentChildren: root, index: idx };

  for (const el of root) {
    if (el.children) {
      const childIdx = el.children.findIndex((c) => c.id === id);
      if (childIdx >= 0) {
        return { parentId: el.id, parentChildren: el.children, index: childIdx };
      }
      const nested = findParentWithId(el.children, id, el.id);
      if (nested) return nested;
    }
  }
  return null;
}

export const CONTAINER_TYPES = new Set<PageElement['type']>([
  'section',
  'container',
  'form',
  'header',
  'footer',
  'nav',
]);

export function resolveInsertParentId(root: PageElement[], selectedId: string | null): string | null {
  if (!selectedId) return null;
  const selected = findElement(root, selectedId);
  if (!selected) return null;
  if (CONTAINER_TYPES.has(selected.type)) return selected.id;

  const parentInfo = findParentWithId(root, selectedId);
  if (!parentInfo?.parentId) return null;
  const parent = findElement(root, parentInfo.parentId);
  if (parent && CONTAINER_TYPES.has(parent.type)) return parent.id;
  return null;
}

export function findParent(root: PageElement[], id: string): { parent: PageElement[]; index: number } | null {
  const idx = root.findIndex((el) => el.id === id);
  if (idx >= 0) return { parent: root, index: idx };

  for (const el of root) {
    if (el.children) {
      const childIdx = el.children.findIndex((c) => c.id === id);
      if (childIdx >= 0) return { parent: el.children, index: childIdx };
      const nested = findParent(el.children, id);
      if (nested) return nested;
    }
  }
  return null;
}

export function updateElementInTree(root: PageElement[], id: string, patch: Partial<PageElement>): PageElement[] {
  return root.map((el) => {
    if (el.id === id) return { ...el, ...patch, styles: patch.styles ?? el.styles ?? {} };
    if (el.children) return { ...el, children: updateElementInTree(el.children, id, patch) };
    return el;
  });
}

export function updateStyleInTree(
  root: PageElement[],
  id: string,
  breakpoint: Breakpoint,
  patch: StyleProps,
): PageElement[] {
  return root.map((el) => {
    if (el.id === id) {
      const currentStyles = el.styles ?? {};
      return {
        ...el,
        styles: {
          ...currentStyles,
          [breakpoint]: { ...(currentStyles[breakpoint] ?? {}), ...patch },
        },
      };
    }
    if (el.children) return { ...el, children: updateStyleInTree(el.children, id, breakpoint, patch) };
    return el;
  });
}

export function removeElementFromTree(root: PageElement[], id: string): PageElement[] {
  return root
    .filter((el) => el.id !== id)
    .map((el) => (el.children ? { ...el, children: removeElementFromTree(el.children, id) } : el));
}

export function insertElement(
  root: PageElement[],
  parentId: string | null,
  element: PageElement,
  index?: number,
): PageElement[] {
  if (!parentId) {
    const next = [...root];
    const i = index ?? next.length;
    next.splice(i, 0, element);
    return next;
  }

  return root.map((el) => {
    if (el.id === parentId) {
      const children = [...(el.children ?? [])];
      children.splice(index ?? children.length, 0, element);
      return { ...el, children };
    }
    if (el.children) return { ...el, children: insertElement(el.children, parentId, element, index) };
    return el;
  });
}

function setParentChildren(
  root: PageElement[],
  parentId: string | null,
  children: PageElement[],
): PageElement[] {
  if (parentId === null) return children;
  return root.map((el) => {
    if (el.id === parentId) return { ...el, children };
    if (el.children) return { ...el, children: setParentChildren(el.children, parentId, children) };
    return el;
  });
}

export function moveElementInTree(
  root: PageElement[],
  id: string,
  newParentId: string | null,
  index: number,
): PageElement[] {
  const located = findParentWithId(root, id);
  if (!located) return root;

  if (located.parentId === newParentId) {
    const reordered = arrayMove(located.parentChildren, located.index, index);
    return setParentChildren(root, newParentId, reordered);
  }

  const moved = located.parentChildren[located.index];
  if (!moved) return root;
  const afterRemove = removeElementFromTree(root, id);
  return insertElement(afterRemove, newParentId, moved, index);
}

export function createBlock(type: ElementType, name?: string): PageElement {
  const base: PageElement = {
    id: crypto.randomUUID(),
    type,
    name,
    styles: { desktop: {} },
    children: undefined,
  };

  switch (type) {
    case 'section':
      return {
        ...base,
        name: name ?? 'New Section',
        styles: { desktop: { padding: '48px 32px' }, mobile: { padding: '24px 16px' } },
        children: [],
      };
    case 'heading':
      return { ...base, content: 'New Heading', styles: { desktop: { fontSize: '32px', fontWeight: '600' } } };
    case 'text':
      return { ...base, content: 'New paragraph text', styles: { desktop: { fontSize: '16px', color: '#475569' } } };
    case 'button':
      return {
        ...base,
        content: 'Click me',
        styles: { desktop: { backgroundColor: '#0f172a', color: '#fff', padding: '12px 24px', borderRadius: '8px' } },
      };
    case 'image':
      return {
        ...base,
        props: { src: 'https://placehold.co/800x400', alt: 'Image' },
        styles: { desktop: { width: '100%', borderRadius: '8px' } },
      };
    case 'divider':
      return { ...base, styles: { desktop: { border: '1px solid #e2e8f0', margin: '24px 0' } } };
    case 'spacer':
      return { ...base, styles: { desktop: { height: '48px' } } };
    case 'container':
      return { ...base, styles: { desktop: { display: 'flex', flexDirection: 'column', gap: '16px' } }, children: [] };
    case 'nav':
      return {
        ...base,
        name: name ?? 'Navigation',
        styles: { desktop: { display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' } },
        children: [],
      };
    case 'link':
      return {
        ...base,
        content: 'Link',
        props: { linkType: 'page', pageSlug: 'home' },
        styles: { desktop: { color: '#334155', fontSize: '15px', fontWeight: '500', textDecoration: 'none' } },
      };
    case 'logo':
      return {
        ...base,
        name: name ?? 'Logo',
        content: 'Your Brand',
        props: { linkType: 'page', pageSlug: 'home' },
        styles: { desktop: { fontSize: '20px', fontWeight: '700', color: '#0f172a' } },
      };
    case 'header':
      return {
        ...base,
        name: name ?? 'Site Header',
        locked: true,
        styles: { desktop: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 64px', width: '100%' } },
        children: [],
      };
    case 'footer':
      return {
        ...base,
        name: name ?? 'Site Footer',
        locked: true,
        styles: { desktop: { backgroundColor: '#0f172a', padding: '48px 64px', width: '100%' } },
        children: [],
      };
    default:
      return base;
  }
}
