<script lang="ts" setup>
import type { JeMenuOptionProps } from '../Menu/index'
import { JeMiniMenu } from '../Menu/index'
import type { ToolbarDropdownProps } from './types'

const props = withDefaults(defineProps<ToolbarDropdownProps>(), {
  disabled: false,
})

const selectOption = ref<JeMenuOptionProps | null>(null)
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
  <div class="je-toolbar-dropdown" :class="{ 'je-toolbar-dropdown--disabled': disabled }">
    <div class="je-toolbar-dropdown__label">
      {{ label }}:
    </div>

    <div
      class="je-toolbar-dropdown__inner"
      :tabindex="disabled ? -1 : 0"
      @click="openDropdownMenu"
    >
      <div class="je-toolbar-dropdown__text">
        {{ selectOption?.label }}

        <!-- Ellipsis -->
        <span v-if="selectOption?.ellipsis">
          ...
        </span>
      </div>
      <span class="je-toolbar-dropdown__icon-chevron-down" />

      <!-- Menu -->
      <div class="je-toolbar-dropdown__menu-wrapper" @click.stop>
        <JeMiniMenu
          v-model:visible="isMenuOpen"
          class="je-toolbar-dropdown__menu"
          :options="menuOptions"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-toolbar-dropdown {
  @apply flex items-center gap-5px;
  @apply cursor-default;

  // Default 状态样式
  &:not(&--disabled) {
    .je-toolbar-dropdown__label {
      @apply color-$gray-7;
    }

    .je-toolbar-dropdown__text {
      @apply light:color-$gray-1 dark:color-$gray-12;
    }
  }

  // Hover 状态样式
  &:not(&--disabled):hover .je-toolbar-dropdown__label {
    @apply light:color-$gray-1 dark:color-$gray-13;
  }

  // Active 状态样式
  &:not(&--disabled):active {
    .je-toolbar-dropdown__label {
      @apply light:color-$gray-1 dark:color-$gray-14;
    }

    .je-toolbar-dropdown__text {
      @apply light:color-$gray-1 dark:color-$gray-13;
    }
  }

  // 禁用状态样式
  &--disabled {
    .je-toolbar-dropdown__label,
    .je-toolbar-dropdown__text {
      @apply cursor-default;

      @apply light:color-$gray-8 dark:color-$gray-7;
    }

    .je-toolbar-dropdown__icon-chevron-down {
      @apply cursor-default;
    }
  }
}

.je-toolbar-dropdown__inner {
  @apply relative;
  @apply flex items-center;
}

.je-toolbar-dropdown__text {
  @apply flex cursor-pointer;
}

.je-toolbar-dropdown__icon-chevron-down {
  @apply text-1rem cursor-pointer;

  @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
}

.je-toolbar-dropdown__menu-wrapper {
  @apply w-min;
  @apply absolute top-full left--7px;
}
</style>
