<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PusatSidebar from '../components/admin/PusatSidebar.vue'

const windowWidth = ref(window.innerWidth)
const sidebarOpen = ref(windowWidth.value >= 1024)
const isMobile = computed(() => windowWidth.value < 1024)

function onResize() { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <div v-if="sidebarOpen && isMobile" class="fixed inset-0 bg-black/40 z-40 lg:hidden" @click="sidebarOpen = false"></div>
    <PusatSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <main :class="['flex-1 flex flex-col min-h-screen transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-0']">
      <div class="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <button @click="toggleSidebar" class="p-2 rounded-xl hover:bg-cream/50 transition-colors">
          <svg class="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-heading font-semibold text-text">B.A.R.I.S.T.A.</span>
      </div>
      <div class="flex-1 p-4 lg:p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>
