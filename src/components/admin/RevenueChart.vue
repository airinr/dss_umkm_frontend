<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
})

const maxPendapatan = computed(() => Math.max(...props.data.map((d) => d.nilai), 1))
const minPendapatan = computed(() => Math.min(...props.data.map((d) => d.nilai)))

function getBarClass(nilai) {
  if (nilai === maxPendapatan.value) return 'bg-gradient-to-r from-blue-400 to-blue-600'
  if (nilai === minPendapatan.value) return 'bg-gradient-to-r from-yellow-300 to-yellow-500'
  return 'bg-gradient-to-r from-gray-300 to-gray-500'
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID')
}
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border p-6 shadow-sm">
    <h3 class="font-heading font-semibold text-text text-lg mb-6">Pendapatan per Cabang</h3>
    <div class="space-y-4">
      <div v-for="item in data" :key="item.nama" class="flex items-center gap-4">
        <span class="text-sm text-text w-44 shrink-0 truncate">{{ item.nama }}</span>
        <div class="flex-1 h-7 bg-cream/70 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="getBarClass(item.nilai)"
            :style="{ width: (item.nilai / maxPendapatan) * 100 + '%' }"
          ></div>
        </div>
        <span class="text-sm font-semibold text-text w-28 text-right shrink-0">{{ formatRupiah(item.nilai) }}</span>
      </div>
    </div>
  </div>
</template>
