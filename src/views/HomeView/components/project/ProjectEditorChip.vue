<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { CodeEditorEnum } from '~/constants/codeEditor'

import { editorIconClasses, editorLabel } from '../../utils/projectFormatters'

defineProps<{
  editor: CodeEditorEnum
  listCell?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <span
    min-w-0 max-w-full h-23px rounded-4px px-7px
    border-0
    inline-flex items-center gap-5px truncate text-11px
    bg="$ui-hover-background" color="$ui-foreground"
    :class="listCell ? 'editor-cell' : 'editor-chip'"
    :title="editorLabel(editor, t)"
  >
    <span shrink-0 :class="editorIconClasses(editor)" />
    <span min-w-0 truncate>{{ editorLabel(editor, t) }}</span>
  </span>
</template>

<style lang="scss" scoped>
.editor-chip {
  @apply w-fit shrink max-w-180px px-5px py-2px;
}
</style>
