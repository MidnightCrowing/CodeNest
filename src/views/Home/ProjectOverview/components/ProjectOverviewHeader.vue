<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { JeButton, JeSearchField } from '~/jetv-ui'

const { t } = useI18n()

const view = inject('view') as Ref<string>

function changeView() {
  if (view)
    view.value = 'NewView'
}
const pathInputValue = ref('')
</script>

<template>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="15px"
  >
    <JeSearchField v-model="pathInputValue" type="in-editor" grow />
    <JeButton @click="changeView">
      {{ t('home.header.add_item') }}
    </JeButton>
  </header>
</template>
