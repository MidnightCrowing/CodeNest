<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ButtonSolid from '~/components/common/ButtonSolid.vue'
import SearchBar from '~/components/SearchBar.vue'

const { t } = useI18n()
</script>

<template>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="15px"
  >
    <SearchBar grow />
    <ButtonSolid>
      {{ t('home.header.add_item') }}
    </ButtonSolid>
  </header>
</template>
