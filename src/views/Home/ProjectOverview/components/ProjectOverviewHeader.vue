<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
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
    <ButtonPrimary @click="changeView">
      {{ t('home.header.add_item') }}
    </ButtonPrimary>
  </header>
</template>
