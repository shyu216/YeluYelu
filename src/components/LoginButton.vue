<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isAuthenticating" class="flex items-center space-x-3">
    <div class="text-sm">
      <p class="font-bold mb-2">请在 GitHub 授权</p>
      <p class="text-xs text-gray-600 mb-2">访问以下网址并输入验证码：</p>
      <a 
        :href="auth.verificationUrl" 
        target="_blank"
        class="text-blue-600 hover:underline text-sm block mb-2"
      >
        {{ auth.verificationUrl }}
      </a>
      <p class="text-lg font-mono font-bold bg-gray-100 px-4 py-2 inline-block">
        {{ auth.userCode }}
      </p>
      <p v-if="auth.authError" class="text-red-500 text-xs mt-2">
        {{ auth.authError }}
      </p>
      <button 
        @click="auth.cancelDeviceFlow"
        class="mt-3 text-xs text-gray-500 hover:text-gray-700"
      >
        取消
      </button>
    </div>
  </div>

  <button
    v-else-if="!auth.isLoggedIn"
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
