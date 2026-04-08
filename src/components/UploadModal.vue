<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'uploaded'])

const selectedFile = ref(null)
const previewUrl = ref(null)
const birdName = ref('')
const photographer = ref('')
const mimicry = ref('')
const error = ref('')

const REPO_OWNER = 'shyu216'
const REPO_NAME = 'YeluYelu'

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    birdName.value = file.name.replace(/\.[^/.]+$/, '')
    mimicry.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

function handleDrop(event) {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    birdName.value = file.name.replace(/\.[^/.]+$/, '')
    mimicry.value = file.name.replace(/\.[^/.]+$/, '')
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
  photographer.value = ''
  mimicry.value = ''
}

function handleSubmit() {
  if (!selectedFile.value || !birdName.value.trim()) {
    error.value = '请选择图片并输入名称'
    return
  }

  const finalName = mimicry.value.trim() || birdName.value.trim()
  const finalPhotographer = photographer.value.trim() || 'anonymous'

  const issueTitle = `📸 上传: ${finalName} by ${finalPhotographer}`
  const issueBody = `## 夜鹭拟态图鉴上传

### 拟态名称
${finalName}

### 摄影师/来源
${finalPhotographer}

### 上传说明
请在此评论中上传您的图片，或者直接拖拽图片到下方。

---
💡 提示：上传后管理员会进行审核，审核通过后图片将出现在图鉴中。`

  const issueUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`

  window.open(issueUrl, '_blank')

  emit('uploaded', { fileName: finalName, birdName: finalName, photographer: finalPhotographer })
  emit('close')
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
        <div class="mb-4 p-3 bg-blue-50 rounded">
          <p class="text-sm text-blue-700">
            <i class="fa fa-info-circle mr-1"></i>
            无需注册！点击提交后将在 GitHub 打开上传页面，按提示操作即可。
          </p>
        </div>

        <div class="mb-4">
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
            <p class="text-gray-500 mb-1">点击或拖拽图片到这里</p>
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

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">拟态（图片名称）</label>
          <input 
            v-model="mimicry"
            type="text" 
            placeholder="例如：哥斯拉"
            class="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">摄影师/来源（选填）</label>
          <input 
            v-model="photographer"
            type="text" 
            placeholder="拍摄者名字"
            class="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
        </div>

        <div v-if="mimicry" class="mb-4 p-3 bg-gray-100 rounded">
          <p class="text-sm text-gray-600">
            文件名将保存为：<span class="font-mono font-bold">{{ mimicry }}_by_{{ photographer || 'anonymous' }}.jpg</span>
          </p>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {{ error }}
        </div>

        <div class="flex justify-end space-x-3">
          <button @click="$emit('close')" class="btn-outline">取消</button>
          <button 
            @click="handleSubmit" 
            class="btn-primary"
            :disabled="!selectedFile || !mimicry"
          >
            <i class="fa fa-github mr-2"></i>提交到 GitHub
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
