import type { User } from '../api/auth';

export function getWorkspaceName(user: User) {
  const firstName = user.name.trim().split(/\s+/)[0] || 'My';
  return `${firstName}'s Workspace`;
}

export function getWorkspaceSlug(user: User) {
  return getWorkspaceName(user)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildDashboardUrl(user: User, params?: { create?: boolean; tab?: string }) {
  const search = new URLSearchParams({
    workspace: getWorkspaceSlug(user),
    tab: params?.tab ?? 'sites',
  });
  if (params?.create) search.set('create', '1');
  return `/dashboard?${search.toString()}`;
}
