<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: null },
})
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border p-6 flex items-center gap-5 shadow-sm">
    <div v-if="icon" class="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
      <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
      </svg>
    </div>
    <div>
      <p class="text-sm text-text-muted">{{ label }}</p>
      <p class="text-3xl font-heading font-bold text-text mt-1">{{ value }}</p>
    </div>
  </div>
</template>
