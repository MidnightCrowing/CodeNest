<script lang="ts" setup>
import JeGroupHeader from './GroupHeader.vue'
import type { JeGroupProps } from './types.ts'

const props = withDefaults(defineProps<JeGroupProps>(), {
  labelType: 'primary',
  expandable: true,
  isExpand: true,
})

const isGroupExpand = ref(props.isExpand)

function toggleExpand() {
  if (props.expandable) {
    isGroupExpand.value = !isGroupExpand.value
  }
}
</script>

<template>
  <div class="je-group">
    <!-- 组标题 -->
    <div
      class="je-group__header"
      :class="{ 'je-group__header--expandable': expandable }"
      @click="toggleExpand"
    >
      <!-- 下拉图标 -->
      <span
        v-if="expandable"
        class="je-group__icon-chevron-down"
        :class="{ 'je-group__icon-chevron-down--expand': isGroupExpand }"
      />
      <!-- 自定义组头 -->
      <JeGroupHeader class="je-group__header" :type="labelType">
        {{ props.label }}
      </JeGroupHeader>
    </div>

    <!-- 组内容 -->
    <div v-if="isGroupExpand" class="je-group__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-group__header {
  @apply grow flex items-center;

  &--expandable {
    @apply cursor-pointer;
  }
}

.je-group__icon-chevron-down {
  @apply text-17px;
  @apply transition-transform ease-in-out duration-200 rotate--90;

  // 设置默认图标样式
  @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;

  &--expand {
    @apply rotate-0;
  }
}
</style>
