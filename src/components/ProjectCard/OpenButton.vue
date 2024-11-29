<script lang="ts" setup>
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { settings } from '~/core/settings'

defineProps<{
  defaultOpen: CodeEditorEnum
  projectPath: string
}>()

function handleClick(codeEditor: CodeEditorEnum, projectPath: string) {
  const idePath = settings.getSetting('codeEditorsPath')[codeEditor]
  window.api.openProject(idePath, projectPath)
}
</script>

<template>
  <button
    font-sans text-13px lh-25px
    p="x-14px y-3px" b-0 rounded="4px"
    light:bg="$blue-4 hover:$blue-3 active:$blue-2"
    dark:bg="$blue-6 hover:$blue-5 active:$blue-4"
    color="$gray-12"
    flex="~ items-center gap-5px"
    @click="handleClick(defaultOpen, projectPath)"
    @mousedown.stop @mouseup.stop
  >
    <!-- 使用 text-color 动态适配 -->
    <span :class="codeEditors[defaultOpen].icon" />
    <span>{{ codeEditors[defaultOpen].label }}</span>
  </button>
</template>
