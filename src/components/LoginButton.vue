<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <button
    v-if="!auth.isLoggedIn"
    @click="auth.login"
    class="btn-primary flex items-center"
  >
    <i class="fa fa-github mr-2"></i>
    GitHub 登录
  </button>

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
