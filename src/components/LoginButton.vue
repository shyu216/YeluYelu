<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="flex items-center space-x-3">
    <img 
      v-if="auth.user?.avatar_url"
      :src="auth.user.avatar_url" 
      :alt="auth.user.login"
      class="w-8 h-8 rounded-full border-2 border-black"
    >
    <div v-else class="w-8 h-8 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center">
      <i class="fa fa-github"></i>
    </div>
    <span class="font-bold text-sm hidden md:inline">{{ auth.user?.login || 'shyu216-claw' }}</span>
  </div>
</template>
