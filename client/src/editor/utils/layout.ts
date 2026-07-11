import type { PageElement, SiteLayout } from '../../types/page';
import { findElement } from './tree';

export type LayoutRegion = 'header' | 'footer' | 'body';

export function findInComposed(
  layout: SiteLayout,
  bodyRoot: PageElement[],
  id: string,
): { region: LayoutRegion; root: PageElement[] } | null {
  if (layout.header?.length && findElement(layout.header, id)) {
    return { region: 'header', root: layout.header };
  }
  if (findElement(bodyRoot, id)) {
    return { region: 'body', root: bodyRoot };
  }
  if (layout.footer?.length && findElement(layout.footer, id)) {
    return { region: 'footer', root: layout.footer };
  }
  return null;
}

export function composePageRoot(layout: SiteLayout | null, body: PageElement[]): PageElement[] {
  return [...(layout?.header ?? []), ...body, ...(layout?.footer ?? [])];
}

export function getElementRegion(
  layout: SiteLayout | null,
  id: string,
  bodyRoot: PageElement[],
): LayoutRegion | null {
  if (layout?.header?.length && findElement(layout.header, id)) return 'header';
  if (layout?.footer?.length && findElement(layout.footer, id)) return 'footer';
  if (findElement(bodyRoot, id)) return 'body';
  return null;
}

export function updateLayoutRegion(
  layout: SiteLayout,
  region: 'header' | 'footer',
  updater: (root: PageElement[]) => PageElement[],
): SiteLayout {
  if (region === 'header') {
    return { ...layout, header: updater(layout.header) };
  }
  return { ...layout, footer: updater(layout.footer) };
}

export function normalizeSiteLayout(layout?: SiteLayout | null): SiteLayout {
  return {
    header: layout?.header ?? [],
    footer: layout?.footer ?? [],
  };
}

export function isLockedLayoutRoot(element: PageElement | null) {
  return Boolean(element?.locked && (element.type === 'header' || element.type === 'footer'));
}
