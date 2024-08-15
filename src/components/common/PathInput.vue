<script setup lang="ts">
import Input from '~/components/common/Input.vue'

const folderPath: Ref<string> = ref('')

async function openFolder() {
  const selectedPaths = await window.api.openFolderDialog()
  if (selectedPaths.length > 0) {
    folderPath.value = selectedPaths[0]
  }
}
</script>

<template>
  <span relative>
    <Input
      v-model="folderPath"
      w-full box-border p="r-27px"
    />
    <span
      absolute
      p="2px" rounded-2px
      right="5px" top="50%" translate-y="-50%"
      bg="hover:$hover-1 active:$active-1"
      i-mode="folder"
      @click="openFolder"
    />
  </span>
</template>
