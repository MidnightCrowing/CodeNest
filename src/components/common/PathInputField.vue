<script setup lang="ts">
import InputField from '~/components/common/InputField.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const folderPath = ref(props.modelValue)

// 当 folderPath 变化时，将其值传回父组件
watch(folderPath, (newValue) => {
  emit('update:modelValue', newValue)
})

async function openFolder() {
  const selectedPaths = await window.api.openFolderDialog()
  if (selectedPaths.length > 0) {
    folderPath.value = selectedPaths[0]
  }
}
</script>

<template>
  <span relative>
    <InputField
      v-model="folderPath"
      w-full box-border pr="27px"
    />
    <span
      absolute right="5px" top="50%" translate-y="-50%"
      p="2px" rounded-2px
      size="13px"
      bg="hover:$hover-1 active:$active-1"
      i-mode="folder"
      @click="openFolder"
    />
  </span>
</template>
