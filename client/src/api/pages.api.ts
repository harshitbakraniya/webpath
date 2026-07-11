import { api } from './api';
import type { PageDocument, PageElement, SiteDocument, SiteLayout, SitePageSummary } from '../types/page';

export async function createSite(name: string) {
  return api<SiteDocument>('/sites', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function listSites() {
  return api<SiteDocument[]>('/sites');
}

export async function deleteSite(siteId: string) {
  return api<{ deleted: boolean }>(`/sites/${siteId}`, { method: 'DELETE' });
}

export async function createPage(
  siteId: string,
  input: {
    templateId: string;
    slug: string;
    title?: string;
    addToNav?: boolean;
    navLabel?: string;
  },
) {
  return api<PageDocument>(`/sites/${siteId}/pages`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getPageById(siteId: string, pageId: string) {
  return api<PageDocument>(`/sites/${siteId}/pages/by-id/${pageId}`);
}

export async function updatePage(siteId: string, pageId: string, input: { root: PageElement[]; version?: number }) {
  return api<PageDocument>(`/sites/${siteId}/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function publishSite(siteId: string) {
  return api<SiteDocument>(`/sites/${siteId}/publish`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function listPages(siteId: string) {
  return api<SitePageSummary[]>(`/sites/${siteId}/pages`);
}

export async function getSiteLayout(siteId: string) {
  return api<SiteLayout>(`/sites/${siteId}/layout`);
}

export async function updateSiteLayout(siteId: string, layout: Partial<SiteLayout>) {
  return api<SiteLayout>(`/sites/${siteId}/layout`, {
    method: 'PATCH',
    body: JSON.stringify(layout),
  });
}

export async function getPublishedSite(slugOrDomain: string, pageSlug?: string) {
  const path = pageSlug
    ? `/public/${slugOrDomain}/pages/${pageSlug}`
    : `/public/${slugOrDomain}`;
  return api<{ site: SiteDocument; page: PageDocument | null; layout: SiteLayout }>(path);
}
