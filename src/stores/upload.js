import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUploadStore = defineStore('upload', () => {
  const pendingUploads = ref([])

  function loadPendingUploads() {
    const stored = localStorage.getItem('pending_uploads')
    if (stored) {
      pendingUploads.value = JSON.parse(stored)
    }
  }

  function savePendingUploads() {
    localStorage.setItem('pending_uploads', JSON.stringify(pendingUploads.value))
  }

  function addPendingUpload(upload) {
    pendingUploads.value.push({
      ...upload,
      id: Date.now(),
      status: 'pending'
    })
    savePendingUploads()
  }

  function updateUploadStatus(id, status) {
    const upload = pendingUploads.value.find(u => u.id === id)
    if (upload) {
      upload.status = status
      savePendingUploads()
    }
  }

  function removePendingUpload(id) {
    pendingUploads.value = pendingUploads.value.filter(u => u.id !== id)
    savePendingUploads()
  }

  function getPendingUploads() {
    return pendingUploads.value.filter(u => u.status === 'pending')
  }

  loadPendingUploads()

  return {
    pendingUploads,
    addPendingUpload,
    updateUploadStatus,
    removePendingUpload,
    getPendingUploads,
    loadPendingUploads
  }
})
