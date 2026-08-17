import { defineStore } from 'pinia'

import type { UpdateCheckResult, UpdateDownloadEvent } from '~/desktop/types'

export type AppUpdateStatus = 'idle' | 'checking' | 'latest' | 'available' | 'downloading' | 'installing' | 'error'

export const useAppUpdateStore = defineStore('appUpdate', () => {
  const status = ref<AppUpdateStatus>('idle')
  const updateInfo = ref<UpdateCheckResult | null>(null)
  const error = ref('')
  const downloadedBytes = ref(0)
  const contentLength = ref<number | null>(null)
  let checkPromise: Promise<UpdateCheckResult | null> | null = null

  const checking = computed(() => status.value === 'checking')
  const installing = computed(() => status.value === 'downloading' || status.value === 'installing')
  const downloadProgress = computed(() => {
    if (!contentLength.value)
      return null
    return Math.min(100, Math.round(downloadedBytes.value / contentLength.value * 100))
  })

  function applyDownloadEvent(event: UpdateDownloadEvent) {
    if (event.event === 'Started') {
      downloadedBytes.value = 0
      contentLength.value = event.data.contentLength ?? null
      status.value = 'downloading'
      return
    }

    if (event.event === 'Progress') {
      downloadedBytes.value += event.data.chunkLength
      return
    }

    status.value = 'installing'
  }

  async function checkUpdate() {
    if (checkPromise)
      return checkPromise

    checkPromise = (async () => {
      status.value = 'checking'
      error.value = ''
      try {
        const result = await window.api.checkUpdate()
        updateInfo.value = result
        status.value = result.hasUpdate ? 'available' : 'latest'
        return result
      }
      catch (cause) {
        error.value = String(cause)
        status.value = 'error'
        console.error('Update check failed:', cause)
        return null
      }
      finally {
        checkPromise = null
      }
    })()

    return checkPromise
  }

  async function installUpdate() {
    if (!updateInfo.value?.hasUpdate || installing.value)
      return false

    downloadedBytes.value = 0
    contentLength.value = null
    error.value = ''
    status.value = 'downloading'

    try {
      await window.api.installUpdate(applyDownloadEvent)
      return true
    }
    catch (cause) {
      error.value = String(cause)
      status.value = 'error'
      console.error('Update installation failed:', cause)
      return false
    }
  }

  return {
    status,
    updateInfo,
    error,
    checking,
    installing,
    downloadedBytes,
    contentLength,
    downloadProgress,
    checkUpdate,
    installUpdate,
  }
})
