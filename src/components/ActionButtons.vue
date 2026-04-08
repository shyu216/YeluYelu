<script setup>
import { ref } from 'vue'
import birdsData from '../../public/data.json'

const isGeneratingLongImage = ref(false)
const isLoading = ref(false)
const nextIssueNumber = ref(0)

const getImageUrl = (imageUrl) => {
  return `/YeluYelu/images/${imageUrl}`
}

async function generateLongImage() {
  if (isGeneratingLongImage.value) return
  isGeneratingLongImage.value = true

  try {
    const uniqueBirds = []
    const seen = new Set()
    birdsData.forEach(bird => {
      if (!seen.has(bird.imageUrl)) {
        seen.add(bird.imageUrl)
        uniqueBirds.push(bird)
      }
    })

    const cols = 4
    const imgWidth = 300
    const imgHeight = 300
    const padding = 20
    const labelHeight = 40
    
    const rows = Math.ceil(uniqueBirds.length / cols)
    const canvasWidth = cols * imgWidth + (cols + 1) * padding
    const canvasHeight = rows * (imgHeight + labelHeight + padding) + padding + 50

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('常见生物辨识图鉴', canvasWidth / 2, 50)

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
      })
    }

    for (let i = 0; i < uniqueBirds.length; i++) {
      const bird = uniqueBirds[i]
      const col = i % cols
      const row = Math.floor(i / cols)
      
      const x = padding + col * (imgWidth + padding)
      const y = padding + 72 + row * (imgHeight + labelHeight + padding)
      
      try {
        const img = await loadImage(getImageUrl(bird.imageUrl))
        
        const scale = Math.min(imgWidth / img.width, imgHeight / img.height)
        const drawWidth = img.width * scale
        const drawHeight = img.height * scale
        const drawX = x + (imgWidth - drawWidth) / 2
        const drawY = y + (imgHeight - drawHeight) / 2
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        
        ctx.fillStyle = '#333333'
        ctx.font = '48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(bird.name, x + imgWidth / 2, y + imgHeight + 54)
      } catch (error) {
        console.error(`Failed to load image for ${bird.name}:`, error)
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(x, y, imgWidth, imgHeight)
        ctx.fillStyle = '#999999'
        ctx.font = '48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('图片加载失败', x + imgWidth / 2, y + imgHeight / 2 + 16)
      }
    }

    const link = document.createElement('a')
    link.download = '夜师傅图鉴.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('生成长图失败:', error)
    alert('生成长图失败，请稍后重试')
  } finally {
    isGeneratingLongImage.value = false
  }
}

async function getNextIssueNumber() {
  try {
    const REPO_OWNER = 'shyu216'
    const REPO_NAME = 'YeluYelu'
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`
    
    const response = await fetch(apiUrl)
    if (response.ok) {
      const issues = await response.json()
      const openIssues = issues.filter(issue => issue.state === 'open')
      nextIssueNumber.value = openIssues.length + 1
    }
  } catch (error) {
    console.error('获取 Issue 数量失败:', error)
    nextIssueNumber.value = 1
  }
}

function openGitHubIssue() {
  const REPO_OWNER = 'shyu216'
  const REPO_NAME = 'YeluYelu'
  
  const issueTitle = `夜师傅的第 ${nextIssueNumber.value} 张丑照 - ${new Date().toLocaleString('zh-CN')}`
  const issueBody = `拟态名称：[[[请在这里填写拟态]]]

系统会自动识别三个英语半角括号括起来的形状作为拟态名称。

点击评论框下方的 📎 附件图标上传图片，当出现 ![Image](.....png) 这段代码时，就说明上传成功啦。放在这个表格任意地方即可，系统会自动识别这个形状，获取图片。
`

  const labels = ['needs-review']
  const issueUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=${encodeURIComponent(labels.join(','))}`
  window.open(issueUrl, '_blank')
}

async function openGitHubIssueWithRefresh() {
  isLoading.value = true
  await getNextIssueNumber()
  openGitHubIssue()
  isLoading.value = false
}
</script>

<template>
  <div class="flex flex-row gap-[12px]">
    <button 
      class="bg-white border-2 border-black p-4 flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
      @click="generateLongImage"
      :disabled="isGeneratingLongImage"
    >
      <div class="w-10 h-10 bg-primary/10 flex items-center justify-center mr-3">
        <i v-if="isGeneratingLongImage" class="fa fa-spinner fa-spin text-primary"></i>
        <i v-else class="fa fa-image text-primary"></i>
      </div>
      <span class="font-bold text-primary">
        {{ isGeneratingLongImage ? '生成中...' : '生成长图' }}
      </span>
    </button>
    
    <button 
      class="bg-white border-2 border-black p-4 flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
      @click="openGitHubIssueWithRefresh"
      :disabled="isLoading"
    >
      <div class="w-10 h-10 bg-secondary/10 flex items-center justify-center mr-3">
        <i v-if="isLoading" class="fa fa-spinner fa-spin text-secondary"></i>
        <i v-else class="fa fa-plus text-secondary"></i>
      </div>
      <span class="font-bold text-secondary">
        {{ isLoading ? '处理中...' : '分享丑照' }}
      </span>
    </button>
  </div>
</template>
