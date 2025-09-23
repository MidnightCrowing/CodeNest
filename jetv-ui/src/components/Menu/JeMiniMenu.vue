<script lang="ts" setup>
import JeMenu from './JeMenu.vue'
import type { JeMenuProps } from './types.ts'

// 接收传入的参数
const props = defineProps<JeMenuProps>()
const emit = defineEmits(['update:visible'])

// 代理 v-model：读 props.visible，写时向上 emit
const visibleProxy = computed<boolean>({
  get: () => props.visible,
  set: v => emit('update:visible', v),
})
</script>

<template>
  <JeMenu
    v-model:visible="visibleProxy"
    class="je-menu--mini"
    :title="title"
    :options="options"
    :is-child-menu="isChildMenu"
  />
</template>

<style lang="scss" scoped>
.je-menu--mini :deep(.je-menu__ul),
.je-menu--mini :deep(.je-menu__ul) .je-menu.je-menu__child .je-menu__ul {
  @apply px-2px py-5px rounded-0 min-w-100px;

  .je-menu__option-item .je-menu__child-menu-wrapper {
    @apply top--6px;
  }
}
</style>
