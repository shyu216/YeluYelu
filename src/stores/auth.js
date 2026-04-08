import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('github_token') || null)
  const isLoading = ref(false)
  const isAuthenticating = ref(false)
  const authError = ref('')
  const deviceCode = ref('')
  const userCode = ref('')
  const verificationUrl = ref('')

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  const GITHUB_CLIENT_ID = 'Ov23liuwR1uI018KA8o2'

  function initAuth() {
    console.log('[Auth] initAuth called')
    console.log('[Auth] token from localStorage:', token.value ? 'exists' : 'none')
    
    if (token.value) {
      console.log('[Auth] token exists, fetching user info')
      fetchUserInfo()
    }
  }

  async function startDeviceFlow() {
    isAuthenticating.value = true
    authError.value = ''
    console.log('[Auth] Starting device flow')
    
    try {
      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          scope: 'repo'
        })
      })
      
      const data = await response.json()
      console.log('[Auth] Device code response:', data)
      
      if (data.device_code) {
        deviceCode.value = data.device_code
        userCode.value = data.user_code
        verificationUrl.value = data.verification_uri
        
        pollForToken(data.device_code, data.interval || 5)
      } else {
        authError.value = 'Failed to start device flow'
      }
    } catch (error) {
      console.error('[Auth] Device flow error:', error)
      authError.value = error.message
      isAuthenticating.value = false
    }
  }

  async function pollForToken(deviceCode, interval) {
    console.log('[Auth] Starting token poll')
    
    const poll = async () => {
      if (!isAuthenticating.value) return
      
      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        })
        
        const data = await response.json()
        console.log('[Auth] Token poll response:', data)
        
        if (data.access_token) {
          token.value = data.access_token
          localStorage.setItem('github_token', data.access_token)
          isAuthenticating.value = false
          fetchUserInfo()
        } else if (data.error === 'authorization_pending') {
          console.log('[Auth] Waiting for user authorization...')
          setTimeout(poll, interval * 1000)
        } else if (data.error === 'expired_token') {
          authError.value = 'Authorization expired. Please try again.'
          isAuthenticating.value = false
        } else if (data.error) {
          authError.value = data.error_description || data.error
          isAuthenticating.value = false
        }
      } catch (error) {
        console.error('[Auth] Poll error:', error)
        setTimeout(poll, interval * 1000)
      }
    }
    
    setTimeout(poll, interval * 1000)
  }

  function cancelDeviceFlow() {
    isAuthenticating.value = false
    deviceCode.value = ''
    userCode.value = ''
    verificationUrl.value = ''
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
        console.log('[Auth] fetchUserInfo: error', response.status)
      }
    } catch (error) {
      console.error('[Auth] fetchUserInfo error:', error)
    } finally {
      isLoading.value = false
    }
  }

  function login() {
    startDeviceFlow()
  }

  function logout() {
    console.log('[Auth] logout')
    token.value = null
    user.value = null
    localStorage.removeItem('github_token')
    cancelDeviceFlow()
  }

  return { 
    user, 
    token, 
    isLoading, 
    isAuthenticating,
    authError,
    deviceCode,
    userCode,
    verificationUrl,
    isLoggedIn, 
    initAuth, 
    login, 
    logout, 
    fetchUserInfo,
    cancelDeviceFlow
  }
})
