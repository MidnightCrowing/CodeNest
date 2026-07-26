<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiActionMenu from '~/components/ui/UiActionMenu.vue'
import type { CodeEditorEnum } from '~/constants/codeEditor'

import { PROJECT_OPEN_WITH_MENU_ID } from '../../composables/useProjectMenus'
import { editorIconClasses, editorLabel } from '../../utils/projectFormatters'

const props = withDefaults(defineProps<{
  editor: CodeEditorEnum
  menuItems: UiActionMenuItem[]
  variant?: 'card' | 'list'
}>(), {
  variant: 'card',
})

const emit = defineEmits<{
  select: [action: string]
}>()

const { t } = useI18n()

const openWithMenu = computed(() => props.menuItems.find(item => item.id === PROJECT_OPEN_WITH_MENU_ID))
const openWithMenuItems = computed(() => openWithMenu.value?.children ?? [])
const openWithMenuDisabled = computed(() => openWithMenu.value?.disabled || openWithMenuItems.value.length === 0)
const openWithMenuWidth = computed(() => openWithMenu.value?.submenuWidth ?? 220)
const openWithMenuLabel = computed(() => openWithMenu.value?.label ?? t('app.home.actions.open_with'))
</script>

<template>
  <UiActionMenu
    :items="openWithMenuItems"
    :width="openWithMenuWidth"
    :aria-label="openWithMenuLabel"
    align="start"
    @select="action => emit('select', action)"
  >
    <button
      min-w-0 h-23px border-0 bg-transparent
      inline-flex items-center gap-5px truncate text-11px
      color="$ui-foreground"
      cursor-pointer underline decoration-transparent underline-offset-2
      hover:decoration-current
      disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:decoration-transparent
      type="button"
      :class="variant === 'list'
        ? 'max-w-full px-5px'
        : 'max-w-180px w-fit p-0 justify-self-start'"
      :title="editorLabel(editor, t)"
      :disabled="openWithMenuDisabled"
      @click.stop
      @keydown.stop
    >
      <span shrink-0 :class="editorIconClasses(editor)" />
      {{ editorLabel(editor, t) }}
    </button>
  </UiActionMenu>
</template>
