<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  id: { type: [Number, String], required: true },
  cabangId: { type: [Number, String], required: true },
  nama: { type: String, required: true },
  lokasi: { type: String, required: true },
  periodeMinggu: { type: String, default: '-' },
  pendapatan: { type: String, default: 'Rp 0' },
})

const router = useRouter()
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-heading font-semibold text-text text-lg">{{ nama }}</h3>
          <p class="text-sm text-text-muted">{{ lokasi }}</p>
        </div>
      </div>
    </div>

    <div class="bg-cream/50 rounded-xl px-4 py-3 mb-3">
      <p class="text-xs text-text-muted">Pendapatan</p>
      <p class="text-base font-bold text-primary-dark">{{ pendapatan }}</p>
    </div>
    <div class="bg-cream/50 rounded-xl px-4 py-3 mb-4">
      <p class="text-xs text-text-muted">Periode Minggu Ini</p>
      <p class="text-sm font-medium text-text">{{ periodeMinggu }}</p>
    </div>

    <button
      @click="router.push(`/admin/branch/${id}`)"
      class="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.98]"
    >
      Lihat Selengkapnya
    </button>
  </div>
</template>
