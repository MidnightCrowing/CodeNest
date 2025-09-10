import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useProjectScannerStore = defineStore('projectScanner', () => {
  const historyScannedPaths = ref<Set<string>>(new Set())

  const allHistoryScannedPaths = computed(() => historyScannedPaths.value)

  function addScannedPath(path: string) {
    historyScannedPaths.value.add(path)
  }

  async function loadProjectScannerData() {
    const result = await window.api.loadData('projectScanner')
    if (result.success && result.data) {
      try {
        const data = JSON.parse(result.data)
        if (Array.isArray(data.historyScannedPaths)) {
          historyScannedPaths.value = new Set(data.historyScannedPaths)
        }
      }
      catch (error) {
        console.error('Error parsing project scanner data:', error)
      }
    }
  }

  async function saveProjectScannerData() {
    await window.api.saveData('projectScanner', JSON.stringify({
      historyScannedPaths: Array.from(historyScannedPaths.value),
    }))
  }

  return {
    allHistoryScannedPaths,
    addScannedPath,
    loadProjectScannerData,
    saveProjectScannerData,
  }
})
