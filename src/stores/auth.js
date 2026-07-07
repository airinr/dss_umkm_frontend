import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const savedUser = localStorage.getItem('coffee_user')
const parsed = savedUser ? JSON.parse(savedUser) : null

export const auth = reactive({
  user: parsed,
  errors: {},

  login(email, password, role) {
    this.errors = {}

    if (!email || !password) {
      this.errors.form = 'Email dan password harus diisi'
      return false
    }

    if (role === 'pusat') {
      if (email === 'admin@gmail.com' && password === 'admin') {
        this.user = { email, role, name: 'Admin Pusat' }
        localStorage.setItem('coffee_user', JSON.stringify(this.user))
        return true
      }
    } else {
      if (email && password) {
        this.user = { email, role, name: 'Admin Cabang' }
        localStorage.setItem('coffee_user', JSON.stringify(this.user))
        return true
      }
    }

    this.errors.form = 'Email atau password salah'
    return false
  },

  logout() {
    this.user = null
    localStorage.removeItem('coffee_user')
  },

  get isLoggedIn() {
    return this.user !== null
  },
})
