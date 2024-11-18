<script lang="ts" setup>
import { JeGroupHeader } from './index'
import type { Group } from './type'

const props = withDefaults(defineProps<Group>(), {
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
    <div class="group-header" :class="{ expandable }" @click="toggleExpand">
      <!-- 下拉图标 -->
      <span
        v-if="expandable"
        class="chevron-down-icon"
        :class="{ expand: isGroupExpand }"
      />
      <!-- 自定义组头 -->
      <JeGroupHeader class="group-header" :type="labelType">
        {{ props.label }}
      </JeGroupHeader>
    </div>

    <!-- 组内容 -->
    <div v-if="isGroupExpand" class="group-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-group .group-header {
  @apply flex items-center;

  &.expandable {
    @apply cursor-pointer;
  }

  .chevron-down-icon {
    @apply text-17px;
    @apply transition-transform ease-in-out duration-200 rotate--90;

    // 设置默认图标样式
    @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;

    &.expand {
      @apply rotate-0;
    }
  }

  .group-header {
    @apply grow;
    // 使标题占满剩余空间
  }
}
</style>
