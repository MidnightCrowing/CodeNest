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
      size="15px"
      m="x-3px y-auto"
      absolute top-0 bottom-0 left-0
      pointer-events-none
      i-mode="search"
    />
    <input
      v-model="searchText"
      spellcheck="false"
      :placeholder="t('home.header.search_project')"
      bg-transparent color="$text-color-2 placeholder:text-comment"
      b-none outline-none shadow-none
      size-full box-border px-23px
    >
    <span
      v-if="searchText"
      w="15px" h="15px"
      m="x-3px y-auto" absolute top-0 bottom-0 right-0
      cursor-pointer
      i-mode="close-small hover:close-small-hovered"
      @click="clearInput"
    />
  </span>
</template>
