<script lang="ts" setup>
import { JeLoader } from '../Loader'
import { JeMiniMenu } from '../Menu'
import { JeMiniTooltip } from '../Popup'
import type { JeComboboxProps } from './types.ts'

const props = withDefaults(defineProps<JeComboboxProps>(), {
  validated: false,
  disabled: false,
})
const emit = defineEmits(['update:modelValue'])

const isMenuOpen = ref(false)

const menuOptions = computed(() => {
  if (!props.options || props.options.length === 0) {
    return []
  }

  return props.options.map((option) => {
    return {
      value: option.value,
      label: option.label,
      labelColor: option.labelColor,
      icon: option.icon,
      description: option.description,
      onClick: () => {
        if (option.onClick) {
          option.onClick()
        }
        else {
          emit('update:modelValue', option.label)
        }
      },
      ellipsis: option.ellipsis,
      isLine: option.isLine,
    }
  })
})

function openMenu() {
  if (!props.disabled) {
    isMenuOpen.value = true
  }
}
</script>

<template>
  <div
    class="je-combobox"
    :class="{
      'je-combobox--validated': validated,
      'je-combobox--disabled': disabled,
    }"
  >
    <input
      class="je-combobox__input"
      :disabled="disabled"
      :value="modelValue"
      :tabindex="disabled ? -1 : 0"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >

    <JeLoader v-if="loading" class="je-combobox__loading" />

    <span
      class="je-combobox__icon-wrapper"
      :tabindex="disabled ? -1 : 0"
      @click="openMenu"
      @keydown.enter="openMenu"
    >
      <span class="je-combobox__icon-chevron-down" />
    </span>

    <!-- Tooltip -->
    <JeMiniTooltip
      v-if="validatedTooltip"
      class="je-combobox__tooltip"
      state="error"
    >
      {{ validatedTooltip }}
    </JeMiniTooltip>

    <!-- Menu -->
    <JeMiniMenu
      v-model:visible="isMenuOpen"
      class="je-combobox__menu"
      :options="menuOptions"
      @click.stop
    />
  </div>
</template>

<style lang="scss" scoped>
.je-combobox {
  @apply m-2px outline outline-2px rounded-3px;
  @apply flex items-center;
  @apply relative;
  @apply light:outline-$gray-9 dark:outline-$gray-5;

  // 焦点样式
  &:focus-within:not(&--validated, &--disabled, :has(&__icon-wrapper:focus-visible)) {
    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }

  // Validated 状态样式
  &--validated {
    @apply light:outline-$red-9 dark:outline-$red-2;

    &:focus-within:not(:has(.je-combobox__icon-wrapper:focus-visible)) {
      @apply light:outline-$red-4 dark:outline-$red-6;
    }

    &:hover:not(:has(.je-combobox__menu:hover)) .je-combobox__tooltip {
      @apply visible;
    }
  }

  // 禁用状态样式
  &--disabled {
    @apply light:outline-$gray-11 dark:outline-$gray-5;

    .je-combobox__input {
      @apply light:color-$gray-8 light:bg-$gray-13;
      @apply dark:color-$gray-7 dark:bg-$gray-2;
    }
  }
}

.je-combobox__input {
  @apply font-sans text-13px;
  @apply b-0 px-6px py-5px outline-none box-border;
  @apply min-w-64px;
  @apply grow;

  // 默认样式
  @apply light:color-$gray-1 light:bg-$gray-14;
  @apply dark:color-$gray-12 dark:bg-$gray-2;
}

.je-combobox__loading {
  @apply mr-5px;
}

.je-combobox__icon-wrapper {
  @apply b-solid b-2px b-transparent h-full aspect-square;
  @apply outline-none;
  @apply flex items-center justify-center;
  @apply light:b-l-$gray-9 dark:b-l-$gray-5;

  &:focus-visible {
    @apply z-1;
    @apply rounded-3px;

    :not(.je-combobox--disabled, .je-combobox--validated) & {
      @apply light:b-$blue-4 dark:b-$blue-6;
    }

    :not(.je-combobox--disabled).je-combobox--validated & {
      @apply light:b-$red-4 dark:b-$red-6;
    }
  }
}

.je-combobox__icon-chevron-down {
  @apply text-1rem;
  @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
}

.je-combobox__tooltip {
  @apply absolute top-100% z-2 translate-y-3px;
  @apply invisible;
}

.je-combobox__menu {
  @apply w-full max-h-300px left-0 top-full;
}
</style>
