import { writable } from 'svelte/store';
import { me, logout as apiLogout } from './api.js';

export const user = writable(null);
export const authReady = writable(false);

export async function loadSession() {
  try {
    const data = await me();
    user.set(data.user);
    return data.user;
  } catch {
    user.set(null);
    return null;
  } finally {
    authReady.set(true);
  }
}

export async function signOut() {
  try {
    await apiLogout();
  } finally {
    user.set(null);
  }
}
