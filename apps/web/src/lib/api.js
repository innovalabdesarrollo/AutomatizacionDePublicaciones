import { apiUrl } from './config.js';

async function parse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function opts(init = {}) {
  return {
    credentials: 'include',
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers
    }
  };
}

export async function register(body) {
  return parse(await fetch(apiUrl('/api/auth/register'), opts({ method: 'POST', body: JSON.stringify(body) })));
}

export async function login(body) {
  return parse(await fetch(apiUrl('/api/auth/login'), opts({ method: 'POST', body: JSON.stringify(body) })));
}

export async function logout() {
  return parse(await fetch(apiUrl('/api/auth/logout'), opts({ method: 'POST', body: '{}' })));
}

export async function me() {
  return parse(await fetch(apiUrl('/api/auth/me'), opts()));
}

export async function listRequests() {
  return parse(await fetch(apiUrl('/api/requests'), opts()));
}

export async function getRequest(id) {
  return parse(await fetch(apiUrl(`/api/requests/${id}`), opts()));
}

export async function createRequest(formData) {
  return parse(
    await fetch(apiUrl('/api/requests'), {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
  );
}

export async function updateRequest(id, body) {
  return parse(
    await fetch(apiUrl(`/api/requests/${id}`), opts({ method: 'PATCH', body: JSON.stringify(body) }))
  );
}

export async function startResearch(id) {
  return parse(await fetch(apiUrl(`/api/requests/${id}/research`), opts({ method: 'POST', body: '{}' })));
}

export async function updateSheet(id, body) {
  return parse(
    await fetch(apiUrl(`/api/requests/${id}/sheet`), opts({ method: 'PATCH', body: JSON.stringify(body) }))
  );
}

export async function saveInternal(id, body) {
  return parse(
    await fetch(apiUrl(`/api/requests/${id}/internal`), opts({ method: 'PUT', body: JSON.stringify(body) }))
  );
}

export async function sendShopify(id) {
  return parse(
    await fetch(
      apiUrl(`/api/requests/${id}/shopify`),
      opts({ method: 'POST', body: JSON.stringify({ confirm: true }) })
    )
  );
}

export async function retry(id, action) {
  return parse(
    await fetch(
      apiUrl(`/api/requests/${id}/retry`),
      opts({ method: 'POST', body: JSON.stringify({ action }) })
    )
  );
}

export async function deleteImage(requestId, imageId) {
  return parse(
    await fetch(apiUrl(`/api/requests/${requestId}/images/${imageId}`), opts({ method: 'DELETE' }))
  );
}

export async function adminListRoles() {
  return parse(await fetch(apiUrl('/api/admin/roles'), opts()));
}

export async function adminCreateRole(body) {
  return parse(
    await fetch(apiUrl('/api/admin/roles'), opts({ method: 'POST', body: JSON.stringify(body) }))
  );
}

export async function adminDeleteRole(id) {
  return parse(await fetch(apiUrl(`/api/admin/roles/${id}`), opts({ method: 'DELETE' })));
}

export async function adminListUsers() {
  return parse(await fetch(apiUrl('/api/admin/users'), opts()));
}

export async function adminUpdateUser(id, body) {
  return parse(
    await fetch(apiUrl(`/api/admin/users/${id}`), opts({ method: 'PATCH', body: JSON.stringify(body) }))
  );
}
