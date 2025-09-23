import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { createPersistence } from '~/stores/helpers/persistence'

const scannerPersistence = createPersistence<{
  historyScannedPaths: string[]
}>({
  key: 'projectScanner',
})

export const useProjectScannerStore = defineStore('projectScanner', () => {
  const historyScannedPaths = ref<Set<string>>(new Set())

  const allHistoryScannedPaths = computed(() => historyScannedPaths.value)

  function addScannedPath(path: string) {
    historyScannedPaths.value.add(path)
  }

  async function loadProjectScannerData() {
    const data = await scannerPersistence.load()
    if (data && Array.isArray(data.historyScannedPaths)) {
      historyScannedPaths.value = new Set(data.historyScannedPaths)
    }
  }

  async function saveProjectScannerData() {
    await scannerPersistence.save({
      historyScannedPaths: Array.from(historyScannedPaths.value).sort(),
    })
  }

  return {
    allHistoryScannedPaths,
    addScannedPath,
    loadProjectScannerData,
    saveProjectScannerData,
  }
})
