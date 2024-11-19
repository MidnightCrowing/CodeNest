<script lang="ts" setup>
import type { JeMenuOption } from '../index'
import { JeMiniMenu } from '../index'
import type { ToolbarDropdown } from './types'

const props = withDefaults(defineProps<ToolbarDropdown>(), {
  disabled: false,
})

const selectOption = ref<JeMenuOption | null>(null)
const isMenuOpen = ref(false)

// 初始化时选择默认值
if (props.options && props.options.length > 0) {
  const defaultOption = props.options.find(option => option.value === props.defaultSelectedValue)
  selectOption.value = defaultOption || null
}

// 监听 defaultSelectedValue 的变化
watch(() => props.defaultSelectedValue, (newValue) => {
  const defaultOption = props.options.find(option => option.value === newValue)
  selectOption.value = defaultOption || null
})

function openDropdownMenu() {
  if (!props.disabled) {
    isMenuOpen.value = true
  }
}

// 将 ToolbarDropdown 转换为 MenuOption
const menuOptions = computed(() => {
  // 检查 options 是否为有效数组
  if (!props.options || props.options.length === 0) {
    return []
  }

  return props.options.map(option => ({
    value: option.value,
    label: option.label,
    // 检查 onClick 是否存在，存在则调用，否者使用默认行为
    onClick: () => {
      // 如果 option 定义了 onClick，则执行它
      if (option.onClick) {
        option.onClick()
      }
      else {
        // 否则执行选择行为
        selectOption.value = option
      }
    },
    ellipsis: option.ellipsis,
    isLine: option.isLine,
  }))
})
</script>

<template>
  <div class="je-dropdown toolbar" :class="{ disabled }">
    <div class="dropdown_label">
      {{ label }}:
    </div>

    <div
      class="dropdown-content"
      :tabindex="disabled ? -1 : 0"
      @click="openDropdownMenu"
    >
      <div class="dropdown-text">
        {{ selectOption?.label }}

        <!-- Ellipsis -->
        <span v-if="selectOption?.ellipsis">
          ...
        </span>
      </div>
      <span class="chevron-down-icon" />

      <!-- Menu -->
      <div class="dropdown-menu-wrapper" @click.stop>
        <JeMiniMenu
          v-model:visible="isMenuOpen"
          class="dropdown-menu"
          :options="menuOptions"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-dropdown.toolbar {
  @apply flex items-center gap-5px;
  @apply cursor-default;

  .dropdown-content {
    @apply relative;
    @apply flex items-center;
  }

  .dropdown-text {
    @apply flex cursor-pointer;
  }

  .chevron-down-icon {
    @apply cursor-pointer;

    @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
    @apply light:size-1rem dark:size-1rem;
  }

  .dropdown-menu-wrapper {
    @apply w-min;
    @apply absolute top-full left--7px;
  }

  // Default 状态样式
  &:not(.disabled) {
    .dropdown_label {
      @apply color-$gray-7;
    }

    .dropdown-text {
      @apply light:color-$gray-1 dark:color-$gray-12;
    }
  }

  // Hover 状态样式
  &:not(.disabled):hover .dropdown_label {
    @apply light:color-$gray-1 dark:color-$gray-13;
  }

  // Active 状态样式
  &:not(.disabled):active {
    .dropdown-label {
      @apply light:color-$gray-1 dark:color-$gray-14;
    }

    .dropdown-text {
      @apply light:color-$gray-1 dark:color-$gray-13;
    }
  }

  // 禁用状态样式
  &.disabled {
    .dropdown-label,
    .dropdown-text {
      @apply cursor-default;

      @apply light:color-$gray-8 dark:color-$gray-7;
    }

    .chevron-down-icon {
      @apply cursor-default;
    }
  }
}
</style>
