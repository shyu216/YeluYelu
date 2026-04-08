import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('github_token') || null)
  const isLoading = ref(false)
  const isAuthenticating = ref(false)
  const authError = ref('')

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function initAuth() {
    console.log('[Auth] initAuth called')
    console.log('[Auth] token from localStorage:', token.value ? 'exists' : 'none')
    
    if (token.value) {
      console.log('[Auth] token exists, fetching user info')
      fetchUserInfo()
    }
  }

  async function loginWithPAT(pat) {
    isAuthenticating.value = true
    authError.value = ''
    
    try {
      console.log('[Auth] Validating PAT...')
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${pat}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      
      console.log('[Auth] PAT validation response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('[Auth] PAT valid, user:', userData.login)
        
        token.value = pat
        user.value = userData
        localStorage.setItem('github_token', pat)
        
        isAuthenticating.value = false
        return { success: true }
      } else if (response.status === 401) {
        console.error('[Auth] Invalid PAT')
        authError.value = 'Invalid token. Please check your Personal Access Token.'
        isAuthenticating.value = false
        return { success: false, error: 'Invalid token' }
      } else {
        const text = await response.text()
        console.error('[Auth] PAT validation error:', response.status, text)
        authError.value = `Error: ${response.status}`
        isAuthenticating.value = false
        return { success: false, error: text }
      }
    } catch (error) {
      console.error('[Auth] PAT login error:', error)
      authError.value = error.message
      isAuthenticating.value = false
      return { success: false, error: error.message }
    }
  }

  async function fetchUserInfo() {
    if (!token.value) {
      console.log('[Auth] fetchUserInfo: no token')
      return
    }
    
    console.log('[Auth] fetchUserInfo: fetching from API')
    isLoading.value = true
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token.value}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      console.log('[Auth] fetchUserInfo response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('[Auth] fetchUserInfo success, user:', userData.login)
        user.value = userData
      } else if (response.status === 401) {
        console.log('[Auth] fetchUserInfo: 401 Unauthorized, logging out')
        logout()
      } else {
        const text = await response.text()
        console.log('[Auth] fetchUserInfo: error', response.status, text)
      }
    } catch (error) {
      console.error('[Auth] fetchUserInfo error:', error)
    } finally {
      isLoading.value = false
    }
  }

  function login() {
  }

  function logout() {
    console.log('[Auth] logout')
    token.value = null
    user.value = null
    localStorage.removeItem('github_token')
    authError.value = ''
  }

  return { 
    user, 
    token, 
    isLoading, 
    isAuthenticating,
    authError,
    isLoggedIn, 
    initAuth, 
    login, 
    loginWithPAT,
    logout, 
    fetchUserInfo
  }
})
