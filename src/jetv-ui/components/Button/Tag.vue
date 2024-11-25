<script lang="ts" setup>
import type { TagProps } from './types'

const props = withDefaults(defineProps<TagProps>(), {
  deleteAble: false,
  selectAble: false,
  select: false,
  disabled: false,
})
const emit = defineEmits(['remove', 'select'])

const isSelected = ref(props.select)

function toggleSelect() {
  if (props.selectAble) {
    isSelected.value = !isSelected.value
    emit('select', isSelected.value)
  }
}

function removeTag() {
  emit('remove')
}
</script>

<template>
  <div
    class="je-tag"
    :class="{
      'je-tag--select-able': selectAble,
      'je-tag--selected': isSelected,
    }"
    :tabindex="disabled ? -1 : 0"
    @click="toggleSelect"
  >
    <slot />

    <!-- Close Icon -->
    <span
      v-if="deleteAble"
      class="je-tag__icon-close"
      :tabindex="disabled ? -1 : 0"
      @click.stop="removeTag"
    />
  </div>
</template>

<style lang="scss" scoped>
.je-tag {
  @apply font-sans text-13px;
  @apply flex items-center gap-0.25rem;
  @apply px-6px py-5px;
  @apply outline outline-2px rounded-4px;
  @apply truncate cursor-default;

  @apply light:bg-$gray-12 light:outline-$gray-9;
  @apply dark:bg-$gray-2 dark:outline-$gray-3;

  &--select-able {
    @apply light:bg-$gray-14 light:focus:outline-$blue-7;
    @apply dark:bg-$gray-1 dark:focus:outline-$blue-3;
  }

  &--selected {
    // light
    @apply light:bg-$gray-12;
    @apply light:outline-$gray-7 light:focus:outline-$blue-4;

    // dark
    @apply dark:bg-$gray-3;
    @apply dark:outline-$gray-5 dark:focus:outline-$blue-6;
  }
}

.je-tag__icon-close {
  @apply text-0.9rem;
  @apply cursor-pointer;

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
