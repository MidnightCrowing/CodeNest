<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { ProjectKind } from '~/constants/localProject'
import { JeCheckbox } from '~/jetv-ui'

const emit = defineEmits(['update:projectKind'])

const { t } = useI18n()

const isTestProject = ref(false)

watch(isTestProject, (newValue) => {
  if (newValue)
    emit('update:projectKind', ProjectKind.TEST)
  else
    emit('update:projectKind', ProjectKind.MINE)
})
</script>

<template>
  <div col-start="2">
    <JeCheckbox
      v-model="isTestProject"
      class="checkbox-setting"
      w-fit
    >
      {{ t('new_project.kind_component.test_desc') }}
    </JeCheckbox>
  </div>
</template>

<style lang="scss" scoped>
.checkbox-setting {
  @apply light:bg-$gray-13;
}
</style>
