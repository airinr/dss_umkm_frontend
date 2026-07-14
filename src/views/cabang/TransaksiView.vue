<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { getTransaksi, createTransaksi, getPromo, getPrediksi, getMenu } from '../../services/dashboard.js'
import { auth } from '../../stores/auth.js'

const daftarMenu = ref([])
const items = ref([{ menu: '', menuSearch: '', qty: 1, harga: '' }])
const openDropdown = ref(null)
const transaksiList = ref([])
const transaksiLoading = ref(false)
const promo = ref(null)
const prediksi = ref(null)
const menuLoading = ref(false)
const submitting = ref(false)
const success = ref('')
const formError = ref('')



const currentPage = ref(1)
const perPage = 10

const today = new Date().toISOString().split('T')[0]
const tanggal = ref(today)

const cabangId = computed(() => auth.user?.cabang_id)

const transaksiHariIni = computed(() => {
  return transaksiList.value.filter((t) => t.tanggal === today)
})

const totalPendapatanHariIni = computed(() => {
  return transaksiHariIni.value.reduce((sum, t) => sum + t.qty * t.harga, 0)
})

const totalPages = computed(() => Math.max(1, Math.ceil(transaksiHariIni.value.length / perPage)))

const paginatedTransaksi = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return transaksiHariIni.value.slice(start, start + perPage)
})

function goToPage(page) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

const totalFormItems = computed(() => {
  return items.value.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.harga) || 0), 0)
})

const promoAktif = computed(() => {
  if (!promo.value?.data) return []
  return promo.value.data.filter((p) => p.is_active)
})

const prediksiHariIni = computed(() => {
  if (!prediksi.value?.prediksi) return []
  return prediksi.value.prediksi.filter((p) => p.tanggal === today)
})

async function fetchData() {
  if (!cabangId.value) return
  transaksiLoading.value = true
  menuLoading.value = true
  try {
    const [t, p, pr, m] = await Promise.all([
      getTransaksi(cabangId.value),
      getPromo(cabangId.value),
      getPrediksi(cabangId.value),
      getMenu(),
    ])
    transaksiList.value = t.data || []
    promo.value = p
    prediksi.value = pr
    daftarMenu.value = m.data || []
    currentPage.value = 1
  } catch (e) {
    transaksiList.value = []
  } finally {
    transaksiLoading.value = false
    menuLoading.value = false
  }
}

function addItem() {
  items.value.push({ menu: '', menuSearch: '', qty: 1, harga: '' })
}

function filteredMenus(search) {
  if (!search) return daftarMenu.value
  const q = search.toLowerCase()
  return daftarMenu.value.filter((m) => m.nama.toLowerCase().includes(q))
}

function selectMenu(index, m) {
  items.value[index].menu = m.nama
  items.value[index].menuSearch = m.nama
  items.value[index].harga = m.harga
  openDropdown.value = null
}

function toggleDropdown(index) {
  openDropdown.value = openDropdown.value === index ? null : index
}

function removeItem(index) {
  if (items.value.length > 1) items.value.splice(index, 1)
}

function onMenuSelect(index) {
  const item = items.value[index]
  const found = daftarMenu.value.find((m) => m.nama === item.menu)
  if (found) item.harga = found.harga
}

onMounted(fetchData)

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRupiah(num) {
  return 'Rp ' + (num || 0).toLocaleString('id-ID')
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  excelFile.value = file
  excelFileName.value = file.name
  uploadError.value = ''
  parsedData.value = []

  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      if (!json.length) {
        uploadError.value = 'File Excel kosong'
        return
      }

      const rows = json.map((row) => {
        const keys = Object.keys(row)
        const menuKey = keys.find((k) => /menu|nama|item/i.test(k))
        const qtyKey = keys.find((k) => /qty|quantity|jumlah/i.test(k))
        const hargaKey = keys.find((k) => /harga|price|hrg/i.test(k))
        const tanggalKey = keys.find((k) => /tanggal|date|tgl/i.test(k))

        return {
          menu: menuKey ? String(row[menuKey]).trim() : '',
          qty: qtyKey ? Number(row[qtyKey]) || 1 : 1,
          harga: hargaKey ? Number(row[hargaKey]) || 0 : 0,
          tanggal: tanggalKey ? String(row[tanggalKey]).trim() : '',
        }
      }).filter((r) => r.menu && r.harga > 0)

      if (!rows.length) {
        uploadError.value = 'Tidak dapat menemukan kolom Menu, Qty, dan Harga di file Excel'
        return
      }

      parsedData.value = rows
    } catch (err) {
      uploadError.value = 'Gagal membaca file: ' + err.message
    }
  }
  reader.readAsArrayBuffer(file)
}

