<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const branch = ref(null)

const dummyBranches = [
  { id: 1, cabang_id: 'C001', nama: 'Kopi Kenangan Senayan', lokasi: 'Jl. Sudirman No. 10, Jakarta', periode_minggu: '29 Jun - 5 Jul 2026' },
  { id: 2, cabang_id: 'C002', nama: 'Kopi Kenangan Bandung', lokasi: 'Jl. Dago No. 25, Bandung', periode_minggu: '29 Jun - 5 Jul 2026' },
  { id: 3, cabang_id: 'C003', nama: 'Kopi Kenangan Surabaya', lokasi: 'Jl. Tunjungan No. 5, Surabaya', periode_minggu: '29 Jun - 5 Jul 2026' },
  { id: 4, cabang_id: 'C004', nama: 'Kopi Kenangan Bali', lokasi: 'Jl. Seminyak No. 88, Bali', periode_minggu: '29 Jun - 5 Jul 2026' },
]

onMounted(() => {
  const id = Number(route.params.id)
  const found = dummyBranches.find(b => b.id === id)
  if (found) {
    branch.value = found
  }
})
</script>

<template>
  <div>
    <button
      @click="router.push('/admin/dashboard')"
      class="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7" />
      </svg>
      Kembali
    </button>

    <div v-if="branch" class="bg-surface rounded-2xl border border-border p-8 shadow-sm">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
          <svg class="w-8 h-8 text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-heading font-bold text-text">{{ branch.nama }}</h1>
          <p class="text-text-muted">{{ branch.lokasi }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-cream/50 rounded-xl p-5">
          <p class="text-xs text-text-muted uppercase tracking-wider font-medium">Periode Minggu Ini</p>
          <p class="text-lg font-semibold text-text mt-1">{{ branch.periode_minggu }}</p>
        </div>
        <div class="bg-cream/50 rounded-xl p-5">
          <p class="text-xs text-text-muted uppercase tracking-wider font-medium">ID Cabang</p>
          <p class="text-lg font-semibold text-text mt-1">{{ branch.cabang_id }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-text-muted text-lg">Cabang tidak ditemukan</p>
    </div>
  </div>
</template>
