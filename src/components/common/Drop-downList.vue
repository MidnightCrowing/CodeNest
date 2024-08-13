<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue'

interface Option {
  value: string | number
  text: string
  icon?: string
  note?: string
}

const props = defineProps<{
  options: Option[]
  modelValue: string | number
}>()

const emits = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

function handleChange() {
  emits('update:modelValue', internalValue.value)
}
</script>

<template>
  <div class="select-wrapper">
    <select v-model="internalValue" @change="handleChange">
      <option v-for="option in options" :key="option.value" :value="option.value">
        <!--        <span v-if="option.icon" :class="option.icon" /> -->
        <!--        {{ option.text }} -->
        <!--        <span v-if="option.note">({{ option.note }})</span> -->
      </option>
    </select>
  </div>
</template>

<style scoped>
.select-wrapper select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
}

.select-wrapper option {
  padding: 4px;
}
</style>
