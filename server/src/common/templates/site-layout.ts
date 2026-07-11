import { PageElement } from '../types/page.types';

const uid = () => crypto.randomUUID();

export interface SiteLayout {
  header: PageElement[];
  footer: PageElement[];
}

function linkStyles(color = '#334155') {
  return {
    desktop: { color, fontSize: '15px', fontWeight: '500', textDecoration: 'none' },
    mobile: { color, fontSize: '14px', fontWeight: '500', textDecoration: 'none' },
  };
}

function navLink(content: string, props: Record<string, unknown>): PageElement {
  return {
    id: uid(),
    type: 'link',
    name: content,
    content,
    props,
    styles: linkStyles(),
  };
}

export function buildCartIcon(cartPageSlug = 'cart'): PageElement {
  return {
    id: uid(),
    type: 'cartIcon',
    name: 'Cart',
    props: { linkType: 'page', pageSlug: cartPageSlug },
    styles: {
      desktop: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '999px',
        color: '#0f172a',
        backgroundColor: 'transparent',
        position: 'relative',
        cursor: 'pointer',
        textDecoration: 'none',
      },
      mobile: {
        width: '36px',
        height: '36px',
      },
    },
  };
}

export function buildDefaultSiteLayout(options?: {
  shopPageSlug?: string;
  cartPageSlug?: string;
}): SiteLayout {
  const navChildren: PageElement[] = [
    navLink('Home', { linkType: 'page', pageSlug: 'home' }),
    navLink('About', { linkType: 'anchor', href: '#about' }),
    navLink('Contact', { linkType: 'anchor', href: '#contact' }),
  ];

  if (options?.shopPageSlug) {
    navChildren.splice(1, 0, navLink('Shop', { linkType: 'page', pageSlug: options.shopPageSlug }));
  }

  const headerChildren: PageElement[] = [
    {
      id: uid(),
      type: 'logo',
      name: 'Logo',
      content: 'Your Brand',
      props: { linkType: 'page', pageSlug: 'home' },
      styles: {
        desktop: { fontSize: '20px', fontWeight: '700', color: '#0f172a' },
        mobile: { fontSize: '18px', fontWeight: '700', color: '#0f172a' },
      },
    },
    {
      id: uid(),
      type: 'nav',
      name: 'Navigation',
      styles: {
        desktop: { display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' },
        mobile: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
      },
      children: navChildren,
    },
  ];

  if (options?.cartPageSlug) {
    headerChildren.push(buildCartIcon(options.cartPageSlug));
  }

  const header: PageElement[] = [
    {
      id: uid(),
      type: 'header',
      name: 'Site Header',
      locked: true,
      styles: {
        desktop: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 64px',
          position: 'sticky',
          top: '0',
          zIndex: '100',
          width: '100%',
        },
        mobile: { padding: '12px 20px' },
      },
      children: [
        {
          id: uid(),
          type: 'container',
          name: 'Header Inner',
          styles: {
            desktop: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
              gap: '24px',
            },
            mobile: { flexDirection: 'column', alignItems: 'flex-start', gap: '16px' },
          },
          children: headerChildren,
        },
      ],
    },
  ];

  const footer: PageElement[] = [
    {
      id: uid(),
      type: 'footer',
      name: 'Site Footer',
      locked: true,
      styles: {
        desktop: {
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          padding: '48px 64px',
          width: '100%',
        },
        mobile: { padding: '32px 20px' },
      },
      children: [
        {
          id: uid(),
          type: 'container',
          name: 'Footer Inner',
          styles: {
            desktop: {
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
            },
          },
          children: [
            {
              id: uid(),
              type: 'container',
              name: 'Footer Top',
              styles: {
                desktop: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '32px',
                  flexWrap: 'wrap',
                },
                mobile: { flexDirection: 'column', gap: '20px' },
              },
              children: [
                {
                  id: uid(),
                  type: 'logo',
                  name: 'Footer Logo',
                  content: 'Your Brand',
                  props: { linkType: 'page', pageSlug: 'home' },
                  styles: {
                    desktop: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
                  },
                },
                {
                  id: uid(),
                  type: 'nav',
                  name: 'Footer Nav',
                  styles: { desktop: { display: 'flex', gap: '24px', flexWrap: 'wrap' } },
                  children: [
                    navLink('Home', { linkType: 'page', pageSlug: 'home' }),
                    ...(options?.shopPageSlug
                      ? [navLink('Shop', { linkType: 'page', pageSlug: options.shopPageSlug })]
                      : []),
                    navLink('Contact', { linkType: 'anchor', href: '#contact' }),
                  ],
                },
              ],
            },
            {
              id: uid(),
              type: 'text',
              content: '© 2026 Your Brand. All rights reserved.',
              styles: { desktop: { fontSize: '14px', color: '#64748b' } },
            },
          ],
        },
      ],
    },
  ];

  return { header, footer };
}

