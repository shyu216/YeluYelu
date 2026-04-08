import { Octokit } from 'octokit'

let repoConfig = {
  owner: 'shyu216',
  repo: 'YeluYelu',
  baseBranch: 'main'
}

export async function createPullRequest(token, { fileName, fileContent, commitMessage }) {
  const octokit = new Octokit({ auth: token })
  
  const branchName = `upload/${fileName.replace(/\.[^/.]+$/, '').slice(0, 50)}-${Date.now()}`
  const filePath = `public/images/${fileName}`

  try {
    const { data: user } = await octokit.rest.users.getAuthenticated()
    console.log('[GitHub] Authenticated as:', user.login)
    
    const { data: refData } = await octokit.rest.git.getRef({
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      ref: `heads/${repoConfig.baseBranch}`,
    })
    const baseSha = refData.object.sha
    console.log('[GitHub] Base SHA:', baseSha)

    console.log('[GitHub] Creating branch:', branchName)
    await octokit.rest.git.createRef({
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    })

    console.log('[GitHub] Uploading file:', filePath)
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      path: filePath,
      message: commitMessage || `feat: upload ${fileName}`,
      content: fileContent,
      branch: branchName,
    })

    console.log('[GitHub] Creating PR')
    const { data: pr } = await octokit.rest.pulls.create({
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      title: commitMessage || `Upload: ${fileName}`,
      body: `由用户 ${user.login} 上传\n\n文件: ${fileName}\n时间: ${new Date().toLocaleString()}`,
      head: branchName,
      base: repoConfig.baseBranch,
    })

    return {
      success: true,
      prNumber: pr.number,
      prUrl: pr.html_url,
      branchName
    }
  } catch (error) {
    console.error('[GitHub] Error:', error.status, error.message)
    if (error.status === 404) {
      return {
        success: false,
        error: 'API 权限不足。请确保 Token 有 repo 完整权限。'
      }
    }
    return {
      success: false,
      error: error.message
    }
  }
}

export function setRepoConfig(owner, repo, baseBranch = 'main') {
  if (owner) repoConfig.owner = owner
  if (repo) repoConfig.repo = repo
  if (baseBranch) repoConfig.baseBranch = baseBranch
}

export function getRepoConfig() {
  return { ...repoConfig }
}
