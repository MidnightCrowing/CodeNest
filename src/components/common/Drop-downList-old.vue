<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Option {
  value: any
  text: string
  icon?: string
  note?: string
}

const props = defineProps<{
  options: Option[]
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectBox = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(option => option.value === props.modelValue),
)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectOption(option: Option) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectBox.value && !selectBox.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="selectBox" class="custom-select">
    <div class="select-box" @click="toggleDropdown">
      <span>{{ selectedOption ? selectedOption.text : '请选择' }}</span>
      <span class="arrow">▼</span>
    </div>
    <ul v-if="isOpen" class="dropdown">
      <li
        v-for="option in options"
        :key="option.value"
        class="dropdown-item"
        @click="selectOption(option)"
      >
        <span v-if="option.icon" class="icon" :class="[option.icon]" />
        <span>{{ option.text }}</span>
        <span v-if="option.note" class="note">({{ option.note }})</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.custom-select {
  position: relative;
  width: 200px;
}

.select-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: solid 1px #ccc;
  border-radius: 4px;
  background-color: white;
  z-index: 10;
}

.dropdown-item {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.icon {
  margin-right: 8px;
}

.note {
  margin-left: auto;
  font-size: 0.9em;
  color: #666;
}

.arrow {
  margin-left: 8px;
}
</style>
