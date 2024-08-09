<script setup lang="ts">
defineProps<{
  modelValue: string
  buttons: { label: string, key: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', key: string): void
}>()

function handleClick(key: string) {
  emit('update:modelValue', key)
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
      v-for="(button, key) in buttons"
      :key="key"
      :class="{ active: modelValue === button.key }"
      button-base
      bg="transparent hover:$hover-0" text="$text-color-2"
      rounded-4px
      z-0
      @click="handleClick(button.key)"
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
