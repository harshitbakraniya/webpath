import type { LinkType } from '../../types/page';

export function resolveLinkHref(
  props: Record<string, unknown> | undefined,
  siteSlug?: string,
): string | undefined {
  if (!props) return undefined;

  const linkType = (props.linkType as LinkType) || (props.pageSlug ? 'page' : props.href ? 'anchor' : undefined);
  if (linkType === 'page') {
    const pageSlug = String(props.pageSlug ?? 'home');
    if (!siteSlug) return pageSlug === 'home' ? '/' : `/${pageSlug}`;
    if (pageSlug === 'home') return `/site/${siteSlug}`;
    return `/site/${siteSlug}/${pageSlug}`;
  }
  if (linkType === 'url') {
    return String(props.href ?? '');
  }
  if (linkType === 'anchor') {
    return String(props.href ?? '#');
  }
  if (props.href) return String(props.href);
  return undefined;
}

export function resolveEditorPageSlug(props: Record<string, unknown> | undefined): string | null {
  if (!props) return null;
  if (props.linkType === 'page' && props.pageSlug) return String(props.pageSlug);
  if (props.pageSlug && !props.linkType) return String(props.pageSlug);
  return null;
}
