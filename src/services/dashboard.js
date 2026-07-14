import { apiFetch } from './api'

export async function getSemuaCabang() {
  return apiFetch('/api/dashboard/semua-cabang')
}

export async function getPerbandingan() {
  return apiFetch('/api/dashboard/perbandingan')
}

export async function getHasilDssGlobal() {
  return apiFetch('/api/dashboard/hasil-dss-global')
}

export async function getHasilDss(cabangId) {
  return apiFetch(`/api/hasil-dss/${cabangId}`)
}

export async function getPrediksi(cabangId) {
  return apiFetch(`/api/hasil-dss/prediksi/${cabangId}`)
}

export async function getPromo(cabangId) {
  return apiFetch(`/api/hasil-dss/promo/${cabangId}`)
}

export async function getTransaksi(cabangId) {
  return apiFetch(`/api/transaksi/${cabangId}`)
}

export async function getMenu() {
  return apiFetch('/api/menu')
}

export async function createTransaksi(cabangId, items, tanggal) {
  return apiFetch('/api/transaksi', {
    method: 'POST',
    body: JSON.stringify({ cabang_id: cabangId, items, tanggal }),
  })
}

export async function createCabang(id, nama, lokasi) {
  return apiFetch('/api/cabang', {
    method: 'POST',
    body: JSON.stringify({ id, nama, lokasi }),
  })
}
