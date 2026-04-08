<script setup>
import { ref, computed, onMounted } from 'vue'
import birdsData from '../../public/data.json'

const birds = ref(birdsData)
const birdCount = ref(birdsData.length)
const searchTerm = ref('')
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 50

const filteredBirds = computed(() => {
  if (!searchTerm.value) return birds.value
  const term = searchTerm.value.toLowerCase().trim()
  return birds.value.filter(bird => 
    bird.name.toLowerCase().includes(term)
  )
})

const paginatedBirds = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredBirds.value.slice(start, start + itemsPerPage)
})

const hasMore = computed(() => {
  return currentPage.value * itemsPerPage < filteredBirds.value.length
})

function loadMore() {
  currentPage.value++
}

function handleSearch(event) {
  searchTerm.value = event.target.value
  currentPage.value = 1
}

function getImageUrl(imageUrl) {
  return `/YeluYelu/images/${imageUrl}`
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="relative max-w-md mx-auto">
        <input
          type="text"
          :value="searchTerm"
          @input="handleSearch"
          placeholder="🔍 搜索夜鹭..."
          class="w-full px-4 py-3 pl-12 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black/50 text-lg"
        >
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
      </div>
      <p class="text-center mt-3 text-gray-600">
        共 {{ filteredBirds.length }} 只夜鹭
      </p>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <i class="fa fa-spinner fa-spin text-4xl"></i>
      <p class="mt-4 text-gray-500">加载中...</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
      <div
        v-for="bird in paginatedBirds"
        :key="bird.id"
        class="group cursor-pointer"
      >
        <div class="relative overflow-hidden border-2 border-black bg-gray-100 aspect-square">
          <img
            :src="getImageUrl(bird.imageUrl)"
            :alt="bird.name"
            class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
            @error="$event.target.src = '/YeluYelu/images/夜鹭.jpg'"
          >
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
        </div>
        <p class="mt-2 text-center font-bold text-lg text-primary group-hover:text-secondary transition-colors">
          {{ bird.name }}
        </p>
      </div>
    </div>

    <div v-if="hasMore" class="text-center mt-8">
      <button
        @click="loadMore"
        class="btn-primary"
      >
        <i class="fa fa-plus mr-2"></i>加载更多
      </button>
    </div>

    <div v-if="filteredBirds.length === 0" class="text-center py-12">
      <i class="fa fa-search text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg">没有找到匹配的夜鹭</p>
    </div>
  </div>
</template>
