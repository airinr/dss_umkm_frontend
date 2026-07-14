<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  cabangId: { type: String, required: true },
  nama: { type: String, required: true },
  lokasi: { type: String, default: '-' },
  periode: { type: String, default: '-' },
  pendapatan: { type: String, default: 'Rp 0' },
  totalTransaksi: { type: Number, default: 0 },
  topMenu: { type: String, default: '-' },
  detailPath: { type: String, default: '' },
})

const router = useRouter()
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-heading font-semibold text-text text-base">{{ nama }}</h3>
          <p class="text-xs text-text-muted">{{ lokasi }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-xs text-text-muted">Pendapatan</p>
        <p class="text-lg font-bold text-primary-dark">{{ pendapatan }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 border-t border-border pt-4">
      <div>
        <p class="text-xs text-text-muted mb-1">Menu Terlaris</p>
        <p class="text-sm font-semibold text-text">{{ topMenu }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-text-muted mb-1">Transaksi</p>
        <p class="text-lg font-bold text-primary-dark">{{ totalTransaksi }}</p>
      </div>
    </div>

    <button
      @click="router.push(detailPath || `/admin/pusat/branch/${cabangId}?tab=penjualan`)"
      class="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all duration-200 mt-4 active:scale-[0.98]"
    >
      Lihat Selengkapnya
    </button>
  </div>
</template>
