import { api } from './api';
import type { TemplateKey } from '../constants/templates';

export type Store = {
  _id: string;
  name: string;
  slug: string;
  templateKey: TemplateKey;
  ownerUserId: string;
};

export async function getMyStore() {
  return api<{ store: Store | null }>('/stores/me');
}

export async function createStore(input: { name: string; templateKey: TemplateKey }) {
  return api<{ store: Store }>('/stores', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
