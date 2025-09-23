<script lang="ts" setup>
import { JeSearchField, JeSlimButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { ViewEnum } from '~/constants/appEnums'

const props = defineProps<{
  searchValue: string
}>()
const emit = defineEmits(['update:searchValue'])

const { t } = useI18n()

const activatedView = inject('activatedView') as Ref<ViewEnum>
const searchInputValue = ref(props.searchValue)

function changeNewProjectView() {
  if (activatedView) {
    activatedView.value = ViewEnum.ProjectEditor
  }
}

watch(searchInputValue, (newSearchValue) => {
  emit('update:searchValue', newSearchValue)
})
</script>

<template>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="15px"
  >
    <JeSearchField
      v-model="searchInputValue"
      class="overview-header-search-input" type="in-editor"
      grow
    />
    <JeSlimButton type="alt" @click="changeNewProjectView">
      {{ t('home.header.add_item') }}
    </JeSlimButton>
  </header>
</template>

<style lang="scss" scoped>
.overview-header-search-input :deep(.je-search-filed__input).je-search-filed__input--in-editor .je-input-field__input {
  @apply light:bg-$gray-14 dark:bg-$gray-1;
}
</style>
