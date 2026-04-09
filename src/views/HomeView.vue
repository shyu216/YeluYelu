<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import birdsData from '../../public/data.json'
import simplePinyin from 'simple-pinyin'
import ActionButtons from '../components/ActionButtons.vue'

const toPinyin = simplePinyin

const birds = ref(birdsData)
const displayedBirds = ref([])
const searchTerm = ref('')
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 50
const hasMore = ref(true)
const selectedBird = ref(null)
const searchFocused = ref(false)
const scrollY = ref(0)
const scrollHeight = ref(0)
const clientHeight = ref(0)
const currentRowId = ref(null)

const uniqueBirdNames = computed(() => {
  const nameSet = new Set()
  birds.value.forEach(bird => {
    nameSet.add(bird.name)
  })
  return Array.from(nameSet)
})

function getPinyin(name) {
  try {
    return toPinyin(name).toLowerCase()
  } catch {
    return ''
  }
}

const filteredSuggestions = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return uniqueBirdNames.value
  return uniqueBirdNames.value.filter(name => {
    const lowerName = name.toLowerCase()
    const pinyin = getPinyin(name)
    return lowerName.includes(term) || pinyin.includes(term)
  })
})

const uniqueBirds = computed(() => {
  const seen = new Set()
  return birds.value.filter(bird => {
    if (seen.has(bird.imageUrl)) return false
    seen.add(bird.imageUrl)
    return true
  })
})

const filteredBirds = computed(() => {
  if (!searchTerm.value) return uniqueBirds.value
  const term = searchTerm.value.toLowerCase().trim()
  return uniqueBirds.value.filter(bird => 
    bird.name.toLowerCase().includes(term)
  )
})

const birdCount = computed(() => uniqueBirdNames.value.length)
const imageCount = computed(() => birds.value.length)

const paginatedBirds = computed(() => {
  const start = 0
  const end = currentPage.value * itemsPerPage
  return filteredBirds.value.slice(start, end)
})

function loadMore() {
  if (isLoading.value || !hasMore.value) return
  
  const newPage = currentPage.value + 1
  const newEnd = newPage * itemsPerPage
  
  if (newEnd >= filteredBirds.value.length) {
    currentPage.value = Math.ceil(filteredBirds.value.length / itemsPerPage)
    hasMore.value = false
  } else {
    currentPage.value = newPage
  }
}

function handleSearch(event) {
  const value = event.target ? event.target.value : event
  searchTerm.value = value
  currentPage.value = 1
  hasMore.value = true
}

function selectSearchTerm(term) {
  searchTerm.value = term
  currentPage.value = 1
  hasMore.value = true
}

function handleSearchFocus() {
  searchFocused.value = true
}

function handleSearchBlur() {
  setTimeout(() => {
    searchFocused.value = false
  }, 200)
}

function getImageUrl(imageUrl) {
  return `/YeluYelu/images/${imageUrl}`
}

function init() {
  displayedBirds.value = paginatedBirds.value
}

function handleScroll() {
  scrollY.value = window.scrollY || document.documentElement.scrollTop
  scrollHeight.value = document.documentElement.scrollHeight
  clientHeight.value = document.documentElement.clientHeight
  
  if (scrollY.value + clientHeight.value >= scrollHeight.value - 100) {
    loadMore()
  }
  
  updateCurrentRowId()
}

