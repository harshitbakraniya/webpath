import { PageElement } from '../types/page.types';

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
