import { api } from './api';

export type User = {
  userId: string;
  email: string;
  name: string;
};

export async function register(input: { email: string; password: string; name: string }) {
  return api<{ user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function login(input: { email: string; password: string }) {
  return api<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function me() {
  return api<{ user: User }>('/auth/me');
}

export async function updateProfile(input: { name: string }) {
  return api<{ user: User }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function logout() {
  return api<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}
