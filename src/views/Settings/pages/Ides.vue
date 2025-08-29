<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import SettingPathCard from '~/components/SettingPathCard.vue'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settings'

const settings = useSettingsStore()
const { t } = useI18n()

const codeEditorsPaths = ref(settings.codeEditorsPath)
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
        <strong whitespace-nowrap>{{ value.label }}</strong>
      </div>
    </SettingPathCard>
  </div>
</template>
