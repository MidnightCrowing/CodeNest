<script lang="ts" setup>
import { JeColorIcon } from '@jetv/ui'

defineProps<{
  active: boolean
  colorValue?: string
  tagValue?: number
}>()
</script>

<template>
  <div
    class="side-menu-button-base"
    :class="{ active, 'opacity-50': !tagValue }"
    :tabindex="tagValue ? 0 : -1"
    w="150px" h="20px" m="x-5px" b="solid 2px transparent" p="l-10px r-20px y-6px"
    rounded="4px"
    focus-visible:b="light:$blue-9 dark:$blue-4" focus-visible:outline-none
    flex="~ items-center justify-between" gap="8px"
    overflow-hidden cursor-default
  >
    <div flex="~ items-center" gap="10px" overflow-hidden>
      <!-- Color Icon -->
      <JeColorIcon v-if="colorValue" type="vertical-bar" :custom-color="colorValue" />
      <span v-else w="5px" />

      <div truncate>
        <slot />
      </div>
    </div>

    <!-- Tag -->
    <span
      v-if="tagValue"
      class="side-menu-tag"
      text="medium"
      bg="light:$gray-11 dark:$gray-5"
      h="17px" p="x-8px" rounded-full
      flex="~ items-center"
    >
      {{ tagValue }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.side-menu-button-base.active {
  @apply light:bg-$blue-11 dark:bg-$blue-2;

  .side-menu-tag {
    @apply light:bg-$blue-9 dark:bg-$blue-5;
  }
}
</style>
