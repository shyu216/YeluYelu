import { Octokit } from 'octokit'

const CLIENT_ID = 'Ov23liuwR1uI018KA8o2'
const SCOPES = 'public_repo'
const TOKEN_COOKIE_NAME = 'github_token'

function setCookie(name, value, days = 30) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

export function getAuthUrl() {
  const state = generateState()
  setCookie('oauth_state', state, 1)
  
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=https://shyu216.github.io/YeluYelu/&scope=${SCOPES}&state=${state}`
}

export async function handleCallback(code, state) {
  const savedState = getCookie('oauth_state')
  
  if (state !== savedState) {
    throw new Error('Invalid state parameter')
  }
  
  deleteCookie('oauth_state')
  
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      code: code
    })
  })
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error_description)
  }
  
  setCookie(TOKEN_COOKIE_NAME, data.access_token, 30)
  
  const octokit = new Octokit({ auth: data.access_token })
  const { data: user } = await octokit.rest.users.getAuthenticated()
  
  return {
    token: data.access_token,
    user: user
  }
}

export function getStoredToken() {
  return getCookie(TOKEN_COOKIE_NAME)
}

export function logout() {
  deleteCookie(TOKEN_COOKIE_NAME)
}

export async function createIssueWithImage(token, title, body, imageFile) {
  const octokit = new Octokit({ auth: token })
  
  const owner = 'shyu216'
  const repo = 'YeluYelu'
  
  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body
  })
  
  if (imageFile) {
    const UPLOAD_URL = `https://uploads.github.com/repos/${owner}/${repo}/issues/${issue.number}/attachments`
    
    const formData = new FormData()
    formData.append('file', imageFile)
    
    await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      },
      body: formData
    })
  }
  
  return issue
}

function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
