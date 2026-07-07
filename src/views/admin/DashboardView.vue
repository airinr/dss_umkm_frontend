<script setup>
import { ref, computed } from 'vue'
import SummaryCard from '../../components/admin/SummaryCard.vue'
import BranchCard from '../../components/admin/BranchCard.vue'
import RevenueChart from '../../components/admin/RevenueChart.vue'

const branches = ref([
  { id: 1, cabang_id: 'C001', nama: 'Kopi Kenangan Senayan', lokasi: 'Jl. Sudirman No. 10, Jakarta', periode_minggu: '29 Jun - 5 Jul 2026', pendapatan: 20000000 },
  { id: 2, cabang_id: 'C002', nama: 'Kopi Kenangan Bandung', lokasi: 'Jl. Dago No. 25, Bandung', periode_minggu: '29 Jun - 5 Jul 2026', pendapatan: 15000000 },
  { id: 3, cabang_id: 'C003', nama: 'Kopi Kenangan Surabaya', lokasi: 'Jl. Tunjungan No. 5, Surabaya', periode_minggu: '29 Jun - 5 Jul 2026', pendapatan: 22000000 },
  { id: 4, cabang_id: 'C004', nama: 'Kopi Kenangan Bali', lokasi: 'Jl. Seminyak No. 88, Bali', periode_minggu: '29 Jun - 5 Jul 2026', pendapatan: 10000000 },
])

const totalPendapatan = computed(() => {
  const total = branches.value.reduce((sum, b) => sum + b.pendapatan, 0)
  return 'Rp ' + total.toLocaleString('id-ID')
})

const chartData = computed(() => {
  return branches.value.map((b) => ({ nama: b.nama, nilai: b.pendapatan }))
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-text">Dashboard</h1>
      <p class="text-text-muted mt-1">Ringkasan seluruh cabang Coffee Shop</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <SummaryCard
        label="Jumlah Cabang"
        :value="branches.length"
        icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
      <SummaryCard
        label="Total Pendapatan"
        :value="totalPendapatan"
        icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </div>

    <div class="mb-8">
      <RevenueChart :data="chartData" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <BranchCard
        v-for="branch in branches"
        :key="branch.id"
        :id="branch.id"
        :cabang-id="branch.cabang_id"
        :nama="branch.nama"
        :lokasi="branch.lokasi"
        :periode-minggu="branch.periode_minggu"
        :pendapatan="'Rp ' + branch.pendapatan.toLocaleString('id-ID')"
      />
    </div>
  </div>
</template>
