<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])
const modelValue = ref('')

interface Option {
  value: any
  text: string
  icon?: string
  note?: string
}

const options = [
  { value: 'option1', text: '选项 1', icon: 'i-static-jetbrains-goland', note: '注释 1' },
  { value: 'option2', text: '选项 2', icon: 'i-static-visual-studio', note: '注释 2' },
  { value: 'option3', text: '选项 3' },
]

// 控制下拉框显示状态
const isOpen = ref(false)
const selectBox = ref<HTMLElement | null>(null)

// 计算属性，用于查找当前选中的选项
const selectedOption = computed(() =>
  options.find(option => option.value === modelValue.value),
)

// 切换下拉框的显示状态
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// 选择一个选项并发出值
function selectOption(option: Option) {
  modelValue.value = option.value
  emit('update:modelValue', option.value)
  isOpen.value = false
}

// 如果点击到下拉框外部则关闭下拉框
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
</script>

<template>
  <div
    ref="selectBox"
    relative
    flex="~ items-center"
    style="width: 500px;"
  >
    <div
      tabindex="0"
      w-full
      m="2px" p="x-6px y-5px"
      rounded="3px"
      outline="solid 2px $border-line focus:$active-3"
      bg="$active-2"
      flex="~ items-center" gap="0.25rem"
      cursor-default
      @click="toggleDropdown"
    >
      <span :class="selectedOption?.icon" />
      <span h="16px">{{ selectedOption?.text || '' }}</span>
      <span v-if="selectedOption?.note" text-comment>{{ selectedOption.note }}</span>
    </div>
    <span
      absolute top-9px right-7px
      i-static="inlay-drop-triangle"
      @click="toggleDropdown"
    />

    <template v-if="isOpen">
      <ul
        bg="$bg-1"
        w-full
        p-0 m="y-5px"
        flex="~ col"
        border="2px solid $border-1"
        absolute top-26px
        list-none
      >
        <li
          v-for="option in options"
          :key="option.value"
          bg="hover:$select-3"
          p="x-6px y-5px"
          flex gap="0.25rem"
          @click="selectOption(option)"
        >
          <span :class="option.icon" size="13px" />
          <span>{{ option.text }}</span>
          <span v-if="option.note" text-comment>{{ option.note }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
