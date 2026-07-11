import type { CSSProperties } from 'react';

const cartBagPath =
  'M6 6h15l-1.5 9h-12z M6 6L5 3H2 M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z';

interface CartIconViewProps {
  count: number;
  style?: CSSProperties;
  href?: string;
  pageSlug?: string;
  onClick?: () => void;
  interactiveProps?: Record<string, unknown>;
}

export function CartIconView({
  count,
  style,
  href,
  pageSlug,
  onClick,
  interactiveProps = {},
}: CartIconViewProps) {
  const content = (
    <>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={cartBagPath} />
      </svg>
      {count > 0 && (
        <span
          data-cart-badge="true"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: '#ef4444',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </>
  );

  const mergedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    textDecoration: 'none',
    color: 'inherit',
    ...style,
  };

  if (href) {
    return (
      <a
        href={href}
        {...interactiveProps}
        style={mergedStyle}
        data-page-slug={pageSlug}
        aria-label={`Cart (${count} items)`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      {...interactiveProps}
      onClick={onClick}
      style={{ ...mergedStyle, border: 'none', background: style?.backgroundColor || 'transparent' }}
      data-page-slug={pageSlug}
      aria-label={`Cart (${count} items)`}
    >
      {content}
    </button>
  );
}
