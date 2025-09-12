<script lang="ts" setup>
import { JeButton } from 'jetv-ui'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { showNoIdePathDialog } from '~/components/NoIdePathDialog/NoIdePathDialogProvider'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'

defineProps<{
  defaultOpen: CodeEditorEnum
  projectPath: string
}>()

const { t } = useI18n()

const settings = useSettingsStore()
const isOpening = ref(false)

function handleClick(codeEditor: CodeEditorEnum, projectPath: string) {
  if (isOpening.value)
    return // 防止多次点击

  const idePath = settings.codeEditorsPath[codeEditor]

  if (!idePath) {
    showNoIdePathDialog()
    return
  }

  isOpening.value = true
  window.api.openProject(idePath, projectPath)

  // 模拟反馈
  setTimeout(() => {
    isOpening.value = false
  }, 2000)
}
</script>

<template>
  <div v-if="isOpening" text="default">
    {{ t('project.opening') }}
  </div>
  <JeButton
    v-else
    class="group-hover/item:block"
    type="primary"
    hidden
    :disabled="isOpening"
    @click="handleClick(defaultOpen, projectPath)"
    @mousedown.stop @mouseup.stop
  >
    <span flex="~ items-center" gap="5px" color="$gray-12">
      <span :class="codeEditors[defaultOpen].icon" />
      <span>{{ codeEditors[defaultOpen].label }}</span>
    </span>
  </JeButton>
</template>
