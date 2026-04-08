import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('github_token') || null)
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID'
  const REDIRECT_URI = window.location.origin + '/callback'

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
    alert('将在新窗口打开 GitHub 登录，请完成登录后返回。开发环境可能会看到安全警告，点击"仍然继续"即可。')
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
