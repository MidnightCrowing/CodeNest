<script lang="ts" setup>
import { JeLoader } from '../Loader'
import type { JeMenuOptionGroupProps, JeMenuOptionProps } from '../Menu'
import { JeMiniMenu } from '../Menu'
import { JeMiniTooltip } from '../Popup'
import type { JeDropdownOptionGroupProps, JeDropdownOptionProps, JeDropdownProps } from './types'

const props = withDefaults(defineProps<JeDropdownProps>(), {
  validated: false,
  loading: false,
  disabled: false,
})
const emit = defineEmits(['update:modelValue'])

const selectOption = ref<JeMenuOptionProps | null>(null)
const isMenuOpen = ref(false)

// 辅助函数：处理单个选项
function transformOption(option: JeDropdownOptionProps): JeMenuOptionProps {
  return {
    value: option.value,
    label: option.label,
    labelColor: option.labelColor,
    icon: option.icon,
    description: option.description,
    onClick: () => {
      option.onClick?.() || handleOptionSelect(option)
    },
    ellipsis: option.ellipsis,
    isLine: option.isLine,
  }
}

// 辅助函数：处理分组选项
function transformGroupOption(group: JeDropdownOptionGroupProps): JeMenuOptionGroupProps {
  return {
    value: group.value,
    groupLabel: group.groupLabel,
    options: group.options.map(transformOption),
    isExpand: group.isExpand,
  }
}

// 处理选项选择逻辑
function handleOptionSelect(option: JeDropdownOptionProps) {
  selectOption.value = option
  emit('update:modelValue', option.value)
}

// 菜单选项计算属性
const menuOptions = computed<JeMenuOptionProps[]>(() => {
  if (!props.options || props.options.length === 0)
    return []

  return props.options.map(option =>
    'options' in option
      ? transformGroupOption(option as JeDropdownOptionGroupProps)
      : transformOption(option as JeDropdownOptionProps),
  )
})

// 打开菜单
function openDropdownMenu() {
  if (!props.disabled)
    isMenuOpen.value = true
}

// 根据值查找选项
function findOptionByValue(value: string | null): JeMenuOptionProps | null {
  return menuOptions.value
    .flatMap((option: JeMenuOptionProps | JeMenuOptionGroupProps) => {
      // 如果选项有 `options` 字段，就展开该字段，否则返回当前选项本身
      return 'options' in option ? option.options : [option]
    })
    .find((option: JeMenuOptionProps) => option.value === value) || null
}

watch(() => props.modelValue, (newValue) => {
  selectOption.value = findOptionByValue(newValue)
}, { immediate: true })
</script>

<template>
  <div
    class="je-dropdown"
    :class="{
      'je-dropdown--validated': validated,
      'je-dropdown--disabled': disabled,
    }"
    :tabindex="disabled ? -1 : 0"
    @click="openDropdownMenu"
    @keydown.enter="openDropdownMenu"
  >
    <div class="je-dropdown__inner">
      <div class="je-dropdown__text">
        <!-- Text Icon -->
        <span
          v-if="selectOption?.icon"
          class="je-dropdown__icon"
          :class="selectOption?.icon"
        />

        <!-- Text Label -->
        <span class="je-dropdown__label">
          {{ findOptionByValue(props.modelValue)?.label }}

          <!-- Ellipsis -->
          <span v-if="selectOption?.ellipsis">
            ...
          </span>
        </span>

        <!-- Text Description -->
        <span v-if="selectOption?.description" class="je-dropdown__description">
          {{ selectOption?.description }}
        </span>
      </div>

      <div class="je-dropdown__icon-dropdown">
        <!-- Loader -->
        <JeLoader v-if="loading" />

        <!-- Chevron Down Icon -->
        <span class="je-dropdown__icon-chevron-down" />
      </div>
    </div>

    <!-- Tooltip -->
    <JeMiniTooltip
      v-if="validatedTooltip"
      class="je-dropdown__tooltip"
      state="error"
    >
      {{ validatedTooltip }}
    </JeMiniTooltip>

    <!-- Menu -->
    <div class="je-dropdown__menu-wrapper" @click.stop>
      <JeMiniMenu
        v-model:visible="isMenuOpen"
        class="je-dropdown__menu"
        :options="menuOptions"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-dropdown {
  @apply font-sans text-13px;
  @apply m-2px b-0 px-6px py-5px outline outline-2px rounded-3px;
  @apply min-w-64px;
  @apply relative;
  @apply text-ellipsis whitespace-nowrap;
  @apply cursor-default;

  // Default 状态样式
  &:not(&--disabled) {
    // light
    @apply light:bg-$gray-14;
    @apply light:outline-$gray-9 light:focus:outline-$blue-4;

    // dark
    @apply dark:bg-$gray-2;
    @apply dark:outline-$gray-5 dark:focus:outline-$blue-6;

    .je-dropdown__label {
      @apply light:color-$gray-1 dark:color-$gray-12;
    }
  }

  // Validated 状态样式
  &--validated:not(&--disabled) {
    // light
    @apply light:outline-$red-9 light:focus:outline-$red-4;

    // dark
    @apply dark:outline-$red-2 dark:focus:outline-$red-6;

    .je-dropdown__label {
      @apply light:color-$gray-1 dark:color-$gray-12;
    }

    .je-dropdown__inner:hover + .je-dropdown__tooltip {
      @apply visible;
    }
  }

  // 禁用状态样式
  &--disabled {
    // light
    @apply light:bg-$gray-13 light:outline-$gray-11;

    // dark
    @apply dark:bg-$gray-2 dark:outline-$gray-5;

    .je-dropdown__label {
      @apply light:color-$gray-8 dark:color-$gray-7;
    }
  }
}

.je-dropdown__inner {
  @apply w-full;
  @apply flex items-center justify-between;
}

.je-dropdown__text {
  @apply flex items-center gap-7px;
}

.je-dropdown__icon {
  @apply size-0.7rem;
}

.je-dropdown__label {
  @apply flex text-0.8rem mr-5px;
}

.je-dropdown__description {
  @apply text-0.7rem color-$gray-7;
}

.je-dropdown__icon-dropdown {
  @apply flex items-center gap-5px;
}

.je-dropdown__icon-chevron-down {
  @apply text-1rem;
  @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
}

.je-dropdown__tooltip {
  @apply absolute top-100% left-0 z-2 translate-y-3px;
  @apply invisible;
}

.je-dropdown__menu-wrapper {
  @apply absolute w-full left-0 top-full;
}

.je-dropdown__menu {
  @apply max-h-300px;
}
</style>