function updateCurrentRowId() {
  const gallery = document.getElementById('bird-gallery')
  if (!gallery) return
  
  const items = gallery.querySelectorAll('[data-bird-id]')
  if (items.length === 0) {
    currentRowId.value = null
    return
  }
  
  const viewportTop = scrollY.value
  const viewportBottom = scrollY.value + clientHeight.value
  
  let closestItem = null
  let closestDistance = Infinity
  let foundVisible = false
  
  items.forEach(item => {
    const rect = item.getBoundingClientRect()
    const itemTop = rect.top + window.scrollY
    const itemBottom = itemTop + rect.height
    
    if (itemTop >= viewportTop - rect.height && itemBottom <= viewportBottom + rect.height) {
      const distance = Math.abs((itemTop + itemBottom) / 2 - (viewportTop + viewportBottom) / 2)
      if (distance < closestDistance) {
        closestDistance = distance
        closestItem = item
        foundVisible = true
      }
    }
  })
  
  if (closestItem) {
    currentRowId.value = parseInt(closestItem.dataset.birdId)
    return
  }
  
  if (filteredBirds.value.length > 0 && scrollHeight.value > clientHeight.value) {
    const scrollProgress = scrollY.value / (scrollHeight.value - clientHeight.value)
    const estimatedIndex = Math.floor(scrollProgress * filteredBirds.value.length)
    const estimatedBird = filteredBirds.value[Math.min(estimatedIndex, filteredBirds.value.length - 1)]
    if (estimatedBird) {
      currentRowId.value = estimatedBird.id
    }
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToBottom() {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  
  setTimeout(() => {
    scrollY.value = window.scrollY || document.documentElement.scrollTop
    scrollHeight.value = document.documentElement.scrollHeight
    clientHeight.value = document.documentElement.clientHeight
    
    if (scrollY.value + clientHeight.value >= scrollHeight.value - 100) {
      loadMore()
    }
  }, 350)
}

function openDownloadModal(bird) {
  selectedBird.value = bird
}

function closeDownloadModal() {
  selectedBird.value = null
}

function downloadImage(bird) {
  const imageUrl = getImageUrl(bird.imageUrl)
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = `${bird.name}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  init()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <div class="mb-4 mt-4 flex flex-row gap-[12px]">
      <div class="bg-white border-2 border-black p-4 p-6 flex items-center flex-1">
        <div class="w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
          <i class="fa fa-database text-primary text-xl"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm">
            <span class="inline-block md:hidden">已收录</span>
            <span class="hidden md:inline">已收录</span>
            <br class="md:hidden">生物
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

    <div class="bg-white border-2 border-black p-4 p-6 no-export">
      <div class="relative w-full">
        <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input 
          type="text" 
          :value="searchTerm"
          @input="handleSearch"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
          placeholder="搜索生物名称..."
          class="w-full pl-10 pr-24 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
        <div 
          v-if="searchTerm || searchFocused" 
          class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto z-10"
        >
          <div
            v-for="suggestion in filteredSuggestions"
            :key="suggestion"
            class="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
            @click="selectSearchTerm(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <ActionButtons />
    </div>

    <div id="bird-gallery-export mt-8 md:mt-16 ">
      <p class="text-black ml-1 mt-2 mb-4 text-base export-only">来自：夜鹭页录 https://github.com/KatGreene/YeluYelu</p>

      <div id="bird-gallery" class="grid grid-cols-4 gap-2 md:gap-4 lg:gap-6 export-area">
        <div v-if="paginatedBirds.length === 0 && !isLoading" class="col-span-full text-center py-12">
          <div class="inline-block animate-spin h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-gray-500 mt-4">加载生物数据中...</p>
        </div>

        <div
          v-for="bird in paginatedBirds"
          :key="bird.id"
          :data-bird-id="bird.id"
          class="group cursor-pointer"
          @click="openDownloadModal(bird)"
        >
          <div class="relative overflow-hidden border-2 border-black bg-gray-100 aspect-square">
            <img
              :src="getImageUrl(bird.imageUrl)"
              :alt="bird.name"
              class="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
              loading="lazy"
              @error="$event.target.src = '/YeluYelu/images/夜鹭.jpg'"
            >
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
          </div>
          <p class="mt-2 text-center font-bold text-lg text-primary group-hover:text-secondary transition-colors">
            {{ bird.name }}
          </p>
        </div>

        <div v-if="isLoading" class="col-span-full text-center py-12">
          <div class="inline-block animate-spin h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-gray-500 mt-4">加载中...</p>
        </div>
      </div>
    </div>

    <div class="fixed right-6 top-1/2 -translate-y-1/2 z-40 no-export">
      <div 
        v-if="scrollY > 100 && currentRowId !== null"
        class="bg-primary text-white px-3 py-2 rounded-lg shadow-lg text-sm font-bold min-w-[60px] text-center"
      >
        ID: {{ currentRowId }}
      </div>
    </div>

    <div class="fixed bottom-6 right-6 flex flex-col gap-2 z-40 no-export">
      <button 
        v-if="scrollY > 200"
        @click="scrollToTop"
        class="w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition-colors flex items-center justify-center"
        title="回到顶部"
      >
        <i class="fa fa-arrow-up"></i>
      </button>
      <button 
        v-if="scrollY + clientHeight < scrollHeight - 200"
        @click="scrollToBottom"
        class="w-12 h-12 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary/80 transition-colors flex items-center justify-center"
        title="回到最下"
      >
        <i class="fa fa-arrow-down"></i>
      </button>
    </div>

    <div 
      v-if="selectedBird" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-export"
      @click.self="closeDownloadModal"
    >
      <div class="bg-white shadow-2xl w-full max-w-lg mx-4 rounded-lg overflow-hidden">
        <div class="flex justify-between items-center p-6 border-b">
          <h2 class="text-xl font-bold text-primary">下载图片</h2>
          <button 
            @click="closeDownloadModal" 
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <img 
              :src="getImageUrl(selectedBird.imageUrl)" 
              :alt="selectedBird.name"
              class="w-full h-64 object-contain border-2 border-black"
            >
          </div>
          
          <div class="mb-6">
            <p class="text-lg font-bold text-primary mb-2">{{ selectedBird.name }}</p>
            <p class="text-sm text-gray-600">
              点击下方按钮下载此图片
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button 
              @click="closeDownloadModal" 
              class="btn-outline px-6 py-2"
            >
              取消
            </button>
            <button 
              @click="downloadImage(selectedBird)" 
              class="btn-primary px-6 py-2"
            >
              <i class="fa fa-download mr-2"></i>下载
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
