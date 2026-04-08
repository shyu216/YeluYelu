<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const patInput = ref('')
const showInput = ref(false)

async function handleLogin() {
  if (!patInput.value.trim()) {
    auth.authError = '请输入 Token'
    return
  }
  
  const result = await auth.loginWithPAT(patInput.value.trim())
  
  if (result.success) {
    showInput.value = false
    patInput.value = ''
  }
}

function startLogin() {
  showInput.value = true
  auth.authError = ''
}

function cancelLogin() {
  showInput.value = false
  patInput.value = ''
  auth.authError = ''
}
</script>

<template>
  <div v-if="showInput" class="flex items-center space-x-2">
    <input
      v-model="patInput"
      type="password"
      placeholder="粘贴 GitHub Personal Access Token"
      class="text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black w-64"
      @keyup.enter="handleLogin"
    >
    <button
      @click="handleLogin"
      :disabled="auth.isAuthenticating"
      class="btn-primary text-sm py-1.5"
    >
      {{ auth.isAuthenticating ? '验证中...' : '确认' }}
    </button>
    <button
      @click="cancelLogin"
      class="text-sm text-gray-500 hover:text-gray-700"
    >
      取消
    </button>
    <p v-if="auth.authError" class="text-red-500 text-xs absolute mt-8">
      {{ auth.authError }}
    </p>
  </div>

  <div v-else-if="!auth.isLoggedIn" class="flex flex-col items-start">
    <button
      @click="startLogin"
      class="btn-primary flex items-center"
    >
      <i class="fa fa-github mr-2"></i>
      GitHub 登录
    </button>
    <p class="text-xs text-gray-500 mt-1">
      需要 repo 权限的 Personal Access Token
    </p>
  </div>

  <div v-else class="flex items-center space-x-3">
    <img 
      :src="auth.user.avatar_url" 
      :alt="auth.user.login"
      class="w-8 h-8 rounded-full border-2 border-black"
    >
    <span class="font-bold text-sm hidden md:inline">{{ auth.user.login }}</span>
    <button 
      @click="auth.logout"
      class="btn-outline text-sm py-1 px-2"
    >
      退出
    </button>
  </div>
</template>
