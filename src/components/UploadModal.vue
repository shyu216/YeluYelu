<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUploadStore } from '@/stores/upload'
import { processImage, generateFileName, fileToBase64 } from '@/utils/imageUtils'
import { createPullRequest, setRepoConfig } from '@/services/github'

const emit = defineEmits(['close', 'uploaded'])

const auth = useAuthStore()
const uploadStore = useUploadStore()
const isUploading = ref(false)
const uploadProgress = ref('')
const selectedFile = ref(null)
const previewUrl = ref(null)
const birdName = ref('')
const error = ref('')

const REPO_OWNER = 'shyu216'
const REPO_NAME = 'YeluYelu'
setRepoConfig(REPO_OWNER, REPO_NAME)

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    birdName.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

function handleDrop(event) {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    birdName.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

function handleDragOver(event) {
  event.preventDefault()
}

function removeImage() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = null
  birdName.value = ''
}

async function handleUpload() {
  if (!selectedFile.value || !birdName.value.trim()) {
    error.value = '请选择图片并输入名称'
    return
  }

  if (!auth.isLoggedIn) {
    error.value = '请先登录 GitHub'
    return
  }

  isUploading.value = true
  error.value = ''
  uploadProgress.value = '正在处理图片...'

  try {
    uploadProgress.value = '正在调整图片大小...'
    const processedBlob = await processImage(selectedFile.value, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.9,
      format: 'image/jpeg'
    })

    uploadProgress.value = '正在转换为 Base64...'
    const fileName = generateFileName(birdName.value + '.jpg', 'jpg')
    const base64Content = await fileToBase64(processedBlob)

    uploadProgress.value = '正在保存到本地...'
    const uploadId = Date.now()
    uploadStore.addPendingUpload({
      fileName,
      fileContent: base64Content,
      commitMessage: `feat: 上传 ${birdName.value}`,
      birdName: birdName.value,
      previewUrl: previewUrl.value,
      createdAt: new Date().toISOString()
    })

    uploadProgress.value = '正在创建 Pull Request...'
    
    createPullRequest(auth.token, {
      fileName,
      fileContent: base64Content,
      commitMessage: `feat: 上传 ${birdName.value}`
    }).then(result => {
      if (result.success) {
        uploadStore.updateUploadStatus(uploadId, 'success')
        console.log('PR 创建成功:', result.prUrl)
      } else {
        uploadStore.updateUploadStatus(uploadId, 'failed')
        console.error('PR 创建失败:', result.error)
      }
    })

    uploadProgress.value = ''
    alert('已经上传服务器，等待审批')
    emit('uploaded', { fileName, birdName: birdName.value })
    emit('close')
  } catch (err) {
    error.value = err.message || '上传失败，请重试'
    uploadProgress.value = ''
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white shadow-2xl w-full max-w-lg mx-4">
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-bold text-primary">上传夜鹭拟态图鉴</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="fa fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="p-6">
        <div v-if="!auth.isLoggedIn" class="text-center py-8">
          <i class="fa fa-github text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600 mb-4">请先登录 GitHub 账号</p>
          <button @click="auth.login" class="btn-primary">
            <i class="fa fa-github mr-2"></i>登录 GitHub
          </button>
        </div>

        <div v-else>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">名称（10个字以内）</label>
            <input 
              v-model="birdName"
              type="text" 
              placeholder="输入鸟类名称"
              maxlength="10"
              class="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">图片</label>
            <div 
              v-if="!previewUrl"
              class="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              @click="$refs.fileInput.click()"
              @drop="handleDrop"
              @dragover="handleDragOver"
            >
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                class="hidden"
                @change="handleFileSelect"
              >
              <i class="fa fa-cloud-upload text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500 mb-1">点击或拖拽图片到这里上传</p>
              <p class="text-xs text-gray-400">支持 JPG, PNG 格式</p>
            </div>

            <div v-else class="mt-3">
              <img :src="previewUrl" alt="预览" class="w-full h-48 object-cover border-2 border-black">
              <button 
                type="button" 
                @click="removeImage"
                class="mt-2 text-red-500 text-sm hover:text-red-700"
              >
                <i class="fa fa-trash-o mr-1"></i>移除图片
              </button>
            </div>
          </div>

          <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {{ error }}
          </div>

          <div v-if="uploadProgress" class="mb-4 p-3 bg-blue-50 text-blue-600 rounded">
            <i class="fa fa-spinner fa-spin mr-2"></i>{{ uploadProgress }}
          </div>

          <div class="flex justify-end space-x-3">
            <button @click="$emit('close')" class="btn-outline" :disabled="isUploading">取消</button>
            <button 
              @click="handleUpload" 
              class="btn-primary"
              :disabled="isUploading || !selectedFile || !birdName.trim()"
            >
              <span v-if="isUploading">
                <i class="fa fa-spinner fa-spin mr-2"></i>上传中...
              </span>
              <span v-else>创建 Pull Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
