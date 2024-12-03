<script lang="ts" setup>
import { JeCheckbox } from '@jetv/ui'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isTestProject: boolean
}>()
const emit = defineEmits(['update:isTestProject'])

const { t } = useI18n()

const isTestProjectLocal = ref(props.isTestProject)

watch(isTestProjectLocal, (newValue) => {
  emit('update:isTestProject', newValue)
})
</script>

<template>
  <div col-start="2">
    <JeCheckbox
      v-model="isTestProjectLocal"
      class="checkbox-setting"
      w-fit
    >
      {{ t('project_config.kind.test') }}
    </JeCheckbox>
  </div>
</template>

<style lang="scss" scoped>
.checkbox-setting {
  @apply light:bg-$gray-13;
}
</style>
