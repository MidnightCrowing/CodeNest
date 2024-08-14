<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import CheckBox from '~/components/common/CheckBox.vue'

interface Settings {
  checkboxSetting: boolean
  textSetting: string
}

const props = defineProps<{
  value: Settings
}>()

const emit = defineEmits<{
  (e: 'update:value', value: Settings): void
}>()

const { t } = useI18n()

const internalValue = ref({ ...props.value })

watch(internalValue, (newValue) => {
  emit('update:value', newValue)
}, { deep: true })
</script>

<template>
  <div col-start="2">
    <CheckBox
      v-model="internalValue.checkboxSetting"
      :title="t('new_project.kind_component.test_desc')"
      w-fit
    />
  </div>
</template>
