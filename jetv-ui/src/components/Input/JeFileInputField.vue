<script lang="ts" setup>
import JeInputField from './JeInputField.vue'
import type { JeFileInputFieldProps } from './types.ts'

const props = withDefaults(defineProps<JeFileInputFieldProps>(), {
  validated: false,
  disabled: false,
  mode: 'folder',
})
const emit = defineEmits(['update:modelValue', 'update:validated'])

const filePath = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 打开文件/文件夹选择对话框
async function openPicker() {
  if (props.disabled) {
    return
  }

  if (props.mode === 'file') {
    const selectedPaths = await window.api.openFileDialog({
      title: props.dialogTitle,
      fileTypes: props.fileTypes,
    })
    if (selectedPaths && selectedPaths.length > 0) {
      filePath.value = selectedPaths[0]
    }
  }
  else {
    const selectedPaths = await window.api.openFolderDialog({
      title: props.dialogTitle,
    })
    if (selectedPaths && selectedPaths.length > 0) {
      filePath.value = selectedPaths[0]
    }
  }
}
</script>

<template>
  <span class="je-file-input-filed">
    <!-- Input -->
    <JeInputField
      v-model="filePath"
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
      @click="openPicker"
      @keydown.enter="openPicker"
    >
      <span
        :class="mode === 'folder'
          ? 'je-file-input-filed__icon-folder'
          : 'je-file-input-filed__icon-file'"
      />
    </span>
  </span>
</template>

<style lang="scss" scoped>
.je-file-input-filed {
  @apply relative flex-items-center;
}

.je-file-input-filed__input :deep(.je-input-field__input) {
  @apply w-full pr-27px;
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

.je-file-input-filed__icon-file {
  @apply text-17px;

  @apply light:i-jet:anytype dark:i-jet:anytype-dark;
}
</style>
