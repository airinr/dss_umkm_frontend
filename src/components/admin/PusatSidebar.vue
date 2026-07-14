<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../../stores/auth.js'

const props = defineProps({ open: { type: Boolean, default: true } })
const emit = defineEmits(['close'])
const router = useRouter()
const route = useRoute()
const showLogoutModal = ref(false)

const menuItems = [
  { name: 'Dashboard', path: '/admin/pusat/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Kelola Cabang', path: '/admin/pusat/cabang', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
]

function confirmLogout() { showLogoutModal.value = true }
function handleLogout() {
  showLogoutModal.value = false
  auth.logout()
  router.push('/')
}
function navigate(path) {
  router.push(path)
  if (window.innerWidth < 1024) emit('close')
}
</script>

<template>
  <aside
    :class="['fixed left-0 top-0 h-screen bg-primary-dark flex flex-col z-50 transition-all duration-300', open ? 'translate-x-0' : '-translate-x-full']"
    style="width: 256px;"
  >
    <div class="px-6 py-8 border-b border-white/10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-white font-heading font-semibold text-lg truncate">B.A.R.I.S.T.A.</h2>
          <p class="text-white/50 text-xs">Pusat</p>
        </div>
      </div>
      <button @click="$emit('close')" class="lg:hidden text-white/60 hover:text-white p-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <button
        v-for="item in menuItems"
        :key="item.path"
        @click="navigate(item.path)"
        :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200', route.path === item.path ? 'bg-secondary/20 text-secondary' : 'text-white/60 hover:bg-white/5 hover:text-white']"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>
        {{ item.name }}
      </button>
    </nav>

    <div class="px-4 py-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-4 py-3">
        <div class="w-9 h-9 bg-secondary/30 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {{ auth.user?.username?.charAt(0)?.toUpperCase() || 'A' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm font-medium truncate">{{ auth.user?.username || 'Admin' }}</p>
          <p class="text-white/40 text-xs">Pusat</p>
        </div>
      </div>
      <button
        @click="confirmLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 mt-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar
      </button>
    </div>

    <div v-if="showLogoutModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" @click="showLogoutModal = false">
      <div class="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-xl" @click.stop>
        <div class="text-center">
          <div class="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-text mb-2">Yakin ingin keluar?</h3>
          <p class="text-sm text-text-muted mb-6">Anda akan kembali ke halaman login</p>
          <div class="flex gap-3">
            <button @click="showLogoutModal = false" class="flex-1 py-2.5 px-4 bg-cream/50 text-text font-medium rounded-xl hover:bg-cream transition-all">Batal</button>
            <button @click="handleLogout" class="flex-1 py-2.5 px-4 bg-danger text-white font-medium rounded-xl hover:bg-red-700 transition-all">Keluar</button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
