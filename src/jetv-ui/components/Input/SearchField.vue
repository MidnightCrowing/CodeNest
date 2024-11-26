<script lang="ts" setup>
import JeInputField from './InputField.vue'
import type { SearchFieldProps } from './types'

const props = withDefaults(defineProps<SearchFieldProps>(), {
  type: 'default',
  validated: false,
  disabled: false,
})
const emit = defineEmits(['update:modelValue', 'update:validated'])

const searchContent = ref(props.modelValue)

// 监听 searchContent 的变化，将值传递回父组件
watch(searchContent, (newValue) => {
  emit('update:modelValue', newValue)
})

function clearInput() {
  searchContent.value = ''
}
</script>

<template>
  <span class="je-search-filed">
    <!-- Search Icon -->
    <span class="je-search-filed__icon-search" />

    <!-- Input -->
    <JeInputField
      v-model="searchContent"
      :validated="validated"
      :disabled="disabled"
      class="je-search-filed__input"
      :class="`je-search-filed__input--${type}`"
    />

    <!-- Clear Icon -->
    <span
      v-if="searchContent"
      class="je-search-filed__icon-clear"
      :tabindex="disabled ? -1 : 0"
      @click="clearInput"
      @keydown.enter="clearInput"
    />
  </span>
</template>

<style lang="scss" scoped>
.je-search-filed {
  @apply relative;
}

.je-search-filed__input {
  @apply w-full box-border pl-25px pr-23px;

  // In Editor 类型样式
  &--in-editor {
    @apply outline-0;
  }
}

.je-search-filed__icon-search {
  @apply absolute left-7px top-50% translate-y--50%;
  @apply rounded-3px;
  @apply flex items-center justify-center;
  @apply text-17px;

  @apply light:i-jet:search dark:i-jet:search-dark;
}

.je-search-filed__icon-clear {
  @apply absolute top-0 bottom-0 right-0;
  @apply mx-3px my-auto;
  @apply cursor-pointer;
  @apply text-15px;

  // light
  @apply light:i-jet:close-small light:hover:i-jet:close-small-hovered;

  // dark
  @apply dark:i-jet:close-small-dark dark:hover:i-jet:close-small-hovered-dark;

  &:focus-visible {
    @apply rounded-2px;
    @apply outline outline-2px;

    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }
}
</style>
