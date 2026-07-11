import { api, API_BASE_URL } from './api';
import type { CreateStoreResponse, Product, ProductListResponse, SiteStore } from '../types/store';

export function productImageSrc(imageUrl: string) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  return `${API_BASE_URL}${imageUrl}`;
}

export async function getSiteStore(siteId: string) {
  const res = await api<{ store: SiteStore | null }>(`/sites/${siteId}/store`);
  return res?.store ?? null;
}

export async function createSiteStore(siteId: string) {
  return api<CreateStoreResponse>(`/sites/${siteId}/store`, { method: 'POST' });
}

export async function listProducts(
  siteId: string,
  params: { page?: number; limit?: number; search?: string } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return api<ProductListResponse>(`/sites/${siteId}/products${qs ? `?${qs}` : ''}`);
}

export async function createProduct(
  siteId: string,
  input: { title: string; description?: string; price?: number; image?: File | null },
) {
  const form = new FormData();
  form.append('title', input.title);
  if (input.description) form.append('description', input.description);
  form.append('price', String(input.price ?? 0));
  if (input.image) form.append('image', input.image);

  return api<Product>(`/sites/${siteId}/products`, {
    method: 'POST',
    body: form,
  });
}

export async function updateProduct(
  siteId: string,
  productId: string,
  input: { title?: string; description?: string; price?: number; image?: File | null },
) {
  const form = new FormData();
  if (input.title !== undefined) form.append('title', input.title);
  if (input.description !== undefined) form.append('description', input.description);
  if (input.price !== undefined) form.append('price', String(input.price));
  if (input.image) form.append('image', input.image);

  return api<Product>(`/sites/${siteId}/products/${productId}`, {
    method: 'PATCH',
    body: form,
  });
}

export async function deleteProduct(siteId: string, productId: string) {
  return api<{ deleted: boolean }>(`/sites/${siteId}/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function listAllProducts(siteId: string) {
  return listProducts(siteId, { page: 1, limit: 50 });
}

export async function listPublicProducts(siteSlug: string) {
  return api<ProductListResponse>(`/public/${siteSlug}/products`);
}

export async function listCategories(siteId: string) {
  return api<{ id: string; siteId: string; name: string; slug: string }[]>(
    `/sites/${siteId}/categories`,
  );
}
