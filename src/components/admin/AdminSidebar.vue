<script setup>
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../../stores/auth.js'

const router = useRouter()
const route = useRoute()

const menu = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
]

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-primary-dark flex flex-col z-50">
    <div class="px-6 py-8 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <div>
          <h2 class="text-white font-heading font-semibold text-lg">Coffee Shop</h2>
          <p class="text-white/50 text-xs">Management System</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1">
      <button
        v-for="item in menu"
        :key="item.path"
        @click="router.push(item.path)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
          route.path === item.path
            ? 'bg-secondary/20 text-secondary'
            : 'text-white/60 hover:bg-white/5 hover:text-white'
        ]"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>
        {{ item.name }}
      </button>
    </nav>

    <div class="px-4 py-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-4 py-3">
        <div class="w-9 h-9 bg-secondary/30 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {{ auth.user?.name?.charAt(0) || 'A' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm font-medium truncate">{{ auth.user?.name || 'Admin' }}</p>
          <p class="text-white/40 text-xs truncate">{{ auth.user?.email || '' }}</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 mt-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar
      </button>
    </div>
  </aside>
</template>
