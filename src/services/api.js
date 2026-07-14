const API = import.meta.env.VITE_API_BASE_URL

function getToken() {
  const saved = localStorage.getItem('coffee_user')
  if (!saved) return null
  try {
    return JSON.parse(saved).access_token || null
  } catch {
    return null
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.detail || `Error ${res.status}`)
  }

  return res.json()
}
