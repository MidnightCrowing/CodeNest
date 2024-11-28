<script lang="ts" setup>
import type { CodeEditorEnum } from '~/constants/codeEditor'

defineProps<{
  defaultOpen: CodeEditorEnum
}>()
</script>

<template>
  <button
    font-sans text-13px lh-25px
    p="x-14px y-3px" b-0 rounded="4px"
    light:bg="$blue-4 hover:$blue-3 active:$blue-2"
    dark:bg="$blue-6 hover:$blue-5 active:$blue-4"
    color="$gray-12"
    flex="~ items-center gap-5px"
    @mousedown.stop @mouseup.stop
  >
    <!-- 使用 text-color 动态适配 -->
    <span class="i-custom:visual-studio-code" />
    <span>Intellij IDEA</span>
  </button>
</template>