export function layoutHasShopLink(layout: SiteLayout, shopPageSlug: string): boolean {
  const check = (elements: PageElement[]): boolean => {
    for (const el of elements) {
      if (
        el.type === 'link' &&
        el.props?.linkType === 'page' &&
        el.props?.pageSlug === shopPageSlug
      ) {
        return true;
      }
      if (el.children?.length && check(el.children)) return true;
    }
    return false;
  };
  return check(layout.header) || check(layout.footer);
}

export function layoutHasCartIcon(layout: SiteLayout): boolean {
  const check = (elements: PageElement[]): boolean => {
    for (const el of elements) {
      if (el.type === 'cartIcon') return true;
      if (el.children?.length && check(el.children)) return true;
    }
    return false;
  };
  return check(layout.header);
}

function navChildrenHasShopLink(children: PageElement[], shopPageSlug: string): boolean {
  return children.some(
    (el) =>
      el.type === 'link' &&
      el.props?.linkType === 'page' &&
      el.props?.pageSlug === shopPageSlug,
  );
}

function insertShopInNavChildren(children: PageElement[], shopPageSlug: string): PageElement[] {
  if (navChildrenHasShopLink(children, shopPageSlug)) return children;
  const shopLink = navLink('Shop', { linkType: 'page', pageSlug: shopPageSlug });
  const homeIdx = children.findIndex(
    (c) => c.type === 'link' && c.props?.linkType === 'page' && c.props?.pageSlug === 'home',
  );
  const next = [...children];
  next.splice(homeIdx >= 0 ? homeIdx + 1 : 1, 0, shopLink);
  return next;
}

function mergeShopInTree(elements: PageElement[], shopPageSlug: string): PageElement[] {
  return elements.map((el) => {
    if (el.type === 'nav' && el.children?.length) {
      return {
        ...el,
        children: insertShopInNavChildren(el.children, shopPageSlug),
      };
    }
    if (el.children?.length) {
      return { ...el, children: mergeShopInTree(el.children, shopPageSlug) };
    }
    return el;
  });
}

export function mergeShopNavLink(layout: SiteLayout, shopPageSlug: string): SiteLayout {
  if (!shopPageSlug || layoutHasShopLink(layout, shopPageSlug)) {
    return layout;
  }
  return {
    header: mergeShopInTree(layout.header, shopPageSlug),
    footer: mergeShopInTree(layout.footer, shopPageSlug),
  };
}

function layoutHasPageLink(layout: SiteLayout, pageSlug: string): boolean {
  const check = (elements: PageElement[]): boolean => {
    for (const el of elements) {
      if (el.type === 'link' && el.props?.linkType === 'page' && el.props?.pageSlug === pageSlug) {
        return true;
      }
      if (el.children?.length && check(el.children)) return true;
    }
    return false;
  };
  return check(layout.header) || check(layout.footer);
}

