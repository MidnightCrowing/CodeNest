<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiSwitch from '~/components/ui/UiSwitch.vue'
import type { EditorCommandKey, EditorCommandOption } from '~/constants/codeEditor'
import { codeEditors, editorCommandOptions } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'

const settings = useSettingsStore()
const { t } = useI18n()

const detectingKeys = ref<Set<EditorCommandKey>>(new Set())

const commandGroups = computed(() => {
  const groups = new Map<string, EditorCommandOption[]>()
  for (const option of editorCommandOptions) {
    const group = commandGroup(option)
    groups.set(group, [...(groups.get(group) || []), option])
  }
  return Array.from(groups.entries()).map(([label, options]) => ({ label, options }))
})

function commandGroup(option: EditorCommandOption) {
  return codeEditors[option.editors[0]]?.group || 'Editors'
}

function commandPlaceholder(option: EditorCommandOption) {
  return option.defaultCommand
}

function editorNames(option: EditorCommandOption) {
  return option.editors.map(editor => codeEditors[editor].label).join(', ')
}

async function browseEditor(option: EditorCommandOption) {
  const selectedPaths = await window.api.openFileDialog({
    fileTypes: [
      { name: 'Executable Files', extensions: ['exe', 'bat', 'cmd'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  if (selectedPaths[0]) {
    settings.codeEditorsPath[option.key] = option.openInTerminal
      ? quoteCommand(selectedPaths[0])
      : `${quoteCommand(selectedPaths[0])} {project}`
  }
}

async function detectEditor(option: EditorCommandOption) {
  if (detectingKeys.value.has(option.key))
    return

  detectingKeys.value = new Set([...detectingKeys.value, option.key])
  try {
    await settings.detectEditorCommand(option.key)
  }
  finally {
    const next = new Set(detectingKeys.value)
    next.delete(option.key)
    detectingKeys.value = next
  }
}

function clearEditor(option: EditorCommandOption) {
  settings.codeEditorsPath[option.key] = ''
}

function quoteCommand(command: string) {
  return /\s/.test(command) ? `"${command.replaceAll('"', '\\"')}"` : command
}
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h2>{{ t('app.settings.editors.title') }}</h2>
    </header>

    <div class="editor-groups">
      <section
        v-for="group in commandGroups"
        :key="group.label"
        class="editor-group"
      >
        <h3>{{ group.label }}</h3>

        <div
          v-for="option in group.options"
          :key="option.key"
          class="editor-row"
        >
          <div class="editor-name">
            <span class="ide-icon" :class="[option.icon, { 'monochrome-editor-icon': option.monochromeIcon }]" />
            <div>
              <strong>{{ option.label }}</strong>
              <span>{{ option.description || editorNames(option) }}</span>
            </div>
          </div>

          <div class="command-area">
            <div class="command-input-wrap">
              <input
                v-model="settings.codeEditorsPath[option.key]"
                class="path-input"
                spellcheck="false"
                :aria-label="t('app.settings.editors.command_placeholder', { editor: option.label })"
                :placeholder="commandPlaceholder(option)"
              >
              <button
                v-if="settings.codeEditorsPath[option.key]"
                class="clear-path-button"
                type="button"
                :title="t('app.settings.editors.clear_command')"
                :aria-label="t('app.settings.editors.clear_command')"
                @click="clearEditor(option)"
              >
                <span class="i-lucide:x" />
              </button>
            </div>

            <label class="terminal-toggle">
              <UiSwitch v-model="settings.codeEditorsOpenInTerminal[option.key]" />
              <span>{{ t('app.settings.editors.terminal') }}</span>
            </label>

            <div class="command-actions">
              <button
                class="icon-button"
                type="button"
                :title="t('app.settings.editors.auto_detect')"
                :aria-label="t('app.settings.editors.auto_detect')"
                @click="detectEditor(option)"
              >
                <span class="i-lucide:wand-sparkles" :class="{ spinning: detectingKeys.has(option.key) }" />
              </button>
              <button
                class="icon-button"
                type="button"
                :title="t('app.settings.editors.browse_executable')"
                :aria-label="t('app.settings.editors.browse_executable')"
                @click="browseEditor(option)"
              >
                <span class="i-lucide:folder-open" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  @apply flex flex-col gap-12px;
}

.page-header {
  @apply flex items-end justify-between gap-10px;

  h2 {
    @apply m-0 text-16px font-650;
  }
}

.editor-groups {
  @apply flex flex-col gap-22px;
}

.editor-group {
  @apply min-w-0 flex flex-col gap-8px;

  h3 {
    @apply m-0 text-13px font-650;
  }
}

.editor-row {
  @apply min-w-0 grid items-center gap-12px pl-18px;
  grid-template-columns: minmax(180px, 250px) minmax(0, 1fr);
}

.editor-name {
  @apply min-w-0 flex items-center gap-9px;

  > span {
    @apply shrink-0 text-18px;
  }

  div {
    @apply min-w-0 flex flex-col gap-2px;
  }

  strong {
    @apply truncate text-13px font-620;
  }

  div span {
    @apply truncate text-11px color-$ui-muted-foreground;
  }
}

.command-area {
  @apply min-w-0 grid items-center gap-7px;
  grid-template-columns: minmax(0, 1fr) max-content max-content;
}

.command-input-wrap {
  @apply relative min-w-0;
}

.path-input {
  @apply w-full pr-30px;
}

.terminal-toggle {
  @apply min-w-0 flex items-center gap-6px text-12px color-$ui-muted-foreground cursor-pointer;
}

.command-actions {
  @apply flex items-center gap-5px;
}

.spinning {
  animation: spin-detect 0.8s linear infinite;
}

@keyframes spin-detect {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .editor-row,
  .command-area {
    grid-template-columns: 1fr;
  }

  .command-area {
    @apply gap-8px;
  }

  .command-actions {
    @apply justify-end;
  }
}
</style>
