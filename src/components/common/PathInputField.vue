<script setup lang="ts">
import InputField from '~/components/common/InputField.vue'

const props = defineProps<{
  modelValue: string
  error?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'update:error'])

const folderPath = ref(props.modelValue)
const localError = ref(props.error ?? false)

// 监听 folderPath 的变化，将值传递回父组件
watch(folderPath, (newValue) => {
  emit('update:modelValue', newValue)
})

// 打开文件夹选择对话框
async function openFolder() {
  const selectedPaths = await window.api.openFolderDialog()
  if (selectedPaths.length > 0) {
    folderPath.value = selectedPaths[0]

    // 如果有错误, 则通过事件通知父组件取消错误状态
    if (localError.value) {
      localError.value = false
      emit('update:error', false)
    }
  }
}
</script>

<template>
  <span relative>
    <InputField
      v-model="folderPath"
      :error="localError"
      w-full box-border pr="27px"
    />
    <span
      absolute right="5px" top="50%" translate-y="-50%"
      p="2px" rounded-2px
      size="13px"
      bg="hover:theme-field-iconBgHover active:theme-field-iconBgActive"
      cursor-pointer
      i-mode="folder"
      @click="openFolder"
    />
  </span>
</template>
