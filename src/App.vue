<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavBar />
    <main class="container mx-auto px-4 pt-24 pb-16 flex-grow">
      <RouterView />
    </main>
    <footer class="bg-white border-t-2 border-black p-4 text-center">
      <p class="text-gray-600">© 2026 夜鹭页录</p>
    </footer>
  </div>
</template>
