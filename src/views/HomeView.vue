<script setup>
import { ref, onMounted, computed } from 'vue'

const birds = ref([])
const birdCount = ref(0)
const imageCount = ref(0)
const searchTerm = ref('')
const isLoading = ref(false)
const hasMoreData = ref(true)
const currentPage = ref(1)

const filteredBirds = computed(() => {
  if (!searchTerm.value) return birds.value
  const term = searchTerm.value.toLowerCase().trim()
  return birds.value.filter(bird => 
    bird.name.toLowerCase().includes(term)
  )
})

onMounted(async () => {
  await fetchBirds()
  await fetchBirdCount()
})

async function fetchBirds() {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const response = await fetch('/data.json')
    const data = await response.json()
    birds.value = data
  } catch (error) {
    console.error('Failed to fetch birds:', error)
  } finally {
    isLoading.value = false
  }
}

async function fetchBirdCount() {
  try {
    const response = await fetch('/data.json')
    const data = await response.json()
    birdCount.value = data.length
    imageCount.value = data.length
  } catch (error) {
    console.error('Failed to fetch count:', error)
  }
}

function handleSearch(event) {
  searchTerm.value = event.target.value
}

function createBirdCard(bird) {
  return {
    id: bird.id,
    name: bird.name,
    imageUrl: `/images/${bird.imageUrl || bird.name}.jpg`
  }
}
</script>

<template>
  <div>
    <!-- 鸟类统计 -->
    <div class="mb-4 mt-4 flex flex-row gap-[12px]">
      <div class="bg-white border-2 border-black p-4 p-6 flex items-center flex-1">
        <div class="w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
          <i class="fa fa-database text-primary text-xl"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm">
            <span class="inline-block md:hidden">已收录</span>
            <span class="hidden md:inline">已收录</span>
            <br class="md:hidden">鸟类
          </p>
          <p class="text-2xl font-bold">{{ birdCount }}</p>
        </div>
      </div>
      <div class="bg-white border-2 border-black p-4 p-6 flex items-center flex-1">
        <div class="w-12 h-12 bg-secondary/10 flex items-center justify-center mr-4">
          <i class="fa fa-image text-secondary text-xl"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm">
            <span class="inline-block md:hidden">已收录</span>
            <span class="hidden md:inline">已收录</span>
            <br class="md:hidden">图片
          </p>
          <p class="text-2xl font-bold">{{ imageCount }}</p>
        </div>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="bg-white border-2 border-black p-4 p-6 mb-8 md:mb-16">
      <div class="relative w-full">
        <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input 
          type="text" 
          placeholder="搜索鸟类名称..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
          @input="handleSearch"
        >
      </div>
    </div>

    <!-- 鸟类画廊 -->
    <div class="grid gallery-fixed-cols gap-1 md:gap-8">
      <div 
        v-for="bird in filteredBirds" 
        :key="bird.id"
        class="bg-white border-2 border-black p-1 card-hover cursor-pointer"
      >
        <img 
          :src="`/images/${bird.imageUrl}`" 
          :alt="bird.name"
          class="w-full h-40 md:h-48 object-cover"
          @error="(e) => e.target.src = '/images/夜鹭.jpg'"
        >
        <p class="text-center font-bold text-sm md:text-base mt-2">{{ bird.name }}</p>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="filteredBirds.length === 0 && !isLoading" class="col-span-full text-center py-12">
      <i class="fa fa-search text-gray-400 text-4xl mb-4"></i>
      <p class="text-gray-500">没有找到匹配的鸟类</p>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="col-span-full text-center py-12">
      <div class="inline-block animate-spin h-12 w-12 border-b-2 border-primary"></div>
      <p class="text-gray-500 mt-4">加载鸟类数据中...</p>
    </div>
  </div>
</template>
