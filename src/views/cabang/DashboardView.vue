<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SummaryCard from '../../components/admin/SummaryCard.vue'
import SalesChart from '../../components/admin/SalesChart.vue'
import { getSemuaCabang, getTransaksi, getPrediksi, getPromo } from '../../services/dashboard.js'
import * as XLSX from 'xlsx'
import { auth } from '../../stores/auth.js'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const branches = ref([])
const transaksi = ref([])
const transaksiLoading = ref(false)
const prediksi = ref(null)
const promo = ref(null)
const dssError = ref('')
const periodeGlobal = ref('7 hari terakhir')

const tab = ref('penjualan')

const tglMulai = ref('')
const tglSelesai = ref('')

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDay(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[d.getDay()]
}

function formatRupiah(num) {
  return 'Rp ' + (num || 0).toLocaleString('id-ID')
}

const prediksiByDate = computed(() => {
  if (!prediksi.value?.prediksi) return []
  const groups = {}
  prediksi.value.prediksi.forEach((item) => {
    if (!groups[item.tanggal]) groups[item.tanggal] = []
    groups[item.tanggal].push(item)
  })
  return Object.entries(groups).map(([tanggal, items]) => ({ tanggal, items }))
})

const filteredTransaksi = computed(() => {
  let data = transaksi.value
  if (tglMulai.value) data = data.filter((t) => t.tanggal >= tglMulai.value)
  if (tglSelesai.value) data = data.filter((t) => t.tanggal <= tglSelesai.value)
  return data
})

const totalFiltered = computed(() => {
  return filteredTransaksi.value.reduce((sum, t) => sum + t.qty * t.harga, 0)
})

const myBranch = computed(() => {
  return branches.value.find((b) => b.cabang_id === auth.user?.cabang_id) || null
})

async function fetchTransaksi() {
  if (!auth.user?.cabang_id) return
  transaksiLoading.value = true
  try {
    const res = await getTransaksi(auth.user.cabang_id)
    transaksi.value = res.data || []
  } catch (e) {
    transaksi.value = []
  } finally {
    transaksiLoading.value = false
  }
}

