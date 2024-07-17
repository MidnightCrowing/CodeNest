<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import SearchBar from '~/components/SearchBar.vue'

const { t } = useI18n()
</script>

<template>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="7px"
  >
    <SearchBar grow />
    <button button>
      {{ t('header.add_item') }}
    </button>
  </header>
</template>

<style scoped lang="scss">

</style>
