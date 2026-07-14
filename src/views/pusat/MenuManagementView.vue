<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMenu, getMenuInactive, createMenu, updateMenu, deleteMenu, activateMenu, trainMenu, trainAllMenu, getTrainStatus } from '../../services/dashboard.js'

const menus = ref([])
const trainStatus = ref(null)
const loading = ref(true)
const error = ref('')
const success = ref('')

const showForm = ref(false)
const editingId = ref(null)
const form = ref({ nama: '', kategori: '', harga: '', kategoriLain: '' })
const formError = ref('')
const saving = ref(false)

const training = ref(false)
const trainingMenu = ref(null)
const showTrainAllModal = ref(false)
const showTrainMenuModal = ref(false)
const trainMenuTarget = ref('')
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

const searchQuery = ref('')
const kategoriFilter = ref('')
const trainFilter = ref('')

const uniqueKategoris = computed(() => {
  const set = new Set(menus.value.map((m) => m.kategori).filter(Boolean))
  return [...set].sort()
})

function isMenuTrained(menuName) {
  return trainStatus.value?.menus?.find((tm) => tm.menu === menuName)?.has_model || false
}

function applyFilters(data) {
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter((m) => m.nama.toLowerCase().includes(q))
  }
  if (kategoriFilter.value) data = data.filter((m) => m.kategori === kategoriFilter.value)
  if (trainFilter.value === 'trained') data = data.filter((m) => isMenuTrained(m.nama))
  if (trainFilter.value === 'untrained') data = data.filter((m) => !isMenuTrained(m.nama))
  return data
}

const activeTab = ref('aktif')
const menuAktif = computed(() => applyFilters(menus.value.filter((m) => m.is_active)))
const menuNonAktif = computed(() => applyFilters(menus.value.filter((m) => !m.is_active)))
const displayMenus = computed(() => activeTab.value === 'aktif' ? menuAktif.value : menuNonAktif.value)

