<script lang="ts" setup>
import { showNoIdePathDialog } from '~/components/NoIdePathDialog/NoIdePathDialogProvider'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { settings } from '~/core/settings'

defineProps<{
  defaultOpen: CodeEditorEnum
  projectPath: string
}>()

function handleClick(codeEditor: CodeEditorEnum, projectPath: string) {
  const idePath = settings.getSetting('codeEditorsPath')[codeEditor]

  if (!idePath)
    showNoIdePathDialog()
  else
    window.api.openProject(idePath, projectPath)
}
</script>

<template>
  <button
    font-sans text="13px" lh="26px" whitespace-nowrap
    p="x-14px y-3px" b-0 rounded="4px"
    light:bg="$blue-4 hover:$blue-3 active:$blue-2"
    dark:bg="$blue-6 hover:$blue-5 active:$blue-4"
    @click="handleClick(defaultOpen, projectPath)"
    @mousedown.stop @mouseup.stop
  >
    <span
      flex="~ items-center" gap="5px"
      color="$gray-12"
    >
      <!-- 使用 text-color 动态适配 -->
      <span :class="codeEditors[defaultOpen].icon" />
      <span>{{ codeEditors[defaultOpen].label }}</span>
    </span>
  </button>
</template>
