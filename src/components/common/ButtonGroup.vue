<script setup lang="ts">
defineProps<{
  modelValue: string
  buttons: { label: string, index: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', index: string): void
}>()

function handleClick(index: string) {
  emit('update:modelValue', index)
}
</script>

<template>
  <div
    inline-flex
    rounded="4px"
    outline="~ 2px $border-1"
    w-fit
  >
    <button
      v-for="(button, index) in buttons"
      :key="index"
      :class="{ active: modelValue === button.index }"
      button-base
      bg="transparent hover:$hover-0" text="$text-color-2"
      rounded-4px
      z-0
      @click="handleClick(button.index)"
    >
      {{ button.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
button.active {
  --uno: "bg-$active-2";
  --uno: "outline outline-2px outline-$white-3";
}
</style>
