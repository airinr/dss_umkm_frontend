<script setup>
import { ref, computed, onMounted } from 'vue'
import SummaryCard from '../../components/admin/SummaryCard.vue'
import BranchCard from '../../components/admin/BranchCard.vue'
import RevenueChart from '../../components/admin/RevenueChart.vue'
import { getSemuaCabang, getPerbandingan } from '../../services/dashboard.js'
import { auth } from '../../stores/auth.js'

const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const periodeGlobal = ref('7 hari terakhir')
const branches = ref([])
const perbandinganData = ref([])
const lastUpdated = ref(null)
const searchQuery = ref('')

const selectedPeriode = ref({
  start: '2026-06-29',
  end: '2026-07-05',
})

const filteredBranches = computed(() => {
  let data = branches.value
  if (!searchQuery.value) return data
  const q = searchQuery.value.toLowerCase()
  return data.filter((b) => b.nama.toLowerCase().includes(q) || (b.lokasi || '').toLowerCase().includes(q))
})

const chartData = computed(() => {
  return perbandinganData.value.map((b) => ({
    nama: b.nama,
    nilai: b.revenue_mingguan || 0,
  }))
})

const totalRevenue = computed(() => {
  const total = filteredBranches.value.reduce((sum, b) => sum + (b.total_revenue || 0), 0)
  return 'Rp ' + total.toLocaleString('id-ID')
})

const totalTransaksi = computed(() => {
  return filteredBranches.value.reduce((sum, b) => sum + (b.total_transaksi || 0), 0)
})

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

async function fetchData() {
  try {
    const [semua, perbandingan] = await Promise.all([
      getSemuaCabang(),
      getPerbandingan(),
    ])
    periodeGlobal.value = semua.periode || '7 hari terakhir'
    branches.value = semua.data || []
    perbandinganData.value = perbandingan.data || []
    lastUpdated.value = new Date()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function refresh() {
  refreshing.value = true
  error.value = ''
  await fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-text">Dashboard</h1>
        <p class="text-text-muted mt-1">Ringkasan seluruh cabang B.A.R.I.S.T.A. ({{ periodeGlobal }})</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="lastUpdated" class="text-xs text-text-muted">Terakhir: {{ formatTime(lastUpdated) }}</div>
        <button
          @click="refresh"
          :disabled="refreshing"
          class="p-2 rounded-xl border border-border hover:bg-cream/50 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <svg :class="['w-5 h-5 text-text-muted', { 'animate-spin': refreshing }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 text-text-muted">Memuat data...</div>
    <div v-else-if="error" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger mb-6">{{ error }}</div>
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard label="Jumlah Cabang" :value="filteredBranches.length" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        <SummaryCard label="Total Pendapatan" :value="totalRevenue" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <SummaryCard label="Total Transaksi" :value="totalTransaksi" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </div>

      <div class="mb-8">
        <RevenueChart v-model="selectedPeriode" :data="chartData" :periode="periodeGlobal" />
      </div>

      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari cabang..."
          class="w-full max-w-sm px-4 py-2.5 rounded-xl border border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200 text-sm"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <BranchCard
          v-for="branch in filteredBranches"
          :key="branch.cabang_id"
          :cabang-id="branch.cabang_id"
          :nama="branch.nama"
          :lokasi="branch.lokasi || '-'"
          :pendapatan="'Rp ' + (branch.total_revenue || 0).toLocaleString('id-ID')"
          :total-transaksi="branch.total_transaksi || 0"
          :top-menu="branch.top_menu || '-'"
          :periode="periodeGlobal"
        />
      </div>
    </template>
  </div>
</template>
