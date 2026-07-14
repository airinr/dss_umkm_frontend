# B.A.R.I.S.T.A.

**Big data Analytics for Retail Intelligence, Security, Transaction, and Analysis**

Dashboard manajemen coffee shop dengan dua peran (Pusat & Cabang), dilengkapi big data analytics untuk prediksi penjualan, rekomendasi promo, dan visualisasi data.

## Fitur

### Pusat
- **Dashboard** — Ringkasan seluruh cabang (jumlah cabang, total pendapatan, total transaksi) dalam periode 7 hari
- **Chart Perbandingan** — Bar chart horizontal pendapatan per cabang
- **Kelola Cabang** — Daftar cabang, pencarian, dan form tambah cabang baru (ID otomatis, dua langkah: create cabang + register user)
- **Detail Cabang** — Info lengkap per cabang dengan 4 tab: Tren Penjualan (line chart), Prediksi, Promo, Riwayat Transaksi (filter tanggal + export Excel)

### Cabang
- **Input Transaksi** — Form multi-item dengan pencarian menu (autocomplete), harga otomatis terisi, total transaksi real-time, toggle lihat password
- **Dashboard** — Ringkasan pendapatan, menu terlaris, transaksi + tab card berisi Tren Penjualan, Prediksi, Promo, Riwayat Transaksi
- **Prediksi Menu Harian** — Prediksi jumlah penjualan menu hari ini
- **Promo Harian** — Rekomendasi promo berdasarkan hari
- **Export Excel** — Data transaksi bisa diexport ke file `.xlsx`

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Vue 3 (Composition API + `<script setup>`) | Framework frontend |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Utility-first CSS |
| Chart.js + vue-chartjs | Grafik line chart & bar chart |
| xlsx | Export dan import Excel |
| Vue Router | Routing role-based |

## Role & Routing

| Role | Prefix | Halaman |
|------|--------|---------|
| Pusat | `/admin/pusat/` | Dashboard, Kelola Cabang, Detail Cabang |
| Cabang | `/admin/cabang/` | Transaksi, Dashboard, Detail Cabang |

Login redirect: Pusat → `/admin/pusat/dashboard`, Cabang → `/admin/cabang/transaksi`

## Instalasi

```bash
cd frontend
npm install
npx vite dev
```

Akses di `http://localhost:5173`

## Build Produksi

```bash
npx vite build
```

Hasil build di folder `dist/`.

## Struktur Folder

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── admin/
│   │       ├── BranchCard.vue       # Card ringkasan cabang
│   │       ├── CabangSidebar.vue    # Sidebar role cabang
│   │       ├── PusatSidebar.vue     # Sidebar role pusat
│   │       ├── RevenueChart.vue     # Bar chart pendapatan
│   │       ├── SalesChart.vue       # Line chart penjualan
│   │       └── SummaryCard.vue      # Card ringkasan umum
│   ├── layouts/
│   │   ├── CabangLayout.vue
│   │   └── PusatLayout.vue
│   ├── services/
│   │   ├── api.js                   # Fetch wrapper dengan JWT
│   │   └── dashboard.js             # Semua endpoint API
│   ├── stores/
│   │   └── auth.js                  # Reactive auth store
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── pusat/
│   │   │   ├── DashboardView.vue
│   │   │   ├── BranchDetailView.vue
│   │   │   └── BranchManagementView.vue
│   │   └── cabang/
│   │       ├── DashboardView.vue
│   │       ├── BranchDetailView.vue
│   │       └── TransaksiView.vue
│   ├── router/
│   │   └── index.js                 # Route definitions + guards
│   ├── style.css                    # Tailwind theme + custom colors
│   └── main.js
├── index.html
├── vite.config.js
└── package.json
```

## Tema Warna

| Variabel | Warna | Penggunaan |
|----------|-------|------------|
| `--color-primary` | `#6F4E37` | Coklat utama |
| `--color-primary-dark` | `#4A2C2A` | Coklat tua |
| `--color-secondary` | `#D4A574` | Coklat muda/aksen |
| `--color-cream` | `#F5E6CC` | Krem background |
| `--color-background` | `#FFFBF0` | Latar halaman |
| `--color-success` | `#16A34A` | Hijau sukses |
| `--color-success-dark` | `#15803D` | Hijau tua (export) |
| `--color-danger` | `#DC2626` | Merah error |

## API Endpoints

Semua API diproksi melalui Vite (`/api` → `https://medibox.rutherweb.my.id/`).

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login user |
| `/api/auth/register` | POST | Register user (pusat) |
| `/api/cabang` | POST | Create cabang |
| `/api/menu` | GET | Daftar menu + harga |
| `/api/transaksi/{cabang_id}` | GET | Transaksi per cabang |
| `/api/transaksi` | POST | Tambah transaksi |
| `/api/dashboard/semua-cabang` | GET | Ringkasan semua cabang |
| `/api/dashboard/perbandingan` | GET | Data perbandingan cabang |
| `/api/hasil-dss/prediksi/{cabang_id}` | GET | Prediksi penjualan |
| `/api/hasil-dss/promo/{cabang_id}` | GET | Rekomendasi promo |
| `/api/hasil-dss/{cabang_id}` | GET | Hasil DSS cabang |

## Lisensi

© 2026 B.A.R.I.S.T.A.
