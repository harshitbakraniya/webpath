export interface ProductCardItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  hasImage?: boolean;
}

interface ProductGridCardsProps {
  products?: ProductCardItem[];
  emptyMessage?: string;
  resolveImageSrc?: (imageUrl: string) => string;
  onAddToCart?: (product: ProductCardItem) => void;
  mode?: 'editor' | 'public';
}

function formatPrice(price?: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(price ?? 0);
}

export function ProductGridCards({
  products = [],
  emptyMessage = 'No products yet. Add products in Store Manager.',
  resolveImageSrc = (url) => url,
  onAddToCart,
  mode = 'public',
}: ProductGridCardsProps) {
  if (!products.length) {
    return (
      <div
        style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '32px 16px',
          color: '#94a3b8',
          fontSize: 14,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {products.map((product) => {
        const imageSrc = product.imageUrl ? resolveImageSrc(product.imageUrl) : '';
        return (
          <article
            key={product.id}
            style={{
              width: '100%',
              minWidth: 0,
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.title}
                style={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  display: 'block',
                  background: '#f1f5f9',
                }}
              />
            ) : (
              <div
                style={{
                  height: 180,
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: 13,
                }}
              >
                No image
              </div>
            )}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                {product.title}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5, flex: 1 }}>
                {product.description || ' '}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {formatPrice(product.price)}
                </span>
                <button
                  type="button"
                  data-add-to-cart={mode === 'public' ? product.id : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mode === 'editor' || !onAddToCart) return;
                    onAddToCart(product);
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 12px',
                    cursor: mode === 'editor' ? 'default' : 'pointer',
                    pointerEvents: mode === 'editor' ? 'none' : 'auto',
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
