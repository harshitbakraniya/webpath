import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartState {
  siteKey: string | null;
  items: CartItem[];
  setSiteKey: (siteKey: string) => void;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      siteKey: null,
      items: [],

      setSiteKey: (siteKey) => {
        const current = get().siteKey;
        if (current && current !== siteKey) {
          set({ siteKey, items: [] });
          return;
        }
        set({ siteKey });
      },

      addItem: (product, quantity = 1) => {
        const qty = Math.max(1, quantity);
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + qty, price: product.price, title: product.title, imageUrl: product.imageUrl }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: qty,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          ),
        }));
      },

      clear: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'webpath-cart',
      partialize: (state) => ({ siteKey: state.siteKey, items: state.items }),
    },
  ),
);

export function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}
