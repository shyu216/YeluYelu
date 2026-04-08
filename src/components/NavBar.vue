<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <header class="bg-white border-b-2 border-black p-4 fixed w-full z-50 transition-all duration-300" id="navbar">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center space-x-2 cursor-pointer" @click="goHome">
        <i class="fa fa-dove text-primary text-5xl"></i>
        <h1 class="text-lg md:text-2xl lg:text-3xl font-bold text-primary">常见生物辨识图鉴</h1>
      </div>
    </div>
  </header>
</template>
