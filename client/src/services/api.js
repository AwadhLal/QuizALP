const BASE = import.meta.env.VITE_API_URL || '';
export const getToken = () => localStorage.getItem('qa_token');
export const setToken = t => (t ? localStorage.setItem('qa_token', t) : localStorage.removeItem('qa_token'));
export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { ...(body && { 'Content-Type': 'application/json' }), ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
      body: body && JSON.stringify(body),
    });
  } catch { throw new Error('Cannot reach the server. Check your connection and try again.'); }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed.'), { status: res.status });
  return data;
}
