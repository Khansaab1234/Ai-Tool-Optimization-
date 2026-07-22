// lib/api.js — tiny API client for the ASET TRONICS backend.
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  base: BASE,
  health: () => request('/health'),
  meta: () => request('/meta'),
  dashboard: () => request('/dashboard'),
  projects: () => request('/projects'),
  project: (id) => request(`/projects/${id}`),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  operations: (projectId) => request(`/operations${projectId ? `?projectId=${projectId}` : ''}`),
  tools: (q = '') => request(`/tools${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  part: () => request('/part'),
  materials: () => request('/calculator/materials'),
  milling: (body) => request('/calculator/milling', { method: 'POST', body: JSON.stringify(body) }),
  turning: (body) => request('/calculator/turning', { method: 'POST', body: JSON.stringify(body) }),
  drilling: (body) => request('/calculator/drilling', { method: 'POST', body: JSON.stringify(body) }),
  optimize: (body = {}) => request('/optimize', { method: 'POST', body: JSON.stringify(body) }),
  generateCnc: (body = {}) => request('/cnc/generate', { method: 'POST', body: JSON.stringify(body) }),
  ppc: () => request('/ppc'),
  reports: () => request('/reports'),
  assistant: (message) => request('/assistant', { method: 'POST', body: JSON.stringify({ message }) }),
};

export default api;
