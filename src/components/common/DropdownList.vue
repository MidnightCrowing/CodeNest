<script setup lang="ts">
interface Option {
  value: string
  label: string
  iconClass?: string
  description?: string
  category?: string
}

const props = defineProps<{
  modelValue: any
  options: Option[]
  error?: boolean
}>()

const emit = defineEmits(['update:modelValue'])
const selectedValue = ref(props.modelValue)
const isOpen = ref(false) // 控制下拉框显示状态
const isError = ref(props.error || false)
const selectBox = ref<HTMLElement | null>(null)

// 查找当前选中的选项
const selectedOption = computed(() => {
  // 确保 options 和 modelValue 不为空
  if (!props.options || !selectedValue.value)
    return { value: '', label: '<None>' }
  return props.options.find(option => option.value === selectedValue.value) || { value: '', label: '<None>' }
})

// 分组选项
const groupedOptions = computed(() => {
  // 确保 options 不为空
  if (!props.options || props.options.length === 0)
    return { ungrouped: [], groupedByCategory: {} }

  const ungrouped = props.options.filter(option => !option.category)
  const grouped = props.options.filter(option => option.category)
  const groupedByCategory: Record<string, Option[]> = grouped.reduce((acc, option) => {
    const group = option.category || 'Other'
    if (!acc[group])
      acc[group] = []
    acc[group].push(option)
    return acc
  }, {} as Record<string, Option[]>)

  return { ungrouped, groupedByCategory }
})

// 选项描述或类别
const optionDescriptionOrCategory = computed(() => {
  return selectedOption.value?.description || selectedOption.value?.category || ''
})

function handleFocus() {
  // 取消警告样式
  isError.value = false
}

// 切换下拉框的显示状态
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// 选择一个选项并发出值
function selectOption(option: Option | string) {
  if (typeof option === 'string') {
    selectedValue.value = option
  }
  else {
    selectedValue.value = option.value
  }
  emit('update:modelValue', selectedValue.value)
  isOpen.value = false
}

// 如果点击到下拉框外部则关闭下拉框
function handleClickOutside(event: MouseEvent) {
  if (selectBox.value && !selectBox.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

watch(() => props.error, (newValue) => {
  isError.value = newValue
})

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
      :class="[
        isError ? 'outline-theme-dropdown-borderError' : 'outline-theme-dropdown-border',
      ]"
      tabindex="0"
      bg="theme-dropdown-bg"
      min-w-full max-w-full m="2px" p="l-6px r-27px" box-border
      rounded="3px"
      outline="~ 2px focus:theme-dropdown-borderFocused"
      cursor-default
      @focus="handleFocus"
      @click="toggleDropdown"
    >
      <span
        v-if="selectedOption?.iconClass"
        class="option-icon" :class="selectedOption?.iconClass"
      />
      <span class="option-label" h="16px">
        {{ selectedOption?.label || '' }}
      </span>
      <span v-if="optionDescriptionOrCategory" class="option-description">
        {{ optionDescriptionOrCategory }}
      </span>
    </div>
    <span
      absolute top-9px right-7px
      size="13px"
      color="theme-field-border"
      i-static="inlay-drop-triangle?mask"
      @click="toggleDropdown"
    />

    <template v-if="isOpen">
      <ul
        bg="theme-dropdown-bg"
        w-full max-h="600px"
        m="y-5px" b="solid 2px theme-dropdown-border" p-0
        z="1"
        flex="~ col"
        absolute top-26px
        list-none
        cursor-default
        overflow-auto scrollbar-thin
      >
        <!-- 当没有传入 options 或 options 为空时，显示 <None> -->
        <li
          v-if="!props.options || props.options.length === 0"
          class="option-item"
          @click="selectOption('<None>')"
        >
          &lt;None&gt;
        </li>

        <!-- 未分组项 -->
        <template v-if="groupedOptions.ungrouped.length > 0">
          <li
            v-for="option in groupedOptions.ungrouped"
            :key="option.value"
            class="option-item"
            @click="selectOption(option)"
          >
            <span class="option-icon" :class="option.iconClass" />
            <span class="option-label">
              {{ option.label }}
            </span>
            <span v-if="option.description" class="option-description">
              {{ option.description }}
            </span>
          </li>
        </template>

        <!-- 按组显示的项 -->
        <template v-for="(group, groupName) in groupedOptions.groupedByCategory" :key="groupName">
          <li head-2 text-comment m="t-2px l-2px" p="3px">
            {{ groupName }}
          </li>
          <li
            v-for="option in group"
            :key="option.value"
            class="option-item"
            @click="selectOption(option)"
          >
            <span class="option-icon" :class="option.iconClass" />
            <span class="option-label">
              {{ option.label }}
            </span>
            <span v-if="option.description" class="option-description">
              {{ option.description }}
            </span>
          </li>
        </template>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
.option-item {
  --uno: "py-5px";
  --uno: "flex items-center";

  ul & {
    --uno: "px-6px";
    --uno: "hover:bg-theme-dropdown-bgSelected";
  }

  .option-icon {
    --uno: "mr-0.25rem";
    --uno: "size-min-13px";
  }

  .option-label {
    --uno: "max-w-70%";
    --uno: "truncate";
  }

  .option-description {
    --uno: "ml-0.5rem";
    --uno: "text-comment text-nowrap truncate whitespace-pre";
  }
}
</style>
