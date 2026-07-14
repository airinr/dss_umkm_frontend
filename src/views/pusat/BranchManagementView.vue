<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSemuaCabang, createCabang } from '../../services/dashboard.js'
import { auth } from '../../stores/auth.js'

const cabangList = ref([])
const loading = ref(true)
const error = ref('')

const cabangNama = ref('')
const lokasi = ref('')
const username = ref('')
const password = ref('')
const submitting = ref(false)
const success = ref('')
const formError = ref('')

const generatedId = computed(() => {
  const nums = cabangList.value
    .map((c) => parseInt(c.cabang_id?.replace('cabang_', ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `cabang_${next}`
})

async function fetchCabang() {
  try {
    const res = await getSemuaCabang()
    cabangList.value = (res.data || []).map((b) => ({ cabang_id: b.cabang_id, nama: b.nama }))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchCabang)

async function handleRegister() {
  formError.value = ''
  success.value = ''

  if (!cabangNama.value || !lokasi.value || !username.value || !password.value) {
    formError.value = 'Semua field harus diisi'
    return
  }

  submitting.value = true
  const cabangId = generatedId.value

  try {
    await createCabang(cabangId, cabangNama.value, lokasi.value)
  } catch (e) {
    formError.value = `Gagal membuat cabang: ${e.message}`
    submitting.value = false
    return
  }

  try {
    await auth.register(username.value, password.value, cabangId)
    success.value = `Cabang "${cabangNama.value}" berhasil ditambahkan`
    cabangNama.value = ''
    lokasi.value = ''
    username.value = ''
    password.value = ''
    await fetchCabang()
  } catch (e) {
    formError.value = `Cabang berhasil dibuat, tetapi registrasi gagal: ${e.message} (cabang_id: ${cabangId})`
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-text">Kelola Cabang</h1>
      <p class="text-text-muted mt-1">Tambah cabang baru dan lihat daftar cabang</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div class="lg:col-span-2 bg-surface rounded-2xl border border-border p-8 shadow-sm">
        <h2 class="text-xl font-heading font-semibold text-text mb-6">Tambah Cabang Baru</h2>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div v-if="formError" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
            {{ formError }}
          </div>
          <div v-if="success" class="bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-sm text-success">
            {{ success }}
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">ID Cabang</label>
            <input
              :value="generatedId"
              readonly
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-cream/50 text-text-muted outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Nama Cabang</label>
            <input
              v-model="cabangNama"
              type="text"
              placeholder="Mis: Cabang Astoria"
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Lokasi</label>
            <input
              v-model="lokasi"
              type="text"
              placeholder="Mis: Jakarta Pusat"
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Username untuk login"
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Password untuk login"
              class="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder-text-muted/50 outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Menyimpan...' : 'Tambah Cabang' }}
          </button>
        </form>
      </div>

      <div class="lg:col-span-3 bg-surface rounded-2xl border border-border p-8 shadow-sm">
        <h2 class="text-xl font-heading font-semibold text-text mb-6">Daftar Cabang</h2>

        <div v-if="loading" class="text-center py-12 text-text-muted">Memuat data...</div>
        <div v-else-if="error" class="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">{{ error }}</div>
        <div v-else-if="!cabangList.length" class="text-center py-12 text-text-muted">Belum ada cabang</div>
        <div v-else class="space-y-3">
          <div
            v-for="cabang in cabangList"
            :key="cabang.cabang_id"
            class="flex items-center gap-4 bg-cream/30 rounded-xl border border-border px-5 py-4"
          >
            <div class="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-text">{{ cabang.nama }}</p>
              <p class="text-xs text-text-muted">{{ cabang.cabang_id }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
