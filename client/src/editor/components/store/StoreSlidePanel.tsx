import { ChevronDown, ChevronRight, ShoppingBag, Store, X } from 'lucide-react';
import { useState } from 'react';
import type { SiteStore } from '../../../types/store';

interface StoreSlidePanelProps {
  open: boolean;
  store: SiteStore | null;
  loading: boolean;
  creating: boolean;
  onClose: () => void;
  onAddStore: () => void;
  onOpenShopPage: () => void;
  onOpenCartPage?: () => void;
  onOpenManager: (view: 'products-list' | 'categories') => void;
  isOnShopPage: boolean;
  isOnCartPage?: boolean;
}

export function StoreSlidePanel({
  open,
  store,
  loading,
  creating,
  onClose,
  onAddStore,
  onOpenShopPage,
  onOpenCartPage,
  onOpenManager,
  isOnShopPage,
  isOnCartPage,
}: StoreSlidePanelProps) {
  const [productsOpen, setProductsOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col border-r border-[var(--e-border)] bg-[var(--e-surface)] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--e-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-[var(--e-text-muted)]" />
          <span className="text-sm font-medium text-[var(--e-text)]">Store</span>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--e-text-subtle)] hover:text-[var(--e-text)]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <p className="text-xs text-[var(--e-text-subtle)]">Loading store…</p>
        ) : !store ? (
          <div className="flex flex-col items-center justify-center gap-3 px-2 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--e-surface-2)]">
              <ShoppingBag className="h-6 w-6 text-[var(--e-text-muted)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--e-text)]">No store yet</p>
              <p className="mt-1 text-xs text-[var(--e-text-subtle)]">
                Add a store to create a products page with your site theme.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddStore}
              disabled={creating}
              className="rounded-md bg-[var(--e-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--e-accent-hover)] disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Add Store'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onOpenManager('products-list')}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--e-accent)] px-3 py-2.5 text-sm font-medium text-white hover:bg-[var(--e-accent-hover)]"
            >
              <Store className="h-4 w-4" />
              Open Store Manager
            </button>

            <button
              type="button"
              onClick={() => onOpenShopPage()}
              className="flex w-full items-center justify-between rounded-lg border border-[var(--e-border)] px-3 py-2 text-left text-xs text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
            >
              <span>{isOnShopPage ? 'Viewing shop page' : 'Open shop page'}</span>
              {isOnShopPage && (
                <span className="rounded bg-[var(--e-accent)]/15 px-1.5 py-0.5 text-[10px] text-[var(--e-accent)]">
                  Current
                </span>
              )}
            </button>

            {onOpenCartPage && (
              <button
                type="button"
                onClick={() => onOpenCartPage()}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--e-border)] px-3 py-2 text-left text-xs text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
              >
                <span>{isOnCartPage ? 'Viewing cart page' : 'Open cart page'}</span>
                {isOnCartPage && (
                  <span className="rounded bg-[var(--e-accent)]/15 px-1.5 py-0.5 text-[10px] text-[var(--e-accent)]">
                    Current
                  </span>
                )}
              </button>
            )}

            {!isOnShopPage && (
              <p className="rounded-md bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
                Products appear on the shop page. Open it to preview your product cards.
              </p>
            )}

            <div className="space-y-1">
              <p className="px-1 text-[10px] uppercase tracking-wide text-[var(--e-text-subtle)]">Manage</p>

              <button
                type="button"
                onClick={() => setProductsOpen(!productsOpen)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[var(--e-text)] hover:bg-[var(--e-hover)]"
              >
                {productsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Products
              </button>

              {productsOpen && (
                <div className="ml-4 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenManager('products-list')}
                    className="flex w-full rounded-md px-3 py-2 text-left text-xs text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
                  >
                    Product List
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenManager('categories')}
                    className="flex w-full rounded-md px-3 py-2 text-left text-xs text-[var(--e-text-muted)] hover:bg-[var(--e-hover)] hover:text-[var(--e-text)]"
                  >
                    Categories
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
