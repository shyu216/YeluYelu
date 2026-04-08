<script setup>
import { ref, onMounted, computed } from 'vue'
import birdsData from '../../public/data.json'

const birds = ref(birdsData)
const birdCount = ref(birdsData.length)
const imageCount = ref(birdsData.length)
const searchTerm = ref('')
const isLoading = ref(false)
const hasMoreData = ref(true)
const currentPage = ref(1)

console.log('[Home] birds loaded:', birds.value.length)

const filteredBirds = computed(() => {
  if (!searchTerm.value) return birds.value
  const term = searchTerm.value.toLowerCase().trim()
  return birds.value.filter(bird => 
    bird.name.toLowerCase().includes(term)
  )
})

onMounted(async () => {
})

async function fetchBirds() {
}

async function fetchBirdCount() {
}

function handleSearch(event) {
  searchTerm.value = event.target.value
}
</script>

<template>
  <div class="text-center py-8">
    <p class="text-gray-500">Loading...</p>
  </div>
</template>
