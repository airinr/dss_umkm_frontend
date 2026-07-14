import { reactive } from 'vue'

const API = import.meta.env.VITE_API_BASE_URL

const saved = localStorage.getItem('coffee_user')
const parsed = saved ? JSON.parse(saved) : null

export const auth = reactive({
  user: parsed,
  loading: false,

  async login(username, password) {
    this.loading = true
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Username atau password salah')
      }

      const data = await res.json()
      const payload = { ...data.user, access_token: data.access_token }
      this.user = payload
      localStorage.setItem('coffee_user', JSON.stringify(payload))
      return true
    } catch (e) {
      throw e
    } finally {
      this.loading = false
    }
  },

  async register(username, password, cabang_id = null) {
    this.loading = true
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, cabang_id }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Registrasi gagal')
      }

      const data = await res.json()
      return data
    } catch (e) {
      throw e
    } finally {
      this.loading = false
    }
  },

  logout() {
    this.user = null
    localStorage.removeItem('coffee_user')
  },

  get isLoggedIn() {
    return this.user !== null
  },

  get token() {
    return this.user?.access_token || null
  },
})
