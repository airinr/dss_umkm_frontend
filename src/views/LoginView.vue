<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth.js'

const router = useRouter()

const role = ref('pusat')
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref({})
const loading = ref(false)

function validate() {
  errors.value = {}
  if (!username.value) errors.value.username = 'Username harus diisi'
  if (!password.value) errors.value.password = 'Password harus diisi'
  return Object.keys(errors.value).length === 0
}

async function handleLogin() {
  if (!validate()) return

  loading.value = true
  errors.value = {}

  try {
    await auth.login(username.value, password.value)
    const redirect = auth.user?.role === 'cabang' ? '/admin/cabang/transaksi' : '/admin/pusat/dashboard'
    router.push(redirect)
  } catch (e) {
    errors.value.form = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark items-center justify-center">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-72 h-72 border border-secondary/30 rounded-full"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 border border-secondary/20 rounded-full"></div>
        <div class="absolute top-1/3 right-1/4 w-48 h-48 border border-secondary/10 rounded-full"></div>
      </div>
      <div class="relative z-10 text-center px-12">
        <div class="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg class="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <h1 class="text-5xl font-heading font-bold text-white mb-2">B.A.R.I.S.T.A.</h1>
        <p class="text-base text-white/60 max-w-md mx-auto leading-relaxed">Big data Analytics for Retail Intelligence, Security, Transaction, and Analysis</p>
        <p class="text-xl text-secondary/80 font-heading italic mt-6">Mulai harimu dengan secangkir kopi</p>
        <div class="mt-12 space-y-3">
          <div class="flex items-center gap-3 text-white/60 text-sm">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Kelola seluruh cabang dalam satu platform</span>
          </div>
          <div class="flex items-center gap-3 text-white/60 text-sm">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Pantau stok dan penjualan secara real-time</span>
          </div>
          <div class="flex items-center gap-3 text-white/60 text-sm">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Laporan keuangan terintegrasi</span>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <div class="lg:hidden w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <h2 class="text-3xl font-heading font-bold text-text">Selamat Datang</h2>
          <p class="text-text-muted mt-2">Silakan masuk ke akun Anda</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="errors.form" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
            {{ errors.form }}
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Login sebagai</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="role = 'pusat'"
                :class="[
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                  role === 'pusat'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border text-text-muted hover:border-primary/30 hover:text-text'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Admin
              </button>
              <button
                type="button"
                @click="role = 'cabang'"
                :class="[
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                  role === 'cabang'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border text-text-muted hover:border-primary/30 hover:text-text'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cabang
              </button>
            </div>
            <p v-if="role === 'cabang'" class="mt-2 text-xs text-text-muted flex items-center gap-1">
              <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Akun cabang didaftarkan oleh admin pusat. Hubungi admin jika belum memiliki akun.
            </p>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-text mb-2">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              :class="[
                'w-full px-4 py-3 rounded-xl border-2 bg-surface text-text placeholder-text-muted/50 outline-none transition-all duration-200',
                errors.username ? 'border-danger' : 'border-border focus:border-primary'
              ]"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-danger">{{ errors.username }}</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-text mb-2">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 bg-surface text-text placeholder-text-muted/50 outline-none transition-all duration-200 pr-12',
                  errors.password ? 'border-danger' : 'border-border focus:border-primary'
                ]"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-1"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-danger">{{ errors.password }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <p class="mt-8 text-center text-xs text-text-muted">
          &copy; 2026 B.A.R.I.S.T.A. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
