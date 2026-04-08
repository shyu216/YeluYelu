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
    console.log('[Auth] current URL:', window.location.href)
    
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
      console.log('[Auth] Calling GitHub device/code API...')
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
      
      console.log('[Auth] Response status:', response.status)
      const data = await response.json()
      console.log('[Auth] Device code response:', data)
      
      if (data.error) {
        console.error('[Auth] Device flow error:', data.error, data.error_description)
        authError.value = data.error_description || data.error
        isAuthenticating.value = false
        return
      }
      
      if (data.device_code) {
        deviceCode.value = data.device_code
        userCode.value = data.user_code
        verificationUrl.value = data.verification_uri
        console.log('[Auth] Device code received, starting poll')
        
        pollForToken(data.device_code, data.interval || 5)
      } else {
        authError.value = 'Failed to start device flow'
        isAuthenticating.value = false
      }
    } catch (error) {
      console.error('[Auth] Device flow error:', error)
      authError.value = error.message
      isAuthenticating.value = false
    }
  }

  async function pollForToken(deviceCodeParam, interval) {
    console.log('[Auth] Starting token poll, interval:', interval)
    
    const poll = async () => {
      if (!isAuthenticating.value) {
        console.log('[Auth] Poll cancelled')
        return
      }
      
      try {
        console.log('[Auth] Polling for token...')
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code: deviceCodeParam,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        })
        
        console.log('[Auth] Poll response status:', response.status)
        const data = await response.json()
        console.log('[Auth] Poll response:', data)
        
        if (data.access_token) {
          console.log('[Auth] Token received!')
          token.value = data.access_token
          localStorage.setItem('github_token', data.access_token)
          isAuthenticating.value = false
          fetchUserInfo()
        } else if (data.error === 'authorization_pending') {
          console.log('[Auth] Waiting for user authorization...')
          setTimeout(poll, (interval || 5) * 1000)
        } else if (data.error === 'expired_token') {
          console.log('[Auth] Token expired')
          authError.value = 'Authorization expired. Please try again.'
          isAuthenticating.value = false
        } else if (data.error === 'slow_down') {
          console.log('[Auth] Slow down, increasing interval')
          setTimeout(poll, ((interval || 5) + 1) * 1000)
        } else if (data.error) {
          console.log('[Auth] Poll error:', data.error)
          authError.value = data.error_description || data.error
          isAuthenticating.value = false
        }
      } catch (error) {
        console.error('[Auth] Poll error:', error)
        setTimeout(poll, (interval || 5) * 1000)
      }
    }
    
    setTimeout(poll, (interval || 5) * 1000)
  }

  function cancelDeviceFlow() {
    isAuthenticating.value = false
    deviceCode.value = ''
    userCode.value = ''
    verificationUrl.value = ''
    authError.value = ''
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
