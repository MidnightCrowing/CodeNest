<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, ref, watchEffect } from 'vue'

import { TABS_INJECT_KEY } from './key'
import type { JeTabPaneProps } from './types'

const props = withDefaults(defineProps<JeTabPaneProps>(), {
  disabled: false,
  closable: undefined,
  lazy: false,
})

// 从 Tabs 注入注册方法
const tabsApi = inject<any>(TABS_INJECT_KEY, null)

// 注册 / 更新
if (tabsApi) {
  watchEffect(() => {
    tabsApi.registerPane({
      value: props.value,
      label: props.label,
      disabled: props.disabled,
      closable: props.closable,
      icon: props.icon,
      lazy: props.lazy,
    })
  })
  onBeforeUnmount(() => tabsApi.unregisterPane(props.value))
}

// 激活与懒加载逻辑
const loaded = ref(false)
const isActive = computed(() => tabsApi?.activeValue.value === props.value)
watchEffect(() => {
  if (isActive.value)
    loaded.value = true
})
</script>

<template>
  <div v-show="isActive" class="je-tab-pane">
    <slot v-if="!props.lazy || loaded" />
  </div>
</template>

<style lang="scss" scoped>
.je-tab-pane {
  @apply w-full;
}
</style>
