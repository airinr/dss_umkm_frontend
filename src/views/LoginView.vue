<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth.js'

const router = useRouter()

const role = ref('pusat')
const email = ref('')
const password = ref('')
const remember = ref(false)
const errors = ref({})

function validate() {
  errors.value = {}
  if (!email.value) errors.value.email = 'Email harus diisi'
  if (!password.value) errors.value.password = 'Password harus diisi'
  return Object.keys(errors.value).length === 0
}

function handleLogin() {
  if (!validate()) return

  const success = auth.login(email.value, password.value, role.value)
  if (success) {
    router.push('/admin/dashboard')
  } else {
    errors.value.form = auth.errors.form
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
        <h1 class="text-5xl font-heading font-bold text-white mb-4">Coffee Shop</h1>
        <p class="text-xl text-secondary/80 font-heading italic">Mulai harimu dengan secangkir kopi</p>
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
                Pusat
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
              Akun cabang didaftarkan oleh pusat. Hubungi admin jika belum memiliki akun.
            </p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-text mb-2">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="contoh@email.com"
              :class="[
                'w-full px-4 py-3 rounded-xl border-2 bg-surface text-text placeholder-text-muted/50 outline-none transition-all duration-200',
                errors.email ? 'border-danger' : 'border-border focus:border-primary'
              ]"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-danger">{{ errors.email }}</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-text mb-2">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Masukkan password"
              :class="[
                'w-full px-4 py-3 rounded-xl border-2 bg-surface text-text placeholder-text-muted/50 outline-none transition-all duration-200',
                errors.password ? 'border-danger' : 'border-border focus:border-primary'
              ]"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-danger">{{ errors.password }}</p>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="remember"
                class="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span class="text-sm text-text-muted">Ingat saya</span>
            </label>
            <a href="#" class="text-sm text-secondary-dark hover:text-primary transition-colors">Lupa password?</a>
          </div>

          <button
            type="submit"
            class="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            Masuk
          </button>
        </form>

        <p class="mt-8 text-center text-xs text-text-muted">
          &copy; 2026 Coffee Shop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
