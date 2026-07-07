<script setup>
import AdminSidebar from '../components/admin/AdminSidebar.vue'
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <AdminSidebar />
    <main class="flex-1 ml-64 p-8">
      <router-view />
    </main>
  </div>
</template>