function exportExcel() {
  const data = filteredTransaksi.value.map((t) => ({
    Tanggal: formatDate(t.tanggal),
    Menu: t.menu,
    Qty: t.qty,
    Harga: t.harga,
    Total: t.qty * t.harga,
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')
  XLSX.writeFile(wb, `transaksi_${auth.user?.cabang_id || 'cabang'}.xlsx`)
}

async function fetchData() {
  try {
    const res = await getSemuaCabang()
    periodeGlobal.value = res.periode || '7 hari terakhir'
    branches.value = res.data || []
    if (auth.user?.cabang_id) {
      transaksiLoading.value = true
      try {
        const [t, p, pr] = await Promise.all([
          getTransaksi(auth.user.cabang_id),
          getPrediksi(auth.user.cabang_id),
          getPromo(auth.user.cabang_id),
        ])
        transaksi.value = t.data || []
        prediksi.value = p
        promo.value = pr
      } catch (e) {
        if (transaksi.value.length === 0) transaksi.value = []
        dssError.value = e.message
      } finally {
        transaksiLoading.value = false
      }
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-text">Dashboard {{ myBranch?.nama || '' }}</h1>
      <p class="text-text-muted mt-1">{{ periodeGlobal }}</p>
    </div>

    <div v-if="loading" class="text-center py-20 text-text-muted">Memuat data...</div>
    <div v-else-if="error" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger mb-6">{{ error }}</div>
    <div v-else-if="!myBranch" class="text-center py-20 text-text-muted">Data cabang tidak ditemukan</div>
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          label="Total Pendapatan"
          :value="'Rp ' + (myBranch.total_revenue || 0).toLocaleString('id-ID')"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <SummaryCard
          label="Menu Terlaris"
          :value="myBranch.top_menu || '-'"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
        <SummaryCard
          label="Total Transaksi"
          :value="myBranch.total_transaksi || 0"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </div>

      <div class="bg-surface rounded-2xl border border-border p-6 shadow-sm mt-8">
        <div class="flex items-center gap-2 mb-6 flex-wrap">
          <button
            @click="tab = 'penjualan'"
            :class="['px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200', tab === 'penjualan' ? 'bg-primary text-white shadow-md' : 'bg-cream/50 text-text-muted hover:text-text']"
          >Tren Penjualan</button>
          <button
            v-if="prediksiByDate.length"
            @click="tab = 'prediksi'"
            :class="['px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200', tab === 'prediksi' ? 'bg-primary text-white shadow-md' : 'bg-cream/50 text-text-muted hover:text-text']"
          >Prediksi</button>
          <button
            v-if="promo"
            @click="tab = 'promo'"
            :class="['px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200', tab === 'promo' ? 'bg-primary text-white shadow-md' : 'bg-cream/50 text-text-muted hover:text-text']"
          >Rekomendasi Promo</button>
          <button
            @click="tab = 'transaksi'"
            :class="['px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200', tab === 'transaksi' ? 'bg-primary text-white shadow-md' : 'bg-cream/50 text-text-muted hover:text-text']"
          >Riwayat Transaksi</button>
        </div>

        <div v-if="tab === 'penjualan' || tab === 'transaksi'" class="flex flex-wrap items-center gap-4 mb-6">
          <div class="flex items-center gap-2">
            <label class="text-sm text-text-muted">Dari</label>
            <input type="date" v-model="tglMulai" class="px-3 py-2 rounded-xl border border-border text-sm text-text bg-surface outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-text-muted">Sampai</label>
            <input type="date" v-model="tglSelesai" class="px-3 py-2 rounded-xl border border-border text-sm text-text bg-surface outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex-1"></div>
          <template v-if="tab === 'transaksi'">
            <div class="flex items-center gap-3">
              <span class="text-sm text-text-muted">Total: <strong class="text-text">{{ formatRupiah(totalFiltered) }}</strong></span>
              <button
                @click="exportExcel"
                :disabled="!filteredTransaksi.length"
                class="flex items-center gap-2 px-4 py-2 bg-success-dark text-white font-medium rounded-xl hover:bg-green-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
            </div>
          </template>
        </div>

        <template v-if="tab === 'penjualan'">
          <SalesChart :data="transaksi" :tgl-mulai="tglMulai" :tgl-selesai="tglSelesai" />
        </template>

        <template v-if="tab === 'prediksi' && prediksiByDate.length">
          <p class="text-sm text-text-muted mb-6">Periode: {{ formatDate(prediksi.periode_minggu) }}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="group in prediksiByDate" :key="group.tanggal" class="bg-cream/30 rounded-xl border border-border p-5">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div>
                  <p class="text-sm font-semibold text-text">{{ formatDay(group.tanggal) }}</p>
                  <p class="text-xs text-text-muted">{{ formatDate(group.tanggal) }}</p>
                </div>
                <span class="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{{ group.items.length }} menu</span>
              </div>
              <div class="space-y-3">
                <div v-for="(item, i) in group.items" :key="i" class="flex items-center justify-between">
                  <span class="bg-secondary/10 text-secondary-dark px-3 py-1 rounded-lg text-sm font-medium">{{ item.menu }}</span>
                  <span class="text-sm font-bold text-text">{{ Math.round(item.prediksi_qty) }} pcs</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="tab === 'promo' && promo">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="(item, i) in promo.rekomendasi_promo" :key="i" class="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-border p-5">
              <div class="flex items-center justify-between mb-3">
                <span class="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{{ item.hari }}</span>
                <span class="text-xs text-text-muted">{{ formatDate(item.tanggal) }}</span>
              </div>
              <p class="font-heading font-semibold text-text text-lg mb-1">{{ item.menu }}</p>
              <div class="flex items-start gap-2 text-sm text-text-muted">
                <svg class="w-4 h-4 mt-0.5 shrink-0 text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ item.alasan }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-if="tab === 'transaksi'">
          <div v-if="transaksiLoading" class="text-center py-12 text-text-muted">Memuat transaksi...</div>
          <div v-else-if="!filteredTransaksi.length" class="text-center py-12 text-text-muted">Tidak ada transaksi</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left py-3 px-4 text-text-muted font-medium">Tanggal</th>
                  <th class="text-left py-3 px-4 text-text-muted font-medium">Menu</th>
                  <th class="text-right py-3 px-4 text-text-muted font-medium">Qty</th>
                  <th class="text-right py-3 px-4 text-text-muted font-medium">Harga</th>
                  <th class="text-right py-3 px-4 text-text-muted font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(t, i) in filteredTransaksi" :key="t.id || i" class="border-b border-border/50 last:border-0 hover:bg-cream/30 transition-colors">
                  <td class="py-3 px-4 text-text">{{ formatDate(t.tanggal) }}</td>
                  <td class="py-3 px-4">
                    <span class="bg-secondary/10 text-secondary-dark px-3 py-1 rounded-lg font-medium">{{ t.menu }}</span>
                  </td>
                  <td class="py-3 px-4 text-right text-text">{{ t.qty }}</td>
                  <td class="py-3 px-4 text-right text-text">{{ formatRupiah(t.harga) }}</td>
                  <td class="py-3 px-4 text-right font-semibold text-text">{{ formatRupiah(t.qty * t.harga) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
