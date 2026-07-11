import type { CSSProperties } from 'react';
import { formatMoney, type CartItem } from '../../store/cartStore';

interface CartListViewProps {
  items: CartItem[];
  resolveImageSrc?: (imageUrl: string) => string;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
  interactive?: boolean;
}

export function CartListView({
  items,
  resolveImageSrc = (url) => url,
  onQuantityChange,
  onRemove,
  interactive = true,
}: CartListViewProps) {
  if (!items.length) {
    return (
      <div
        style={{
          padding: '32px 20px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 14,
          border: '1px dashed #cbd5e1',
          borderRadius: 12,
          background: '#fff',
        }}
      >
        Your cart is empty. Add products from the shop.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      {items.map((item) => {
        const imageSrc = item.imageUrl ? resolveImageSrc(item.imageUrl) : '';
        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              background: '#fff',
              alignItems: 'center',
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={item.title}
                style={{
                  width: 72,
                  height: 72,
                  objectFit: 'cover',
                  borderRadius: 8,
                  background: '#f1f5f9',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  background: '#f1f5f9',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                {formatMoney(item.price)} each
              </div>
              {interactive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => onQuantityChange?.(item.id, item.quantity - 1)}
                    style={qtyBtnStyle}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontSize: 14 }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                    style={qtyBtnStyle}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove?.(item.id)}
                    style={{
                      marginLeft: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#ef4444',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Qty: {item.quantity}</div>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
              {formatMoney(item.price * item.quantity)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const qtyBtnStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
};
