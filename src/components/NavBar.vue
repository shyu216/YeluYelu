<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UploadModal from './UploadModal.vue'

const router = useRouter()
const showUploadModal = ref(false)

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <header class="bg-white border-b-2 border-black p-4 fixed w-full z-50 transition-all duration-300" id="navbar">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center space-x-2 cursor-pointer" @click="goHome">
        <i class="fa fa-dove text-primary text-5xl"></i>
        <h1 class="text-lg md:text-2xl lg:text-3xl font-bold text-primary">常见鸟类辨识图鉴</h1>
      </div>
      <div class="flex items-center space-x-4">
        <button 
          id="add-bird-btn" 
          class="btn-primary flex items-center"
          @click="showUploadModal = true"
        >
          <i class="fa fa-plus mr-2"></i>上传更多夜师傅丑照
        </button>
      </div>
    </div>
  </header>

  <UploadModal 
    v-if="showUploadModal" 
    @close="showUploadModal = false"
    @uploaded="showUploadModal = false"
  />
</template>
