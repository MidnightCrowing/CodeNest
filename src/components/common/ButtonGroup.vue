<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'

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
    <ButtonBase
      v-for="(button, index) in buttons"
      :key="index"
      :class="{ active: modelValue === button.index }"
      bg="transparent hover:$hover-0"
      z-0
      @click="handleClick(button.index)"
    >
      {{ button.label }}
    </ButtonBase>
  </div>
</template>

<style scoped lang="scss">
button.active {
  --uno: "bg-$active-2";
  --uno: "outline outline-2px outline-$white-3";
}
</style>
