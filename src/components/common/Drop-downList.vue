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
  { value: 'option1', text: '选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1选项 1', icon: 'i-static-jetbrains-goland', note: '注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1注释 1' },
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
    min-w="72px"
  >
    <div
      class="option-item"
      tabindex="0"
      min-w-full max-w-full m="2px" p="l-6px r-27px" box-border
      rounded="3px"
      outline="solid 2px $border-line focus:$active-3"
      bg="$active-2"
      cursor-default
      @click="toggleDropdown"
    >
      <span v-if="selectedOption?.icon" class="option-icon" :class="selectedOption?.icon" />
      <span class="option-text" h="16px">{{ selectedOption?.text || '' }}</span>
      <span v-if="selectedOption?.note" class="option-note">{{ selectedOption.note }}</span>
    </div>
    <span
      absolute top-9px right-7px
      i-static="inlay-drop-triangle"
      @click="toggleDropdown"
    />

    <template v-if="isOpen">
      <ul
        bg="$bg-1"
        w-full max-h="600px"
        p-0 m="y-5px"
        flex="~ col"
        border="solid 2px $border-1"
        absolute top-26px
        list-none
        cursor-default
      >
        <li
          v-for="option in options"
          :key="option.value"
          class="option-item"
          bg="hover:$select-3"
          p="x-6px"
          @click="selectOption(option)"
        >
          <span class="option-icon" :class="option.icon" />
          <span class="option-text">{{ option.text }}</span>
          <span v-if="option.note" class="option-note">{{ option.note }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
.option-item {
  --uno: "py-5px";
  --uno: "flex items-center gap-0.25rem";

  .option-icon {
    --uno: "size-min-13px";
  }

  .option-text {
    --uno: "truncate";
  }

  .option-note {
    --uno: "text-comment text-nowrap truncate";
    --uno: "max-w-30%";
  }
}
</style>