function exportToExcel() {
  const data = transaksiHariIni.value.map((t) => ({
    Tanggal: t.tanggal,
    Menu: t.menu,
    Qty: t.qty,
    Harga: t.harga,
    Total: t.qty * t.harga,
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')
  XLSX.writeFile(wb, `transaksi_${today}.xlsx`)
}

async function handleSubmit() {
  formError.value = ''
  success.value = ''

  const validItems = items.value.filter((item) => item.menu && item.harga)
  if (!validItems.length) {
    formError.value = 'Setidaknya satu item dengan menu dan harga harus diisi'
    return
  }

  submitting.value = true
  try {
    const payload = validItems.map((item) => ({
      menu: item.menu,
      qty: Number(item.qty),
      harga: Number(item.harga),
    }))
    await createTransaksi(cabangId.value, payload, tanggal.value)
    success.value = `${payload.length} transaksi berhasil ditambahkan`
    items.value = [{ menu: '', qty: 1, harga: '' }]
    await fetchData()
  } catch (e) {
    formError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-text">Input Transaksi</h1>
      <p class="text-text-muted mt-1">Tambah transaksi baru untuk cabang Anda</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
      <div class="bg-surface rounded-2xl border border-border p-8 shadow-sm">
        <h2 class="text-xl font-heading font-semibold text-text mb-6">Form Transaksi</h2>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div v-if="formError" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">{{ formError }}</div>
          <div v-if="success" class="bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-sm text-success">{{ success }}</div>

          <div>
            <label class="block text-sm font-medium text-text mb-3">Tanggal</label>
            <input
              :value="tanggal"
              type="date"
              disabled
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-gray-50 text-text-muted cursor-not-allowed outline-none transition-all duration-200"
            />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-text">Item Transaksi</label>
              <button type="button" @click="addItem" class="text-xs text-primary hover:text-primary-dark font-semibold transition-colors">+ Tambah Item</button>
            </div>

            <div v-for="(item, index) in items" :key="index" class="border border-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-text-muted font-medium">Item #{{ index + 1 }}</span>
                <button v-if="items.length > 1" type="button" @click="removeItem(index)" class="text-xs text-danger hover:text-danger/80 transition-colors">Hapus</button>
              </div>

              <div class="relative">
                <label class="block text-xs text-text-muted mb-1.5">Menu</label>
                <input
                  v-model="item.menuSearch"
                  @focus="openDropdown = index"
                  @input="openDropdown = index"
                  @blur="setTimeout(() => openDropdown = null, 200)"
                  type="text"
                  placeholder="Cari menu..."
                  class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200"
                />
                <div
                  v-if="openDropdown === index && filteredMenus(item.menuSearch).length"
                  class="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="m in filteredMenus(item.menuSearch)"
                    :key="m.id"
                    type="button"
                    @mousedown.prevent="selectMenu(index, m)"
                    class="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-cream/50 transition-colors border-b border-border/20 last:border-0"
                  >
                    {{ m.nama }}
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-text-muted mb-1.5">Qty</label>
                  <input
                    v-model.number="item.qty"
                    type="number"
                    min="1"
                    class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-xs text-text-muted mb-1.5">Harga Satuan</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium text-sm pointer-events-none">Rp</span>
                    <input
                      v-model="item.harga"
                      type="number"
                      placeholder="45000"
                      disabled
                      class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-gray-50 text-text-muted font-bold cursor-not-allowed outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-cream/30 rounded-xl px-5 py-4 flex items-center justify-between">
            <span class="text-sm font-medium text-text-muted">Total Transaksi</span>
            <span class="text-xl font-heading font-bold text-primary">{{ formatRupiah(totalFormItems) }}</span>
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
          </button>
        </form>
      </div>

      <div class="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">Prediksi</span>
        </div>
        <div v-if="!prediksiHariIni.length" class="text-sm text-text-muted">Tidak ada data</div>
        <div v-else class="space-y-0.5">
          <div v-for="(item, i) in prediksiHariIni" :key="i" class="flex items-center justify-between py-1.5 px-2 rounded-lg bg-primary/5">
            <span class="text-xs font-medium text-primary-dark">{{ item.menu }}</span>
            <span class="text-xs font-bold text-primary">{{ Math.round(item.prediksi_qty) }} pcs</span>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-2xl border border-border p-8 shadow-sm">
        <h3 class="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
          <span class="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">Promo Hari Ini</span>
        </h3>
        <div v-if="!promoAktif.length" class="text-center py-8 text-sm text-text-muted">Tidak ada promo hari ini</div>
        <div v-else class="space-y-3">
          <div v-for="(item, i) in promoAktif" :key="item.id || i" class="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0">
            <svg class="w-4 h-4 mt-0.5 shrink-0 text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-text">{{ item.menu_nama }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span v-if="item.kuadran" :class="['text-xs font-semibold px-2 py-0.5 rounded-full',
                  item.kuadran === 'Star' ? 'bg-yellow-100 text-yellow-700' :
                  item.kuadran === 'Plowhorse' ? 'bg-blue-100 text-blue-700' :
                  item.kuadran === 'Puzzle' ? 'bg-purple-100 text-purple-700' :
                  'bg-red-100 text-red-700'
                ]">{{ item.kuadran }}</span>
                <span class="line-through text-xs text-text-muted">{{ formatRupiah(item.harga_normal) }}</span>
                <span class="text-xs font-bold text-primary">{{ formatRupiah(item.harga_promo) }} <span class="text-danger font-semibold">({{ item.diskon }})</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-surface rounded-2xl border border-border p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-heading font-semibold text-text">Transaksi Hari Ini</h2>
            <span class="text-xs text-text-muted bg-cream/50 px-3 py-1 rounded-full">{{ transaksiHariIni.length }} transaksi</span>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="exportToExcel"
              :disabled="!transaksiHariIni.length"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-success-dark hover:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <div class="text-2xl font-heading font-extrabold text-primary tracking-tight">
              {{ formatRupiah(totalPendapatanHariIni) }}
            </div>
          </div>
        </div>

      <div v-if="transaksiLoading" class="text-center py-12 text-text-muted">Memuat transaksi...</div>
      <div v-else-if="!transaksiHariIni.length" class="text-center py-12 text-text-muted">Belum ada transaksi hari ini</div>
      <template v-else>
        <div class="overflow-x-auto">
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
              <tr v-for="(t, i) in paginatedTransaksi" :key="t.id || i" class="border-b border-border/50 last:border-0 hover:bg-cream/30 transition-colors">
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
        <div class="flex items-center justify-center gap-3 mt-5">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-muted hover:text-text hover:bg-cream/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-sm text-text-muted">Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-muted hover:text-text hover:bg-cream/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
