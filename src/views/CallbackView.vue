<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleCallback } from '../utils/github'

const router = useRouter()
const status = ref('处理中...')
const error = ref('')

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  
  if (!code) {
    status.value = '未获取到授权码'
    error.value = '授权流程被取消或失败'
    return
  }
  
  try {
    status.value = '正在获取 GitHub 授权...'
    await handleCallback(code, state)
    status.value = '授权成功！正在跳转...'
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    status.value = '授权失败'
    error.value = err.message
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-white shadow-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <div v-if="!error" class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <div v-else class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-red-500 text-2xl">✕</span>
        </div>
        
        <h2 class="text-xl font-bold mb-2">{{ status }}</h2>
        
        <p v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </p>
        
        <p v-else class="text-gray-500 text-sm">
          请稍候，正在返回首页...
        </p>
        
        <router-link 
          to="/" 
          class="inline-block mt-4 text-primary hover:underline"
        >
          如果没有自动跳转，点击这里返回
        </router-link>
      </div>
    </div>
  </div>
</template>
