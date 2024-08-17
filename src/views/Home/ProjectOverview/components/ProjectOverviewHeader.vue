<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ButtonSolid from '~/components/common/ButtonSolid.vue'
import SearchBar from '~/components/SearchBar.vue'

const { t } = useI18n()

const view = inject('view') as Ref<string>

function changeView() {
  if (view)
    view.value = 'NewView'
}
</script>

<template>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="15px"
  >
    <SearchBar grow />
    <ButtonSolid @click="changeView">
      {{ t('home.header.add_item') }}
    </ButtonSolid>
  </header>
</template>
