<script setup>
import { computed } from "vue";

const props = defineProps({
  data: { type: Array, required: true },
  modelValue: { type: Object, default: () => ({ start: "", end: "" }) },
});

const emit = defineEmits(["update:modelValue"]);

const maxPendapatan = computed(() =>
  Math.max(...props.data.map((d) => d.nilai), 1),
);
const minPendapatan = computed(() =>
  Math.min(...props.data.map((d) => d.nilai)),
);

const totalPendapatan = computed(() =>
  props.data.reduce((s, d) => s + d.nilai, 0),
);
const rataPendapatan = computed(() =>
  Math.round(totalPendapatan.value / props.data.length),
);
const tertinggi = computed(() =>
  props.data.find((d) => d.nilai === maxPendapatan.value),
);
const terendah = computed(() =>
  props.data.find((d) => d.nilai === minPendapatan.value),
);
const bawahRata = computed(() =>
  props.data.filter((d) => d.nilai < rataPendapatan.value),
);

function getBarClass(nilai) {
  if (nilai === maxPendapatan.value) return "bg-blue-500";
  if (nilai === minPendapatan.value) return "bg-yellow-400";
  return "bg-gray-300";
}

function formatRupiah(num) {
  return "Rp " + num.toLocaleString("id-ID");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function onDateChange(e) {
  const start = e.target.value;
  if (!start) return;
  const end = new Date(start + "T00:00:00");
  end.setDate(end.getDate() + 6);
  emit("update:modelValue", { start, end: end.toISOString().split("T")[0] });
}

const periodeLabel = computed(() => {
  if (!props.modelValue.start || !props.modelValue.end) return "";
  return `${formatDate(props.modelValue.start)} - ${formatDate(props.modelValue.end)}`;
});
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border p-6 shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h3 class="font-heading font-semibold text-text text-lg">
          Pendapatan per Cabang
        </h3>
        <p class="text-sm text-text-muted mt-1">Periode: {{ periodeLabel }}</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <label class="text-xs text-text-muted"
          >Pilih tanggal mulai (rentang 7 hari)</label
        >
        <input
          type="date"
          :value="modelValue.start"
          @input="onDateChange"
          class="px-3 py-2 rounded-xl border border-border text-sm text-text bg-surface outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
        <p class="text-xs text-blue-600 font-medium uppercase tracking-wider">
          Total
        </p>
        <p class="text-sm font-bold text-blue-800 mt-1">
          {{ formatRupiah(totalPendapatan) }}
        </p>
      </div>
      <div class="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200">
        <p
          class="text-xs text-emerald-600 font-medium uppercase tracking-wider"
        >
          Rata-rata
        </p>
        <p class="text-sm font-bold text-emerald-800 mt-1">
          {{ formatRupiah(rataPendapatan) }}
        </p>
      </div>
      <div class="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-200">
        <p class="text-xs text-indigo-600 font-medium uppercase tracking-wider">
          Tertinggi
        </p>
        <p class="text-sm font-bold text-indigo-800 mt-1 truncate">
          {{ tertinggi?.nama || "-" }}
        </p>
        <p class="text-xs text-indigo-600 mt-0.5">
          {{ formatRupiah(tertinggi?.nilai || 0) }}
        </p>
      </div>
      <div
        v-if="bawahRata.length"
        class="bg-amber-50 rounded-xl px-4 py-3 border border-amber-200"
      >
        <p class="text-xs text-amber-600 font-medium uppercase tracking-wider">
          Di Bawah Rata-rata
        </p>
        <p class="text-sm font-bold text-amber-800 mt-1">
          {{ bawahRata.length }} cabang
        </p>
        <p class="text-xs text-amber-600 mt-0.5 truncate">
          {{ bawahRata.map((d) => d.nama).join(", ") }}
        </p>
      </div>
    </div>
    <div class="space-y-4">
      <div
        v-for="item in data"
        :key="item.nama"
        class="flex items-center gap-4"
      >
        <span class="w-24 md:w-32 text-right text-sm font-medium text-text truncate">{{ item.nama }}</span>
        <div class="flex-1 bg-gray-100 rounded h-7 relative overflow-hidden">
          <div
            class="h-full rounded transition-all duration-300"
            :class="getBarClass(item.nilai)"
            :style="{ width: Math.max((item.nilai / maxPendapatan) * 100, 4) + '%' }"
          ></div>
        </div>
        <span class="w-24 md:w-32 text-sm font-semibold text-text">{{ formatRupiah(item.nilai) }}</span>
      </div>
    </div>
  </div>
</template>
