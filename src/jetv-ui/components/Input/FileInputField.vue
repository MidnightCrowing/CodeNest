<script lang="ts" setup>
import { JeInputField } from './index'
import type { FileInputField } from './type'

const props = withDefaults(defineProps<FileInputField>(), {
  validated: false,
  disabled: false,
})

const emit = defineEmits(['update:modelValue', 'update:validated'])

const folderPath = ref(props.modelValue)

// 监听 folderPath 的变化，将值传递回父组件
watch(folderPath, (newValue) => {
  emit('update:modelValue', newValue)
})

// 打开文件夹选择对话框
async function openFolder() {
  if (!props.disabled) {
    const selectedPaths = await window.api.openFolderDialog()
    if (selectedPaths.length > 0) {
      folderPath.value = selectedPaths[0]
    }
  }
}
</script>

<template>
  <span class="je-file-input-filed-wrapper">
    <!-- Input -->
    <JeInputField
      v-model="folderPath"
      :validated="validated"
      :disabled="disabled"
      class="file-input"
    />

    <!-- Icon -->
    <span
      class="icon-wrapper"
      :class="{ disabled }"
      @click="openFolder"
    >
      <span class="folder-icon" />
    </span>
  </span>
</template>

<style lang="scss" scoped>
.je-file-input-filed-wrapper {
  @apply relative;

  .file-input {
    @apply w-full box-border pr-27px;
  }

  .icon-wrapper {
    @apply absolute right-5px top-50% translate-y--50%;
    @apply size-19px rounded-3px;
    @apply flex items-center justify-center;

    &:not(.disabled) {
      @apply cursor-pointer;

      // light
      @apply light:hover:bg-$gray-11 light:active:bg-$gray-12;

      // dark
      @apply dark:hover:bg-$gray-4 dark:active:bg-$gray-3;
    }

    .folder-icon {
      @apply text-17px;

      @apply light:i-jet:folder dark:i-jet:folder-dark;
    }
  }
}
</style>
