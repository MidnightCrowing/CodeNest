<script lang="ts" setup>
import JeInputField from './InputField.vue'
import type { JeFileInputFieldProps } from './types.ts'

const props = withDefaults(defineProps<JeFileInputFieldProps>(), {
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
  <span class="je-file-input-filed">
    <!-- Input -->
    <JeInputField
      v-model="folderPath"
      :validated="validated"
      :validated-tooltip="validatedTooltip"
      :disabled="disabled"
      class="je-file-input-filed__input"
    />

    <!-- Icon -->
    <span
      class="je-file-input-filed__icon-wrapper"
      :class="{
        'je-file-input-filed__icon-wrapper--validated': validated,
        'je-file-input-filed__icon-wrapper--disabled': disabled,
      }"
      :tabindex="disabled ? -1 : 0"
      @click="openFolder"
      @keydown.enter="openFolder"
    >
      <span class="je-file-input-filed__icon-folder" />
    </span>
  </span>
</template>

<style lang="scss" scoped>
.je-file-input-filed {
  @apply relative;
}

.je-file-input-filed__icon-wrapper {
  @apply absolute right-5px top-50% translate-y--50%;
  @apply size-19px rounded-3px;
  @apply flex items-center justify-center;

  &:not(&--disabled) {
    @apply cursor-pointer;
    @apply focus-visible:outline focus-visible:outline-2px;

    // light
    @apply light:hover:bg-$gray-11 light:active:bg-$gray-12;

    // dark
    @apply dark:hover:bg-$gray-4 dark:active:bg-$gray-3;
  }

  &:not(&--validated, &--disabled) {
    @apply light:focus-visible:outline-$blue-4 dark:focus-visible:outline-$blue-6;
  }

  &--validated:not(&--disabled) {
    @apply light:focus-visible:outline-$red-4 dark:focus-visible:outline-$red-6;
  }
}

.je-file-input-filed__icon-folder {
  @apply text-17px;

  @apply light:i-jet:folder dark:i-jet:folder-dark;
}
</style>

<style lang="scss">
.je-file-input-filed__input .je-input-field__input {
  @apply w-full pr-27px;
}
</style>
