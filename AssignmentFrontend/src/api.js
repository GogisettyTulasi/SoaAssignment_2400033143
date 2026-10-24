const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Check that Spring Boot is running and CORS is configured.`);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!response.ok) {
    const validationMessage = data && typeof data === 'object'
      ? Object.values(data).find(value => typeof value === 'string')
      : null;
    const message = typeof data === 'string'
      ? data
      : validationMessage || data?.message || data?.detail || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const packageApi = {
  all: () => request('/displayAll'),
  byId: (id) => request(`/displayById/${encodeURIComponent(id)}`),
  add: (payload) => request('/addPackage', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/update/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};