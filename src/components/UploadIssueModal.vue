<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'uploaded'])

const birdName = ref('')
const photographer = ref('')
const error = ref('')
const isSubmitting = ref(false)

const REPO_OWNER = 'shyu216'
const REPO_NAME = 'YeluYelu'

function handleSubmit() {
  if (!birdName.value.trim()) {
    error.value = '请输入图片名称'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const finalName = birdName.value.trim()
    const finalPhotographer = photographer.value.trim() || 'anonymous'

    const issueTitle = `📸 上传: ${finalName} by ${finalPhotographer}`
    const issueBody = `## 夜鹭拟态图鉴上传

### 拟态名称
${finalName}

### 摄影师/来源
${finalPhotographer}

### 上传时间
${new Date().toLocaleString('zh-CN')}

### 图片说明
请将图片文件上传到此 Issue 的评论中（点击评论框下方的 📎 附件图标）。

---
💡 提示：管理员会定期处理未处理的 Issue。`

    const issueUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`

    window.open(issueUrl, '_blank')

    emit('uploaded', { fileName: finalName, birdName: finalName, photographer: finalPhotographer })
    emit('close')
  } catch (err) {
    error.value = '提交失败: ' + err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white shadow-2xl w-full max-w-lg mx-4">
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-bold text-primary">快速提交图片</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="fa fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="p-6">
        <div class="mb-4 p-3 bg-blue-50 rounded">
          <p class="text-sm text-blue-700">
            <i class="fa fa-info-circle mr-1"></i>
            点击提交后，会在 GitHub 创建一个 Issue。请在 Issue 的评论中上传图片附件。
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">拟态（图片名称）</label>
          <input 
            v-model="birdName"
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

        <div v-if="birdName" class="mb-4 p-3 bg-gray-100 rounded">
          <p class="text-sm text-gray-600">
            文件名将保存为：<span class="font-mono font-bold">{{ birdName }}_by_{{ photographer || 'anonymous' }}.jpg</span>
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
            :disabled="!birdName || isSubmitting"
          >
            <i v-if="isSubmitting" class="fa fa-spinner fa-spin mr-2"></i>
            <i v-else class="fa fa-upload mr-2"></i>
            {{ isSubmitting ? '提交中...' : '提交到 GitHub' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
