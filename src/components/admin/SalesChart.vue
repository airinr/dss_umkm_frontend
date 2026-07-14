<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps({
  data: { type: Array, required: true },
  tglMulai: { type: String, default: '' },
  tglSelesai: { type: String, default: '' },
})

const filtered = computed(() => {
  let f = props.data
  if (props.tglMulai) f = f.filter((t) => t.tanggal >= props.tglMulai)
  if (props.tglSelesai) f = f.filter((t) => t.tanggal <= props.tglSelesai)
  return f
})

const dailyTotals = computed(() => {
  const groups = {}
  filtered.value.forEach((t) => {
    const total = (t.qty || 0) * (t.harga || 0)
    groups[t.tanggal] = (groups[t.tanggal] || 0) + total
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})

const chartData = computed(() => ({
  labels: dailyTotals.value.map(([tanggal]) => {
    const d = new Date(tanggal + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }),
  datasets: [
    {
      label: 'Pendapatan',
      data: dailyTotals.value.map(([, total]) => total),
      borderColor: '#6F4E37',
      backgroundColor: 'rgba(111, 78, 55, 0.1)',
      fill: true,
      tension: 0,
      pointBackgroundColor: '#6F4E37',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => 'Rp ' + ctx.parsed.y.toLocaleString('id-ID'),
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#8B7355', font: { size: 11 } },
    },
    y: {
      grid: { color: '#E8DDD0' },
      ticks: {
        color: '#8B7355',
        font: { size: 11 },
        callback: (val) => 'Rp' + (val / 1000).toFixed(0) + 'k',
      },
    },
  },
}

const totalPeriode = computed(() => dailyTotals.value.reduce((s, [, v]) => s + v, 0))
const rataHarian = computed(() => Math.round(totalPeriode.value / dailyTotals.value.length) || 0)
const maxDay = computed(() => dailyTotals.value.reduce((best, curr) => (curr[1] > best[1] ? curr : best), ['', -1]))
const minDay = computed(() => dailyTotals.value.reduce((worst, curr) => (curr[1] < worst[1] ? curr : worst), ['', Infinity]))

const tren = computed(() => {
  const items = dailyTotals.value
  if (items.length < 4) return { label: 'Data terlalu sedikit', arah: 'netral' }
  const half = Math.floor(items.length / 2)
  const firstAvg = items.slice(0, half).reduce((s, [, v]) => s + v, 0) / half
  const lastAvg = items.slice(-half).reduce((s, [, v]) => s + v, 0) / half
  const selisih = lastAvg - firstAvg
  const pct = Math.round((selisih / (firstAvg || 1)) * 100)
  if (pct > 5) return { label: `Meningkat ${pct}%`, arah: 'naik' }
  if (pct < -5) return { label: `Menurun ${Math.abs(pct)}%`, arah: 'turun' }
  return { label: 'Stabil', arah: 'netral' }
})

function formatRupiah(num) {
  return 'Rp ' + (num || 0).toLocaleString('id-ID')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <div v-if="dailyTotals.length" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div class="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
        <p class="text-xs text-blue-600 font-medium uppercase tracking-wider">Total</p>
        <p class="text-sm font-bold text-blue-800 mt-1">{{ formatRupiah(totalPeriode) }}</p>
      </div>
      <div class="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200">
        <p class="text-xs text-emerald-600 font-medium uppercase tracking-wider">Rata-rata</p>
        <p class="text-sm font-bold text-emerald-800 mt-1">{{ formatRupiah(rataHarian) }}</p>
      </div>
      <div class="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-200">
        <p class="text-xs text-indigo-600 font-medium uppercase tracking-wider">Puncak</p>
        <p class="text-sm font-bold text-indigo-800 mt-1">{{ formatDate(maxDay[0]) }}</p>
        <p class="text-xs text-indigo-600 mt-0.5">{{ formatRupiah(maxDay[1]) }}</p>
      </div>
      <div class="bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
        <p class="text-xs text-amber-600 font-medium uppercase tracking-wider">Terendah</p>
        <p class="text-sm font-bold text-amber-800 mt-1">{{ formatDate(minDay[0]) }}</p>
        <p class="text-xs text-amber-600 mt-0.5">{{ formatRupiah(minDay[1]) }}</p>
      </div>
      <div :class="['rounded-xl px-4 py-3 border', tren.arah === 'naik' ? 'bg-emerald-50 border-emerald-200' : tren.arah === 'turun' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200']">
        <p class="text-xs font-medium uppercase tracking-wider" :class="tren.arah === 'naik' ? 'text-emerald-600' : tren.arah === 'turun' ? 'text-red-600' : 'text-gray-600'">Tren</p>
        <p class="text-sm font-bold mt-1" :class="tren.arah === 'naik' ? 'text-emerald-800' : tren.arah === 'turun' ? 'text-red-800' : 'text-gray-800'">{{ tren.label }}</p>
      </div>
    </div>
    <div class="h-[300px]">
      <Line v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-text-muted text-sm">Tidak ada data untuk periode ini</div>
    </div>
  </div>
</template>
