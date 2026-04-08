import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('github_token') || null)
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  const GITHUB_CLIENT_ID = 'Ov23liuwR1uI018KA8o2'
  const REDIRECT_URI = 'https://shyu216.github.io/YeluYelu'

  function initAuth() {
    if (token.value) {
      fetchUserInfo()
    }
    checkOAuthCallback()
  }

  function checkOAuthCallback() {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      if (accessToken) {
        token.value = accessToken
        localStorage.setItem('github_token', accessToken)
        window.location.hash = ''
        fetchUserInfo()
      }
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return
    
    isLoading.value = true
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token.value}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      if (response.ok) {
        user.value = await response.json()
      } else if (response.status === 401) {
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    } finally {
      isLoading.value = false
    }
  }

  function login() {
    const scope = 'repo'
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}`
    console.log('OAuth URL:', authUrl)
    alert('登录URL: ' + authUrl + '\n\n如果看到这个alert，请告诉我内容')
    window.location.href = authUrl
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('github_token')
  }

  async function handleOAuthCallback(code) {
    console.log('OAuth callback with code:', code)
  }

  return {
    user,
    token,
    isLoading,
    isLoggedIn,
    initAuth,
    login,
    logout,
    fetchUserInfo
  }
})
