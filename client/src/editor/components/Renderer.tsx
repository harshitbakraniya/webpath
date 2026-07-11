import React from 'react';
import type { Breakpoint, PageElement, StyleProps } from '../../types/page';
import { ProductGridCards, type ProductCardItem } from '../../components/store/ProductGridCards';
import { CartIconView } from '../../components/store/CartIconView';
import { CartListView } from '../../components/store/CartListView';
import { CartSummaryView } from '../../components/store/CartSummaryView';
import type { CartItem } from '../../store/cartStore';
import { resolveEditorPageSlug, resolveLinkHref } from '../utils/links';

export function resolveStyles(element: PageElement, breakpoint: Breakpoint): React.CSSProperties {
  const styles = element.styles ?? {};
  const desktop = styles.desktop ?? {};
  const tablet = styles.tablet ?? {};
  const mobile = styles.mobile ?? {};

  if (breakpoint === 'mobile') return { ...desktop, ...tablet, ...mobile } as React.CSSProperties;
  if (breakpoint === 'tablet') return { ...desktop, ...tablet } as React.CSSProperties;
  return desktop as React.CSSProperties;
}

export function stylePropsToCss(styles: StyleProps): React.CSSProperties {
  return styles as React.CSSProperties;
}

export type RendererMode = 'editor' | 'public';

export interface RendererProps {
  root: PageElement[];
  breakpoint: Breakpoint;
  mode?: RendererMode;
  siteSlug?: string;
  selectedElementId?: string | null;
  hoveredElementId?: string | null;
  onSelectElement?: (id: string) => void;
  onHoverElement?: (id: string | null) => void;
  onNavigatePage?: (pageSlug: string) => void;
  products?: ProductCardItem[];
  resolveProductImageSrc?: (imageUrl: string) => string;
  cartItems?: CartItem[];
  cartCount?: number;
  onAddToCart?: (product: ProductCardItem) => void;
  onCartQuantityChange?: (productId: string, quantity: number) => void;
  onCartRemove?: (productId: string) => void;
  onCheckout?: () => void;
}

function editorOutline(id: string, selectedId?: string | null, hoveredId?: string | null) {
  if (selectedId === id) return '2px solid #2563eb';
  if (hoveredId === id) return '2px dashed #94a3b8';
  return undefined;
}

