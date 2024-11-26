<script lang="ts" setup>
import JeLoader from '../Loader/Loader.vue'
import JeMiniMenu from '../Menu/MiniMenu.vue'
import type { ComboboxProps } from './types'

const props = withDefaults(defineProps<ComboboxProps>(), {
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

    <!-- Menu -->
    <div class="je-combobox__menu-wrapper" @click.stop>
      <JeMiniMenu
        v-model:visible="isMenuOpen"
        class="je-combobox__menu"
        :options="menuOptions"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-combobox {
  @apply m-2px outline outline-2px rounded-3px;
  @apply flex items-center;
  @apply relative;
  @apply light:outline-$gray-9 dark:outline-$gray-5;

  // 焦点样式
  &:focus-within:not(:has(.je-combobox__icon-wrapper:focus-visible)):not(
      .je-combobox--validated,
      .je-combobox--disabled
    ) {
    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }

  // Validated 状态样式
  &--validated {
    @apply light:outline-$red-9 light:focus-within:outline-$red-4;
    @apply dark:outline-$red-2 dark:focus-within:outline-$red-6;
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

.je-combobox__menu-wrapper {
  @apply absolute w-full left-0 top-full;
}

.je-combobox__menu {
  @apply max-h-300px;
}
</style>
