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
    w-fit inline-flex
    rounded="4px"
    outline="~ 2px theme-buttonGroup-border"
  >
    <ButtonBase
      v-for="(button, index) in buttons"
      :key="index"
      :bg="modelValue === button.index ? 'theme-buttonGroup-bgActive' : 'transparent hover:theme-buttonGroup-bgHover'"
      :outline="modelValue === button.index ? '2px solid theme-buttonGroup-borderActive' : 'none'"
      z-0
      @click="handleClick(button.index)"
    >
      {{ button.label }}
    </ButtonBase>
  </div>
</template>
