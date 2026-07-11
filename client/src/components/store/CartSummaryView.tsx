import { formatMoney, type CartItem } from '../../store/cartStore';

interface CartSummaryViewProps {
  items: CartItem[];
  onCheckout?: () => void;
}

export function CartSummaryView({ items, onCheckout }: CartSummaryViewProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Order Summary</h3>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                fontSize: 13,
                color: '#475569',
              }}
            >
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>{item.title}</span>
                <span style={{ display: 'block', marginTop: 2, color: '#94a3b8' }}>
                  {formatMoney(item.price || 0)} × {item.quantity}
                </span>
              </span>
              <span style={{ flexShrink: 0, fontWeight: 600, color: '#0f172a' }}>
                {formatMoney((item.price || 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b' }}>
        <span>Items ({itemCount})</span>
        <span>{formatMoney(subtotal)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b' }}>
        <span>Shipping</span>
        <span>{items.length ? 'Free' : '—'}</span>
      </div>
      <div
        style={{
          height: 1,
          background: '#e2e8f0',
          width: '100%',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
        <span>Total</span>
        <span>{formatMoney(total)}</span>
      </div>
      <button
        type="button"
        disabled={!items.length}
        onClick={onCheckout}
        style={{
          marginTop: 8,
          width: '100%',
          border: 'none',
          borderRadius: 10,
          background: items.length ? '#0f172a' : '#94a3b8',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          padding: '12px 16px',
          cursor: items.length ? 'pointer' : 'not-allowed',
        }}
      >
        Proceed to Checkout
      </button>
      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
        Totals use each product&apos;s price × quantity from your cart.
      </p>
    </div>
  );
}
