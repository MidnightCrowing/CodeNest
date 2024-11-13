<script lang="ts" setup>
import type { JeMenuOption } from '../index'
import { JeMiniMenu } from '../index'
import type { Dropdown } from './type'

const props = withDefaults(defineProps<Dropdown>(), {
  validated: false,
  disabled: false,
})

const selectOption = ref<JeMenuOption | null>(null)
const isMenuOpen = ref(false)

function openDropdownMenu() {
  if (!props.disabled) {
    isMenuOpen.value = true
  }
}

// 将 DropdownOption 转换为 MenuOption
const menuOptions = computed(() => {
  // 检查 options 是否为有效数组
  if (!props.options || props.options.length === 0) {
    return []
  }

  return props.options.map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    description: option.description,
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
  <div
    class="je-dropdown"
    :class="{ validated, disabled }"
    tabindex="0"
    @click="openDropdownMenu"
  >
    <div class="dropdown-container">
      <div class="dropdown-text">
        <!-- Text Icon -->
        <span
          v-if="selectOption?.icon"
          class="dropdown-icon"
          :class="selectOption?.icon"
        />

        <!-- Text Label -->
        <span class="dropdown-label">
          {{ selectOption?.label }}

          <!-- Ellipsis -->
          <span v-if="selectOption?.ellipsis">
            ...
          </span>
        </span>

        <!-- Text Description -->
        <span v-if="selectOption?.description" class="dropdown-description">
          {{ selectOption?.description }}
        </span>
      </div>

      <!-- Chevron Down Icon -->
      <span class="chevron-down-icon" />
    </div>

    <!-- Menu -->
    <div class="dropdown-menu-wrapper" @click.stop>
      <JeMiniMenu
        v-model:visible="isMenuOpen"
        class="dropdown-menu"
        :options="menuOptions"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-dropdown {
  @apply font-sans text-13px;
  @apply m-2px b-0 px-6px py-5px rounded-3px;
  @apply min-w-64px;
  @apply outline outline-2px;
  @apply relative;
  @apply text-ellipsis whitespace-nowrap;
  @apply cursor-default;

  .dropdown-container {
    @apply w-full;
    @apply flex items-center justify-between;

    .dropdown-text {
      @apply flex items-center gap-7px;

      .dropdown-icon {
        @apply size-0.7rem;
      }

      .dropdown-label {
        @apply flex text-0.8rem mr-5px;
      }

      .dropdown-description {
        @apply text-0.7rem color-$gray-7;
      }
    }

    .chevron-down-icon {
      @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
      @apply light:size-1rem dark:size-1rem;
    }
  }

  .dropdown-menu-wrapper {
    @apply absolute w-full left-0 top-full;
  }

  // Default 状态样式
  &:not(.disabled) {
    // light
    @apply light:bg-$gray-14;
    @apply light:outline-$gray-9 light:focus:outline-$blue-4;

    // dark
    @apply dark:bg-$gray-2;
    @apply dark:outline-$gray-5 dark:focus:outline-$blue-6;

    .dropdown-label {
      @apply light:color-$gray-1 dark:color-$gray-12;
    }
  }

  // Validated 状态样式
  &.validated:not(.disabled) {
    // light
    @apply light:outline-$red-9 light:focus:outline-$red-4;

    // dark
    @apply dark:outline-$red-2 dark:focus:outline-$red-6;

    .dropdown-label {
      @apply light:color-$gray-1 dark:color-$gray-12;
    }
  }

  // 禁用状态样式
  &.disabled {
    // light
    @apply light:bg-$gray-13 light:outline-$gray-11;

    // dark
    @apply dark:bg-$gray-2 dark:outline-$gray-5;

    .dropdown-label {
      @apply light:color-$gray-8 dark:color-$gray-7;
    }
  }
}
</style>
