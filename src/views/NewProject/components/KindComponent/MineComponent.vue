<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import CheckBox from '~/components/CheckBox.vue'

const props = defineProps({
  value: {
    type: Object as () => Settings,
    default: () => ({
      checkboxSetting: false,
      textSetting: '',
    }),
  },
})

const emit = defineEmits(['update:value'])

const { t } = useI18n()

interface Settings {
  checkboxSetting: boolean
  textSetting: string
}

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
    />
  </div>
</template>
