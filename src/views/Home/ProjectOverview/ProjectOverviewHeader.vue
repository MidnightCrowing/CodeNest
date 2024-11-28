<script lang="ts" setup>
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ViewEnum } from '~/constants/appEnums'
import { JeButton, JeSearchField } from '~/jetv-ui'

const { t } = useI18n()

const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeNewProjectView() {
  if (activatedView)
    activatedView.value = ViewEnum.NewProject
}

const pathInputValue = ref('')
// 控制菜单的显示/隐藏状态
</script>

<template>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="15px"
  >
    <JeSearchField
      v-model="pathInputValue"
      class="overview-header-search-input" type="in-editor"
      grow
    />
    <JeButton @click="changeNewProjectView">
      {{ t('home.header.add_item') }}
    </JeButton>
  </header>
</template>

<style lang="scss">
.overview-header-search-input .je-search-filed__input.je-search-filed__input--in-editor .je-input-field__input {
  @apply light:bg-$gray-14 dark:bg-$gray-1;
}
</style>