function ElementNode({
  element,
  breakpoint,
  mode,
  siteSlug,
  selectedElementId,
  hoveredElementId,
  onSelectElement,
  onHoverElement,
  onNavigatePage,
  products,
  resolveProductImageSrc,
  cartItems,
  cartCount,
  onAddToCart,
  onCartQuantityChange,
  onCartRemove,
  onCheckout,
}: {
  element: PageElement;
  breakpoint: Breakpoint;
  mode: RendererMode;
  siteSlug?: string;
  selectedElementId?: string | null;
  hoveredElementId?: string | null;
  onSelectElement?: (id: string) => void;
  onHoverElement?: (id: string | null) => void;
  onNavigatePage?: (pageSlug: string) => void;
  products?: ProductCardItem[];
  resolveProductImageSrc?: (imageUrl: string) => string;
  cartItems?: CartItem[];
  cartCount?: number;
  onAddToCart?: (product: ProductCardItem) => void;
  onCartQuantityChange?: (productId: string, quantity: number) => void;
  onCartRemove?: (productId: string) => void;
  onCheckout?: () => void;
}) {
  const isEditor = mode === 'editor';
  const isEditableText =
    isEditor &&
    (element.type === 'heading' ||
      element.type === 'text' ||
      element.type === 'button' ||
      element.type === 'link' ||
      element.type === 'logo');
  const baseStyle = resolveStyles(element, breakpoint);
  const interactiveProps = isEditor
    ? {
        'data-element-id': element.id,
        'data-element-type': element.type,
        ...(isEditableText ? { 'data-editable': 'true' } : {}),
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onSelectElement?.(element.id);
        },
        onMouseEnter: () => onHoverElement?.(element.id),
        onMouseLeave: () => onHoverElement?.(null),
        style: {
          ...baseStyle,
          outline: editorOutline(element.id, selectedElementId, hoveredElementId),
          outlineOffset: isEditor ? '2px' : undefined,
          cursor: isEditor ? 'pointer' : undefined,
        } as React.CSSProperties,
      }
    : { style: baseStyle };

  const childProps = {
    breakpoint,
    mode,
    siteSlug,
    selectedElementId,
    hoveredElementId,
    onSelectElement,
    onHoverElement,
    onNavigatePage,
    products,
    resolveProductImageSrc,
    cartItems,
    cartCount,
    onAddToCart,
    onCartQuantityChange,
    onCartRemove,
    onCheckout,
  };

  const children = element.children?.map((child) => (
    <ElementNode key={child.id} element={child} {...childProps} />
  ));

  const linkHref = resolveLinkHref(element.props, siteSlug);
  const editorPageSlug = resolveEditorPageSlug(element.props);

  switch (element.type) {
    case 'header':
      return <header {...interactiveProps}>{children}</header>;
    case 'footer':
      return <footer {...interactiveProps}>{children}</footer>;
    case 'nav':
      return <nav {...interactiveProps}>{children}</nav>;
    case 'link': {
      const pageSlugAttr =
        !isEditor && editorPageSlug ? { 'data-page-slug': editorPageSlug } : {};
      if (linkHref && !isEditor) {
        return (
          <a href={linkHref} {...interactiveProps} {...pageSlugAttr}>
            {element.content}
          </a>
        );
      }
      return (
        <span {...interactiveProps} role="link">
          {element.content}
        </span>
      );
    }
    case 'logo': {
      const src = element.props?.src as string | undefined;
      const alt = (element.props?.alt as string) || element.content || 'Logo';
      const pageSlugAttr =
        !isEditor && editorPageSlug ? { 'data-page-slug': editorPageSlug } : {};
      const logoContent = src ? (
        <img src={src} alt={alt} style={{ height: '40px', width: 'auto', display: 'block' }} />
      ) : (
        <span>{element.content || alt}</span>
      );

      if (linkHref && !isEditor) {
        return (
          <a href={linkHref} {...interactiveProps} {...pageSlugAttr}>
            {logoContent}
          </a>
        );
      }
      return <div {...interactiveProps}>{logoContent}</div>;
    }
    case 'section': {
      const anchorId =
        (element.props?.anchorId as string) ||
        (element.name ? element.name.toLowerCase().replace(/\s+/g, '-') : undefined);
      return (
        <section {...interactiveProps} id={anchorId}>
          {children}
        </section>
      );
    }
    case 'container':
      return <div {...interactiveProps}>{children}</div>;
    case 'heading':
      return <h2 {...interactiveProps}>{element.content}</h2>;
    case 'text':
      return <p {...interactiveProps}>{element.content}</p>;
    case 'image':
      return (
        <img
          {...interactiveProps}
          src={(element.props?.src as string) || 'https://placehold.co/800x400'}
          alt={(element.props?.alt as string) || ''}
        />
      );
    case 'button': {
      const href = element.props?.href as string | undefined;
      if (href && !isEditor) {
        return (
          <a href={href} {...interactiveProps}>
            {element.content}
          </a>
        );
      }
      return (
        <button type="button" {...interactiveProps}>
          {element.content}
        </button>
      );
    }
    case 'form':
      return (
        <form {...interactiveProps} onSubmit={(e) => e.preventDefault()}>
          {children}
        </form>
      );
    case 'formField': {
      const fieldType = (element.props?.fieldType as string) || 'text';
      const label = (element.props?.label as string) || 'Field';
      const placeholder = (element.props?.placeholder as string) || '';
      return (
        <div {...interactiveProps}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>{label}</label>
          {fieldType === 'textarea' ? (
            <textarea placeholder={placeholder} style={{ width: '100%', padding: 8 }} rows={4} readOnly={isEditor} />
          ) : (
            <input type={fieldType} placeholder={placeholder} style={{ width: '100%', padding: 8 }} readOnly={isEditor} />
          )}
        </div>
      );
    }
    case 'productGrid': {
      const gridColumns =
        (baseStyle.gridTemplateColumns as string) || 'repeat(3, 1fr)';
      const gridGap = (baseStyle.gap as string) || '24px';
      const gridDisplay = (baseStyle.display as string) || 'grid';

      const gridStyle: React.CSSProperties = {
        ...baseStyle,
        display: gridDisplay,
        gridTemplateColumns: gridDisplay === 'grid' ? gridColumns : undefined,
        gap: gridDisplay === 'grid' ? gridGap : undefined,
        width: baseStyle.width || '100%',
        boxSizing: 'border-box',
      };

      const gridProps = isEditor
        ? {
            'data-element-id': element.id,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectElement?.(element.id);
            },
            onMouseEnter: () => onHoverElement?.(element.id),
            onMouseLeave: () => onHoverElement?.(null),
            style: {
              ...gridStyle,
              outline: editorOutline(element.id, selectedElementId, hoveredElementId),
              outlineOffset: '2px',
              cursor: 'pointer',
            } as React.CSSProperties,
          }
        : { style: gridStyle };

      return (
        <div
          {...gridProps}
          data-product-grid={element.id}
          data-grid-columns={gridColumns}
          data-grid-gap={gridGap}
        >
          <ProductGridCards
            products={products}
            resolveImageSrc={resolveProductImageSrc}
            onAddToCart={isEditor ? undefined : onAddToCart}
            mode={mode}
          />
        </div>
      );
    }
    case 'cartIcon': {
      const pageSlug = editorPageSlug || 'cart';
      const count = cartCount ?? 0;

      if (isEditor) {
        return (
          <CartIconView
            count={count}
            style={{
              ...baseStyle,
              outline: editorOutline(element.id, selectedElementId, hoveredElementId),
              outlineOffset: '2px',
              cursor: 'pointer',
            }}
            interactiveProps={{
              'data-element-id': element.id,
              'data-cart-icon': 'true',
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onSelectElement?.(element.id);
              },
              onMouseEnter: () => onHoverElement?.(element.id),
              onMouseLeave: () => onHoverElement?.(null),
            }}
          />
        );
      }

      return (
        <CartIconView
          count={count}
          style={baseStyle}
          href={linkHref}
          pageSlug={pageSlug}
          interactiveProps={{ 'data-cart-icon': 'true', 'data-page-slug': pageSlug }}
          onClick={() => {
            if (pageSlug) onNavigatePage?.(pageSlug);
          }}
        />
      );
    }
    case 'cartList': {
      const listProps = isEditor
        ? {
            'data-element-id': element.id,
            'data-cart-list': element.id,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectElement?.(element.id);
            },
            onMouseEnter: () => onHoverElement?.(element.id),
            onMouseLeave: () => onHoverElement?.(null),
            style: {
              ...baseStyle,
              outline: editorOutline(element.id, selectedElementId, hoveredElementId),
              outlineOffset: '2px',
              cursor: 'pointer',
            } as React.CSSProperties,
          }
        : { style: baseStyle, 'data-cart-list': element.id };

      return (
        <div {...listProps}>
          <CartListView
            items={cartItems ?? []}
            resolveImageSrc={resolveProductImageSrc}
            onQuantityChange={onCartQuantityChange}
            onRemove={onCartRemove}
            interactive={!isEditor}
          />
        </div>
      );
    }
    case 'cartSummary': {
      const summaryProps = isEditor
        ? {
            'data-element-id': element.id,
            'data-cart-summary': element.id,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectElement?.(element.id);
            },
            onMouseEnter: () => onHoverElement?.(element.id),
            onMouseLeave: () => onHoverElement?.(null),
            style: {
              ...baseStyle,
              outline: editorOutline(element.id, selectedElementId, hoveredElementId),
              outlineOffset: '2px',
              cursor: 'pointer',
            } as React.CSSProperties,
          }
        : { style: baseStyle, 'data-cart-summary': element.id };

      return (
        <div {...summaryProps}>
          <CartSummaryView items={cartItems ?? []} onCheckout={onCheckout} />
        </div>
      );
    }
    case 'divider':
      return <hr {...interactiveProps} />;
    case 'spacer':
      return <div {...interactiveProps} />;
    default:
      return <div {...interactiveProps}>{children}</div>;
  }
}

export function Renderer({
  root,
  breakpoint,
  mode = 'public',
  siteSlug,
  selectedElementId,
  hoveredElementId,
  onSelectElement,
  onHoverElement,
  onNavigatePage,
  products,
  resolveProductImageSrc,
  cartItems,
  cartCount,
  onAddToCart,
  onCartQuantityChange,
  onCartRemove,
  onCheckout,
}: RendererProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100%' }}>
      {root.map((element) => (
        <ElementNode
          key={element.id}
          element={element}
          breakpoint={breakpoint}
          mode={mode}
          siteSlug={siteSlug}
          selectedElementId={selectedElementId}
          hoveredElementId={hoveredElementId}
          onSelectElement={onSelectElement}
          onHoverElement={onHoverElement}
          onNavigatePage={onNavigatePage}
          products={products}
          resolveProductImageSrc={resolveProductImageSrc}
          cartItems={cartItems}
          cartCount={cartCount}
          onAddToCart={onAddToCart}
          onCartQuantityChange={onCartQuantityChange}
          onCartRemove={onCartRemove}
          onCheckout={onCheckout}
        />
      ))}
    </div>
  );
}