function insertPageInNavChildren(
  children: PageElement[],
  label: string,
  pageSlug: string,
): PageElement[] {
  const existingPageIdx = children.findIndex(
    (el) => el.type === 'link' && el.props?.linkType === 'page' && el.props?.pageSlug === pageSlug,
  );
  if (existingPageIdx >= 0) return children;

  const anchorIdx = children.findIndex((el) => {
    if (el.type !== 'link') return false;
    const href = String(el.props?.href ?? '').toLowerCase();
    const content = String(el.content ?? '').toLowerCase();
    const slug = pageSlug.toLowerCase();
    return href === `#${slug}` || content === slug || content === label.toLowerCase();
  });

  if (anchorIdx >= 0) {
    const next = [...children];
    const prev = next[anchorIdx];
    next[anchorIdx] = {
      ...prev,
      name: label,
      content: label,
      props: { linkType: 'page', pageSlug },
      styles: prev.styles ?? linkStyles(),
    };
    return next;
  }

  const pageLink = navLink(label, { linkType: 'page', pageSlug });
  const homeIdx = children.findIndex(
    (c) => c.type === 'link' && c.props?.linkType === 'page' && c.props?.pageSlug === 'home',
  );
  const next = [...children];
  next.splice(homeIdx >= 0 ? homeIdx + 1 : children.length, 0, pageLink);
  return next;
}

function mergePageInTree(elements: PageElement[], label: string, pageSlug: string): PageElement[] {
  return elements.map((el) => {
    if (el.type === 'nav' && el.children) {
      return {
        ...el,
        children: insertPageInNavChildren(el.children, label, pageSlug),
      };
    }
    if (el.children?.length) {
      return { ...el, children: mergePageInTree(el.children, label, pageSlug) };
    }
    return el;
  });
}

/** Add (or upgrade) a page link in header + footer nav. Shared chrome stays site-level. */
export function mergePageNavLink(
  layout: SiteLayout,
  options: { label: string; pageSlug: string },
): SiteLayout {
  const { label, pageSlug } = options;
  if (!pageSlug || !label) return layout;
  if (layoutHasPageLink(layout, pageSlug)) return layout;
  return {
    header: mergePageInTree(layout.header, label, pageSlug),
    footer: mergePageInTree(layout.footer, label, pageSlug),
  };
}

function insertCartIconInHeaderTree(elements: PageElement[], cartPageSlug: string): PageElement[] {
  return elements.map((el) => {
    if (el.type === 'header' && el.children?.length) {
      return {
        ...el,
        children: el.children.map((child) => {
          if (child.type === 'container' && child.children?.length) {
            if (child.children.some((c) => c.type === 'cartIcon')) return child;
            return {
              ...child,
              children: [...child.children, buildCartIcon(cartPageSlug)],
            };
          }
          return child;
        }),
      };
    }
    if (el.children?.length) {
      return { ...el, children: insertCartIconInHeaderTree(el.children, cartPageSlug) };
    }
    return el;
  });
}

function updateCartIconSlug(elements: PageElement[], cartPageSlug: string): PageElement[] {
  return elements.map((el) => {
    if (el.type === 'cartIcon') {
      return {
        ...el,
        props: { ...el.props, linkType: 'page', pageSlug: cartPageSlug },
      };
    }
    if (el.children?.length) {
      return { ...el, children: updateCartIconSlug(el.children, cartPageSlug) };
    }
    return el;
  });
}

export function mergeCartIcon(layout: SiteLayout, cartPageSlug: string): SiteLayout {
  if (!cartPageSlug) return layout;
  if (layoutHasCartIcon(layout)) {
    return {
      header: updateCartIconSlug(layout.header, cartPageSlug),
      footer: layout.footer,
    };
  }
  return {
    header: insertCartIconInHeaderTree(layout.header, cartPageSlug),
    footer: layout.footer,
  };
}

export function cloneLayout(layout: SiteLayout): SiteLayout {
  return JSON.parse(JSON.stringify(layout)) as SiteLayout;
}

export function layoutIsEmpty(layout?: SiteLayout | null) {
  return !layout?.header?.length && !layout?.footer?.length;
}
