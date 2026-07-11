import type { CSSProperties } from 'react';
import type { Breakpoint, PageElement } from '../../types/page';
import { resolveStyles } from '../components/Renderer';

export function structuralSignature(root: PageElement[]): string {
  const walk = (elements: PageElement[]): unknown[] =>
    elements.map((el) => ({
      id: el.id,
      type: el.type,
      content: el.content,
      props: el.props,
      children: el.children ? walk(el.children) : undefined,
    }));

  return JSON.stringify(walk(root));
}

export function flattenElements(root: PageElement[]): PageElement[] {
  const result: PageElement[] = [];
  const walk = (elements: PageElement[]) => {
    for (const el of elements) {
      result.push(el);
      if (el.children?.length) walk(el.children);
    }
  };
  walk(root);
  return result;
}

function toInlineStyle(styles: CSSProperties): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(styles)) {
    if (value != null && value !== '') {
      result[key] = String(value);
    }
  }
  return result;
}

export function collectStylePatches(root: PageElement[], breakpoint: Breakpoint) {
  return flattenElements(root).map((el) => ({
    id: el.id,
    css: toInlineStyle(resolveStyles(el, breakpoint)),
  }));
}

export function stylesSignature(root: PageElement[], breakpoint: Breakpoint): string {
  const patches = collectStylePatches(root, breakpoint);
  return JSON.stringify(patches);
}
