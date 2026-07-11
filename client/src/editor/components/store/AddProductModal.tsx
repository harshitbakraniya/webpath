import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import * as storeApi from '../../../api/store.api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { Product } from '../../../types/store';
import { cn } from '../../../lib/utils';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface AddProductModalProps {
  open: boolean;
  saving: boolean;
  product?: Product | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { title: string; description: string; price: number; image: File | null }) => void;
  nested?: boolean;
}

export function AddProductModal({
  open,
  saving,
  product = null,
  onOpenChange,
  onSubmit,
  nested = false,
}: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(product);

  const clearPreview = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('0');
    setImageFile(null);
    clearPreview();
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice(String(product.price ?? 0));
      setImageFile(null);
      setImageError(null);
      if (product.hasImage && product.imageUrl) {
        setImagePreview(storeApi.productImageSrc(product.imageUrl));
      } else {
        clearPreview();
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      resetForm();
    }
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleImageSelect = (file: File | null) => {
    setImageError(null);
    if (!file) {
      setImageFile(null);
      if (product?.hasImage && product.imageUrl) {
        setImagePreview(storeApi.productImageSrc(product.imageUrl));
      } else {
        clearPreview();
      }
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Use JPEG, PNG, WebP, or GIF');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 5 MB or smaller');
      return;
    }

    clearPreview();
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: Math.round(parsedPrice * 100) / 100,
      image: imageFile,
    });
  };

  if (!open) return null;

  const panel = (
    <div
      className={cn(
        'relative w-full max-w-md rounded-xl border border-[var(--e-border)] bg-[var(--e-surface)] shadow-2xl',
        nested && 'mx-4',
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="flex items-center justify-between border-b border-[var(--e-border)] px-5 py-4">
        <h2 id="product-form-title" className="text-lg font-semibold text-[var(--e-text)]">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="space-y-2">
          <Label htmlFor="product-title">Title</Label>
          <Input
            id="product-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product name"
            required
            autoFocus
            className="border-[var(--e-border)] bg-[var(--e-surface-2)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-description">Description</Label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={3}
            className="flex w-full rounded-md border border-[var(--e-border)] bg-[var(--e-surface-2)] px-3 py-2 text-sm text-[var(--e-text)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price">Price (USD)</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29.99"
            required
            className="border-[var(--e-border)] bg-[var(--e-surface-2)]"
          />
          <p className="text-[11px] text-[var(--e-text-subtle)]">
            This price shows on product cards and in the cart summary.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Product image</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
          />

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-lg border border-[var(--e-border)] bg-[var(--e-surface-2)]">
              <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover" />
              <button
                type="button"
                onClick={() => handleImageSelect(null)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/75"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--e-border)] bg-[var(--e-surface-2)] px-4 py-8 text-[var(--e-text-muted)] transition-colors hover:border-[var(--e-accent)] hover:text-[var(--e-text)]"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">Choose image from computer</span>
              <span className="text-xs text-[var(--e-text-subtle)]">JPEG, PNG, WebP, GIF · max 5 MB</span>
            </button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? 'Replace image' : 'Browse files'}
          </Button>

          {imageError && <p className="text-xs text-red-500">{imageError}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !title.trim() || !Number.isFinite(Number(price)) || Number(price) < 0}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </div>
  );

  if (nested) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/45">
        {panel}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close product form"
        onClick={handleClose}
      />
      <div className="relative z-10">{panel}</div>
    </div>
  );
}