function formatRupiah(num) {
  return 'Rp ' + (num || 0).toLocaleString('id-ID')
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const [active, inactive, s] = await Promise.all([getMenu(), getMenuInactive(), getTrainStatus()])
    menus.value = [...(active.data || []), ...(inactive.data || [])]
    trainStatus.value = s
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function openAdd() {
  editingId.value = null
  form.value = { nama: '', kategori: '', harga: '', kategoriLain: '' }
  formError.value = ''
  showForm.value = true
}

function openEdit(menu) {
  editingId.value = menu.id
  const kategori = menu.kategori || ''
  const inList = uniqueKategoris.value.includes(kategori)
  form.value = { nama: menu.nama, kategori: inList ? kategori : '__other__', harga: menu.harga, kategoriLain: inList ? '' : kategori }
  formError.value = ''
  showForm.value = true
}

async function handleSave() {
  formError.value = ''
  if (!form.value.nama || !form.value.harga) {
    formError.value = 'Nama dan harga harus diisi'
    return
  }
  const kategoriFinal = form.value.kategori === '__other__' ? form.value.kategoriLain : form.value.kategori
  saving.value = true
  try {
    if (editingId.value) {
      await updateMenu(editingId.value, { nama: form.value.nama, kategori: kategoriFinal, harga: Number(form.value.harga) })
      success.value = `Menu "${form.value.nama}" berhasil diupdate`
    } else {
      await createMenu(form.value.nama, kategoriFinal, Number(form.value.harga))
      success.value = `Menu "${form.value.nama}" berhasil dibuat`
    }
    showForm.value = false
    await fetchData()
  } catch (e) {
    formError.value = e.message
  } finally {
    saving.value = false
  }
}

function confirmDelete(menu) {
  deleteTarget.value = menu
  showDeleteModal.value = true
}

async function handleActivate(menu) {
  try {
    const res = await activateMenu(menu.id)
    success.value = res.message || `Menu "${menu.nama}" berhasil diaktifkan kembali`
    await fetchData()
  } catch (e) {
    error.value = e.message
  }
}

async function handleDelete() {
  const menu = deleteTarget.value
  if (!menu) return
  try {
    const res = await deleteMenu(menu.id)
    success.value = res.message || `Menu "${menu.nama}" berhasil dinonaktifkan`
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchData()
  } catch (e) {
    error.value = e.message
  }
}

function confirmTrain(menuName) {
  trainMenuTarget.value = menuName
  showTrainMenuModal.value = true
}

async function handleTrain(menuName) {
  trainingMenu.value = menuName
  try {
    const res = await trainMenu(menuName)
    success.value = res.message || `Berhasil train "${menuName}"`
    await fetchData()
  } catch (e) {
    error.value = e.message
  } finally {
    trainingMenu.value = null
  }
}

async function handleTrainAll() {
  training.value = true
  error.value = ''
  try {
    const res = await trainAllMenu()
    success.value = res.message || 'Training selesai'
    await fetchData()
  } catch (e) {
    error.value = e.message
  } finally {
    training.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-text">Kelola Menu</h1>
        <p class="text-text-muted mt-1">Atur daftar menu dan training model prediksi</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="trainStatus" class="text-xs text-text-muted bg-cream/50 px-3 py-1.5 rounded-full">
          {{ trainStatus.trained }}/{{ trainStatus.total_menu }} terlatih
        </div>
        <button
          @click="showTrainAllModal = true"
          :disabled="training"
          class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {{ training ? 'Training...' : 'Train All' }}
        </button>
        <button
          @click="openAdd"
          class="px-4 py-2 bg-success-dark text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-all"
        >
          + Tambah Menu
        </button>
      </div>
    </div>

    <div v-if="error" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger mb-6">{{ error }}</div>
    <div v-if="success" class="bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-sm text-success mb-6">{{ success }}</div>

    <div v-if="loading" class="text-center py-20 text-text-muted">Memuat data...</div>
    <template v-else>
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari menu..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all text-sm"
          />
        </div>
        <div class="relative">
          <select
            v-model="kategoriFilter"
            class="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-surface text-text outline-none focus:border-primary transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option v-for="k in uniqueKategoris" :key="k" :value="k">{{ k }}</option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div class="relative">
          <select
            v-model="trainFilter"
            class="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-surface text-text outline-none focus:border-primary transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="trained">Terlatih</option>
            <option value="untrained">Belum Terlatih</option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <span class="text-xs text-text-muted ml-auto">{{ displayMenus.length }} menu</span>
      </div>

      <div class="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-border flex items-center gap-2">
          <button
            @click="activeTab = 'aktif'"
            :class="['px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200', activeTab === 'aktif' ? 'bg-primary text-white shadow-md' : 'bg-cream/50 text-text-muted hover:text-text']"
          >
            Menu Aktif
            <span :class="['ml-1.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === 'aktif' ? 'bg-white/20' : 'bg-cream/70']">{{ menuAktif.length }}</span>
          </button>
          <button
            @click="activeTab = 'nonaktif'"
            :class="['px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200', activeTab === 'nonaktif' ? 'bg-primary text-white shadow-md' : 'bg-cream/50 text-text-muted hover:text-text']"
          >
            Non-Aktif
            <span :class="['ml-1.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === 'nonaktif' ? 'bg-white/20' : 'bg-cream/70']">{{ menuNonAktif.length }}</span>
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border/40">
                <th class="text-center py-3 px-4 text-text-muted font-medium w-12">No</th>
                <th class="text-left py-3 px-5 text-text-muted font-medium">Menu</th>
                <th class="text-left py-3 px-5 text-text-muted font-medium">Kategori</th>
                <th class="text-right py-3 px-5 text-text-muted font-medium">Harga</th>
                <th class="text-center py-3 px-5 text-text-muted font-medium">Model</th>
                <th class="text-right py-3 px-5 text-text-muted font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, idx) in displayMenus" :key="m.id" class="border-b border-border/30 last:border-0 hover:bg-cream/20 transition-colors">
                <td class="py-3 px-4 text-center text-sm text-text-muted">{{ idx + 1 }}</td>
                <td class="py-3 px-5">
                  <span :class="['font-medium', activeTab === 'nonaktif' ? 'text-text-muted line-through' : 'text-text']">{{ m.nama }}</span>
                </td>
                <td class="py-3 px-5 text-text-muted">{{ m.kategori || '-' }}</td>
                <td class="py-3 px-5 text-right font-semibold" :class="activeTab === 'nonaktif' ? 'text-text-muted' : 'text-text'">{{ formatRupiah(m.harga) }}</td>
                <td class="py-3 px-5 text-center">
                  <span class="text-xs">
                    <span v-if="isMenuTrained(m.nama)" class="text-success font-semibold">Terlatih</span>
                    <span v-else class="text-text-muted">Belum</span>
                  </span>
                </td>
                <td class="py-3 px-5 text-right">
                  <div v-if="activeTab === 'aktif'" class="flex items-center justify-end gap-2">
                    <button @click="confirmTrain(m.nama)" :disabled="trainingMenu === m.nama" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/20 text-primary-dark hover:bg-primary/30 transition-all disabled:opacity-50">
                      {{ trainingMenu === m.nama ? '...' : 'Train' }}
                    </button>
                    <button @click="openEdit(m)" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/20 text-secondary-dark hover:bg-secondary/30 transition-all">Edit</button>
                    <button @click="confirmDelete(m)" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/20 text-danger hover:bg-danger/30 transition-all">Hapus</button>
                  </div>
                  <button v-else @click="handleActivate(m)" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/20 text-success-dark hover:bg-success/30 transition-all">Aktifkan</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!displayMenus.length" class="text-center py-12 text-text-muted">{{ activeTab === 'aktif' ? 'Tidak ada menu aktif' : 'Tidak ada menu non-aktif' }}</div>
      </div>
    </template>

    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" @click="showForm = false">
      <div class="bg-surface rounded-2xl p-8 max-w-md w-full shadow-xl" @click.stop>
        <h3 class="text-xl font-heading font-semibold text-text mb-6">{{ editingId ? 'Edit Menu' : 'Tambah Menu' }}</h3>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div v-if="formError" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">{{ formError }}</div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Nama Menu</label>
            <input
              v-model="form.nama"
              type="text"
              placeholder="Mis: Mocha"
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Kategori</label>
            <div class="relative">
              <select
                v-model="form.kategori"
                class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-border bg-surface text-text outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">Pilih kategori</option>
                <option v-for="k in uniqueKategoris" :key="k" :value="k">{{ k }}</option>
                <option value="__other__">Lainnya...</option>
              </select>
              <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <input
              v-if="form.kategori === '__other__'"
              v-model="form.kategoriLain"
              type="text"
              placeholder="Masukkan kategori baru"
              class="w-full mt-2 px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Harga</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium text-sm pointer-events-none">Rp</span>
              <input
                v-model="form.harga"
                type="number"
                placeholder="45000"
                class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showForm = false" class="flex-1 py-2.5 px-4 bg-cream/50 text-text font-medium rounded-xl hover:bg-cream transition-all">Batal</button>
            <button type="submit" :disabled="saving" class="flex-1 py-2.5 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showTrainMenuModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" @click="showTrainMenuModal = false">
      <div class="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-xl" @click.stop>
        <div class="text-center">
          <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-text mb-2">Train Model "{{ trainMenuTarget }}"</h3>
          <p class="text-sm text-text-muted mb-6">
            Menu <strong class="text-text">{{ trainMenuTarget }}</strong> akan dilatih untuk model prediksi AI. Pastikan menu ini sudah memiliki data transaksi yang cukup (minimal 7 hari) dari pelanggan. Lanjutkan?
          </p>
          <div class="flex gap-3">
            <button @click="showTrainMenuModal = false" class="flex-1 py-2.5 px-4 bg-cream/50 text-text font-medium rounded-xl hover:bg-cream transition-all">Batal</button>
            <button @click="handleTrain(trainMenuTarget); showTrainMenuModal = false" class="flex-1 py-2.5 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all">Ya, Train</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" @click="showDeleteModal = false">
      <div class="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-xl" @click.stop>
        <div class="text-center">
          <div class="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-text mb-2">Hapus Menu</h3>
          <p class="text-sm text-text-muted mb-6">
            Yakin ingin menonaktifkan menu <strong class="text-text">{{ deleteTarget?.nama }}</strong>? Menu ini tidak akan tampil di daftar aktif tetapi data transaksinya tetap tersimpan.
          </p>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="flex-1 py-2.5 px-4 bg-cream/50 text-text font-medium rounded-xl hover:bg-cream transition-all">Batal</button>
            <button @click="handleDelete()" class="flex-1 py-2.5 px-4 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-all">Ya, Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTrainAllModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" @click="showTrainAllModal = false">
      <div class="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-xl" @click.stop>
        <div class="text-center">
          <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-text mb-2">Train All Model AI</h3>
          <p class="text-sm text-text-muted mb-6">
            Seluruh menu akan dilatih kembali untuk model prediksi AI. Proses ini membutuhkan waktu dan akan memperbarui model prediksi penjualan. Lanjutkan?
          </p>
          <div class="flex gap-3">
            <button @click="showTrainAllModal = false" class="flex-1 py-2.5 px-4 bg-cream/50 text-text font-medium rounded-xl hover:bg-cream transition-all">Batal</button>
            <button @click="handleTrainAll(); showTrainAllModal = false" class="flex-1 py-2.5 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all">Ya, Train</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
