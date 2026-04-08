import { Octokit } from 'octokit'

const CLIENT_ID = 'Ov23liuwR1uI018KA8o2'
const SCOPES = 'public_repo'

export function getAuthUrl() {
  const state = generateState()
  localStorage.setItem('github_oauth_state', state)
  
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/callback')}&scope=${SCOPES}&state=${state}`
}

export async function handleCallback(code, state) {
  const savedState = localStorage.getItem('github_oauth_state')
  
  if (state !== savedState) {
    throw new Error('Invalid state parameter')
  }
  
  localStorage.removeItem('github_oauth_state')
  
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
  
  localStorage.setItem('github_token', data.access_token)
  
  const octokit = new Octokit({ auth: data.access_token })
  const { data: user } = await octokit.rest.users.getAuthenticated()
  
  return {
    token: data.access_token,
    user: user
  }
}

export function getStoredToken() {
  return localStorage.getItem('github_token')
}

export function logout() {
  localStorage.removeItem('github_token')
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
    const { data: uploadInfo } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issue.number
    })
    
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
