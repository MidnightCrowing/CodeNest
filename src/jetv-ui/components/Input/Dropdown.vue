<script lang="ts" setup>
import type { JeMenuOption } from '../index'
import { JeLoader, JeMiniMenu } from '../index'
import type { Dropdown, DropdownOption, DropdownOptionGroup } from './types'

const props = withDefaults(defineProps<Dropdown>(), {
  validated: false,
  loading: false,
  disabled: false,
})
const emit = defineEmits(['update:modelValue'])

const selectOption = ref<JeMenuOption | null>(null)
const isMenuOpen = ref(false)

watch(() => props.modelValue, (newValue) => {
  const foundOption = findOptionByValue(newValue)
  selectOption.value = foundOption || null
})

function openDropdownMenu() {
  if (!props.disabled) {
    isMenuOpen.value = true
  }
}

const menuOptions = computed(() => {
  if (!props.options || props.options.length === 0) {
    return []
  }

  return props.options.map((option) => {
    if ('options' in option) {
      // 处理 DropdownOptionGroup
      const group = option as DropdownOptionGroup
      return {
        value: group.value,
        groupLabel: group.groupLabel,
        options: group.options.map(subOption => ({
          value: subOption.value,
          label: subOption.label,
          labelColor: subOption.labelColor,
          icon: subOption.icon,
          description: subOption.description,
          onClick: () => {
            if (subOption.onClick) {
              subOption.onClick()
            }
            else {
              selectOption.value = subOption
              emit('update:modelValue', subOption.value)
            }
          },
          ellipsis: subOption.ellipsis,
          isLine: subOption.isLine,
        })),
      }
    }
    else {
      // 处理 DropdownOption
      const singleOption = option as DropdownOption
      return {
        value: singleOption.value,
        label: singleOption.label,
        labelColor: singleOption.labelColor,
        icon: singleOption.icon,
        description: singleOption.description,
        onClick: () => {
          if (singleOption.onClick) {
            singleOption.onClick()
          }
          else {
            selectOption.value = singleOption
            emit('update:modelValue', singleOption.value)
          }
        },
        ellipsis: singleOption.ellipsis,
        isLine: singleOption.isLine,
      }
    }
  })
})

// 根据传入的选项值查找对应的选项
function findOptionByValue(value: string) {
  return menuOptions.value.flatMap(optionGroup =>
    optionGroup.options ? optionGroup.options : [optionGroup],
  ).find(option => option.value === value) || null
}
</script>

<template>
  <div
    class="je-dropdown"
    :class="{ validated, disabled }"
    :tabindex="disabled ? -1 : 0"
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

      <div class="dropdown-icon">
        <!-- Loader -->
        <JeLoader v-if="loading" />

        <!-- Chevron Down Icon -->
        <span class="chevron-down-icon" />
      </div>
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

    .dropdown-icon {
      @apply flex items-center gap-5px;

      .chevron-down-icon {
        @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
        @apply light:size-1rem dark:size-1rem;
      }
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
