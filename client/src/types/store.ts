import type { PageDocument } from './page';

export interface SiteStore {
  id: string;
  siteId: string;
  productsPageId: string | null;
  cartPageId: string | null;
  name: string;
  slug: string;
  templateKey: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Product {
  id: string;
  siteId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  hasImage: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Category {
  id: string;
  siteId: string;
  name: string;
  slug: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStoreResponse {
  store: SiteStore;
  productsPage: PageDocument;
  cartPage?: PageDocument;
}

export type StoreManagerView = 'products-list' | 'categories';
