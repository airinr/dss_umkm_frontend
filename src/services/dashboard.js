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

export async function getMenuDetail(id) {
  return apiFetch(`/api/menu/${id}`)
}

export async function createMenu(nama, kategori, harga) {
  return apiFetch('/api/menu', {
    method: 'POST',
    body: JSON.stringify({ nama, kategori, harga }),
  })
}

export async function updateMenu(id, data) {
  return apiFetch(`/api/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteMenu(id) {
  return apiFetch(`/api/menu/${id}`, { method: 'DELETE' })
}

export async function getMenuInactive() {
  return apiFetch('/api/menu/inactive')
}

export async function activateMenu(id) {
  return apiFetch(`/api/menu/${id}/activate`, { method: 'POST' })
}

export async function trainMenu(menuName) {
  return apiFetch(`/api/menu/train/${encodeURIComponent(menuName)}`, { method: 'POST' })
}

export async function trainAllMenu() {
  return apiFetch('/api/menu/train/all', { method: 'POST' })
}

export async function getTrainStatus() {
  return apiFetch('/api/menu/train/status')
}

export async function createTransaksi(cabangId, items, tanggal) {
  return apiFetch('/api/transaksi', {
    method: 'POST',
    body: JSON.stringify({ cabang_id: cabangId, items, tanggal }),
  })
}

export async function getEngineering(cabangId) {
  return apiFetch(`/api/hasil-dss/engineering/${cabangId}`)
}

export async function createCabang(id, nama, lokasi) {
  return apiFetch('/api/cabang', {
    method: 'POST',
    body: JSON.stringify({ id, nama, lokasi }),
  })
}
