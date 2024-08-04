<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const searchText = ref('')

function clearInput() {
  searchText.value = ''
}
</script>

<template>
  <span relative h="26px" overflow-hidden>
    <span
      w="15px" h="15px"
      m="x-3px y-auto" absolute top-0 bottom-0 left-0
      pointer-events-none
      icon="search"
    />
    <input
      v-model="searchText"
      :placeholder="t('header.search_project')"
      spellcheck="false"
    >
    <span
      v-if="searchText"
      w="15px" h="15px"
      m="x-3px y-auto" absolute top-0 bottom-0 right-0
      cursor-pointer
      icon="close-small hover:close-small-hovered"
      @click="clearInput"
    />
  </span>
</template>

<style scoped lang="scss">
input {
  --uno: "bg-transparent color-$text-color-2 placeholder-$text-color-3";
  --uno: "border-none outline-none shadow-none";
  --uno: "h-full w-[calc(100%-46px)] px-23px";
}
</style>
