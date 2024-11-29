<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import SettingPathCard from '~/components/SettingPathCard.vue'
import { type CodeEditorEnum, codeEditors } from '~/constants/codeEditor'
import { settings } from '~/core/settings'
import { eventBus } from '~/utils/eventBus'

const { t } = useI18n()
const unsaveChanges = inject('unsaveChanges') as Ref<boolean>

const originalCodeEditorsPaths = structuredClone(settings.getSetting('codeEditorsPath')) as Record<CodeEditorEnum, string>
const codeEditorsPaths = ref<Record<CodeEditorEnum, string>>(
  structuredClone(originalCodeEditorsPaths) as Record<CodeEditorEnum, string>,
)

function updateCodeEditorsPaths() {
  codeEditorsPaths.value = structuredClone(settings.getSetting('codeEditorsPath')) as Record<CodeEditorEnum, string>
}

function savePathSetting() {
  settings.updateSetting('codeEditorsPath', toRaw(codeEditorsPaths.value))
}

watch(codeEditorsPaths, (newValue) => {
  unsaveChanges.value = JSON.stringify(newValue) !== JSON.stringify(originalCodeEditorsPaths)
}, { deep: true })

eventBus.on('updateSettings', updateCodeEditorsPaths)
eventBus.on('saveSettings', savePathSetting)
</script>

<template>
  <div
    flex="~ col" gap="8px"
    p="10px"
  >
    <h3>{{ t('settings.ides_path.title') }}</h3>
    <SettingPathCard
      v-for="[editor, value] in Object.entries(codeEditors)"
      :key="editor"
      v-model="codeEditorsPaths[editor as CodeEditorEnum]"
    >
      <div flex="~ items-center" gap="10px">
        <span :class="value.icon" text="1.25rem" />
        <strong>{{ value.label }}</strong>
      </div>
    </SettingPathCard>
  </div>
</template>
