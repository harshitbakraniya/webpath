import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Search, Store, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import * as storeApi from '../../../api/store.api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { Product, StoreManagerView } from '../../../types/store';
import { AddProductModal } from './AddProductModal';
import { cn } from '../../../lib/utils';

interface StoreManagerModalProps {
  open: boolean;
  siteId: string;
  storeName: string;
  initialView: StoreManagerView;
  onClose: () => void;
  onProductsChanged?: () => void;
}

export function StoreManagerModal({
  open,
  siteId,
  storeName,
  initialView,
  onClose,
  onProductsChanged,
}: StoreManagerModalProps) {
  const [view, setView] = useState<StoreManagerView>(initialView);
  const [productsOpen, setProductsOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formOpen = addOpen || Boolean(editingProduct);

  const loadProducts = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await storeApi.listProducts(siteId, { page, limit: 10, search: search || undefined });
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [siteId, page, search]);

  useEffect(() => {
    if (!open || view !== 'products-list') return;
    void loadProducts();
  }, [open, view, loadProducts]);

  useEffect(() => {
    if (open) {
      setView(initialView);
      setAddOpen(false);
      setEditingProduct(null);
    }
  }, [open, initialView]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !formOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, formOpen, onClose]);

  const notifyProductsChanged = () => {
    onProductsChanged?.();
  };

  const handleAddProduct = async (input: { title: string; description: string; price: number; image: File | null }) => {
    setSaving(true);
    try {
      await storeApi.createProduct(siteId, input);
      toast.success('Product added');
      setAddOpen(false);
      setPage(1);
      await loadProducts();
      notifyProductsChanged();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = async (input: { title: string; description: string; price: number; image: File | null }) => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await storeApi.updateProduct(siteId, editingProduct.id, input);
      toast.success('Product updated');
      setEditingProduct(null);
      await loadProducts();
      notifyProductsChanged();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete "${product.title}"?`)) return;
    setDeletingId(product.id);
    try {
      await storeApi.deleteProduct(siteId, product.id);
      toast.success('Product deleted');
      await loadProducts();
      notifyProductsChanged();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close store manager"
        onClick={() => {
          if (!formOpen) onClose();
        }}
      />

      <div className="relative flex h-[min(920px,calc(100vh-1.5rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--e-border)] bg-[var(--e-bg)] shadow-2xl sm:h-[min(920px,calc(100vh-2.5rem))] md:h-[min(920px,calc(100vh-3rem))]">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--e-border)] bg-[var(--e-surface)] px-4">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[var(--e-text-muted)]" />
            <span className="text-sm font-medium text-[var(--e-text)]">Store Manager</span>
            <span className="text-xs text-[var(--e-text-subtle)]">· {storeName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-52 shrink-0 flex-col border-r border-[var(--e-border)] bg-[var(--e-surface)] p-3 sm:w-56">
            <p className="mb-2 px-2 text-[10px] uppercase tracking-wide text-[var(--e-text-subtle)]">Manage</p>
            <button
              type="button"
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[var(--e-text)] hover:bg-[var(--e-hover)]"
            >
              {productsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Products
            </button>
            {productsOpen && (
              <div className="ml-3 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setView('products-list')}
                  className={cn(
                    'flex w-full rounded-md px-3 py-2 text-left text-xs',
                    view === 'products-list'
                      ? 'bg-[var(--e-accent)] text-white'
                      : 'text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]',
                  )}
                >
                  Product List
                </button>
                <button
                  type="button"
                  onClick={() => setView('categories')}
                  className={cn(
                    'flex w-full rounded-md px-3 py-2 text-left text-xs',
                    view === 'categories'
                      ? 'bg-[var(--e-accent)] text-white'
                      : 'text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]',
                  )}
                >
                  Categories
                </button>
              </div>
            )}
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--e-bg)] p-4 sm:p-6">
            {view === 'products-list' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--e-text)]">Product List</h2>
                    <p className="text-xs text-[var(--e-text-subtle)]">{total} products</p>
                  </div>
                  <Button type="button" onClick={() => setAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--e-text-subtle)]" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search products…"
                    className="border-[var(--e-border)] bg-[var(--e-surface)] pl-9"
                  />
                </div>

                <div className="overflow-hidden rounded-lg border border-[var(--e-border)] bg-[var(--e-surface)]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--e-border)] bg-[var(--e-surface-2)] text-xs uppercase text-[var(--e-text-muted)]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Image</th>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium text-right">Price</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[var(--e-text-subtle)]">
                            Loading…
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[var(--e-text-subtle)]">
                            No products yet. Add your first product.
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} className="border-b border-[var(--e-border)] last:border-0">
                            <td className="px-4 py-3">
                              {product.hasImage || product.imageUrl ? (
                                <img
                                  src={storeApi.productImageSrc(product.imageUrl)}
                                  alt={product.title}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--e-surface-2)] text-[10px] text-[var(--e-text-subtle)]">
                                  N/A
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-[var(--e-text)]">{product.title}</td>
                            <td className="max-w-md truncate px-4 py-3 text-[var(--e-text-muted)]">
                              {product.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[var(--e-text)]">
                              {new Intl.NumberFormat(undefined, {
                                style: 'currency',
                                currency: 'USD',
                              }).format(product.price ?? 0)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => {
                                    setAddOpen(false);
                                    setEditingProduct(product);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-red-600 hover:text-red-700"
                                  disabled={deletingId === product.id}
                                  onClick={() => void handleDeleteProduct(product)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-[var(--e-text-muted)]">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-lg font-semibold text-[var(--e-text)]">Categories</h2>
                <p className="mt-2 max-w-sm text-sm text-[var(--e-text-subtle)]">
                  Category management is coming soon.
                </p>
              </div>
            )}
          </main>
        </div>

        <AddProductModal
          nested
          open={formOpen}
          saving={saving}
          product={editingProduct}
          onOpenChange={(next) => {
            if (!next) {
              setAddOpen(false);
              setEditingProduct(null);
            }
          }}
          onSubmit={(input) => {
            if (editingProduct) void handleEditProduct(input);
            else void handleAddProduct(input);
          }}
        />
      </div>
    </div>
  );
}
