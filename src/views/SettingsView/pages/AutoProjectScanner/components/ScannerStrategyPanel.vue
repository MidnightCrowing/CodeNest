<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'

interface SelectOption {
  value: CodeEditorEnum
  label: string
}

interface ModeOption {
  value: string
  label: string
  tooltip: string
}

defineProps<{
  editorOptions: SelectOption[]
  ideOpenModeOptions: ModeOption[]
  rootOpenModeOptions: ModeOption[]
  showClearConfirm: boolean
  specifiedEditorEnabled: boolean
}>()

const emit = defineEmits<{
  'update:showClearConfirm': [value: boolean]
}>()

const { t } = useI18n()
const settings = useSettingsStore()
</script>

<template>
  <section min-w-0 flex flex-col gap-8px>
    <header min-h-34px flex flex-col gap-3px>
      <strong text-13px font-650 break-anywhere>{{ t('app.settings.scanner.strategy.title') }}</strong>
      <span text-12px break-anywhere light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.strategy.desc') }}</span>
    </header>

    <div min-h-42px flex items-center justify-between gap-12px>
      <div min-w-0 flex flex-col gap-3px>
        <strong text-13px font-620 break-anywhere>{{ t('app.settings.scanner.root_open_mode.title') }}</strong>
        <span text-12px break-anywhere light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.root_open_mode.desc') }}</span>
      </div>
      <UiSegmentedControl
        v-model="settings.scanner.rootOpenMode"
        :options="rootOpenModeOptions"
        :aria-label="t('app.settings.scanner.root_open_mode.title')"
      />
    </div>

    <div min-h-42px flex items-center justify-between gap-12px>
      <div min-w-0 flex flex-col gap-3px>
        <strong text-13px font-620 break-anywhere>{{ t('app.settings.scanner.ide_open_mode.title') }}</strong>
        <span text-12px break-anywhere light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.ide_open_mode.desc') }}</span>
      </div>
      <UiSegmentedControl
        v-model="settings.scanner.ideOpenMode"
        :options="ideOpenModeOptions"
        :aria-label="t('app.settings.scanner.ide_open_mode.title')"
      />
    </div>

    <div min-h-42px flex items-center justify-between gap-12px>
      <div min-w-0 flex flex-col gap-3px>
        <strong text-13px font-620 break-anywhere>{{ t('app.settings.scanner.specified_editor.title') }}</strong>
        <span text-12px break-anywhere light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.specified_editor.desc') }}</span>
      </div>
      <UiSelect
        v-model="settings.scanner.editor"
        :options="editorOptions"
        :aria-label="t('app.settings.scanner.specified_editor.title')"
        :disabled="!specifiedEditorEnabled"
        min-width="160px"
        content-width="210px"
      />
    </div>

    <div min-h-42px flex items-center justify-between gap-12px>
      <div min-w-0 flex flex-col gap-3px>
        <strong text-13px font-620 break-anywhere>{{ t('app.settings.scanner.name_pattern.title') }}</strong>
        <span text-12px break-anywhere light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.name_pattern.desc') }}</span>
      </div>
      <input
        v-model="settings.scanner.namePattern"
        class="path-input"
        w-180px
        spellcheck="false"
        :aria-label="t('app.settings.scanner.name_pattern.title')"
      >
    </div>

    <div
      min-h-42px flex flex-wrap items-center justify-between
      gap-12px
    >
      <div min-w-0 flex-1 flex flex-col gap-3px>
        <strong text-13px font-620 break-anywhere>{{ t('app.settings.scanner.history.title') }}</strong>
        <span text-12px break-anywhere light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.history.desc') }}</span>
      </div>
      <button class="danger-button" ml-auto type="button" @click="emit('update:showClearConfirm', true)">
        {{ t('app.settings.scanner.history.clear') }}
      </button>
    </div>
  </section>
</template>
