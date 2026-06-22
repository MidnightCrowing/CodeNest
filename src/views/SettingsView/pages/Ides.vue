<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiSwitch from '~/components/ui/UiSwitch.vue'
import type { EditorCommandKey, EditorCommandOption } from '~/constants/codeEditor'
import { codeEditors, editorCommandOptions } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'
import { useDelayedBusyKeys } from '~/utils/useDelayedBusy'

type EditorControlKey = 'command' | 'terminal' | 'detect' | 'browse'

const settings = useSettingsStore()
const { t } = useI18n()
const editorRowRefs = new Map<EditorCommandKey, HTMLElement>()

const detectingKeys = ref<Set<EditorCommandKey>>(new Set())
const {
  visibleKeys: visibleDetectingKeys,
  setKeyBusy: setVisibleDetectingKey,
} = useDelayedBusyKeys<EditorCommandKey>({ delay: 220, minDuration: 320 })

const commandGroups = computed(() => {
  const groups = new Map<string, EditorCommandOption[]>()
  for (const option of editorCommandOptions) {
    const group = commandGroup(option)
    groups.set(group, [...(groups.get(group) || []), option])
  }
  return Array.from(groups.entries()).map(([label, options]) => ({ label, options }))
})

const editorCommandRows = computed(() => commandGroups.value.flatMap(group => group.options))
const terminalCommandHint = computed(() => t('app.settings.editors.terminal_command_hint', { cwd: '{cwd}' }))

function commandGroup(option: EditorCommandOption) {
  return t(option.groupKey)
}

function editorDescription(option: EditorCommandOption) {
  return option.descriptionKey ? t(option.descriptionKey) : commandGroup(option)
}

function editorNames(option: EditorCommandOption) {
  return option.editors.map(editor => codeEditors[editor].label).join(', ')
}

async function browseEditor(option: EditorCommandOption) {
  const selectedPaths = await window.api.openFileDialog({
    fileTypes: [
      { name: t('app.dialog.file_types.executable'), extensions: ['exe', 'bat', 'cmd'] },
      { name: t('app.dialog.file_types.all'), extensions: ['*'] },
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
  setVisibleDetectingKey(option.key, true)
  try {
    await settings.detectEditorCommand(option.key)
  }
  finally {
    const next = new Set(detectingKeys.value)
    next.delete(option.key)
    detectingKeys.value = next
    setVisibleDetectingKey(option.key, false)
  }
}

function clearEditor(option: EditorCommandOption) {
  settings.codeEditorsPath[option.key] = ''
}

function clearTerminalCommand() {
  settings.terminalCommand = ''
}

function setEditorRowRef(key: EditorCommandKey, element: unknown) {
  if (element instanceof HTMLElement) {
    editorRowRefs.set(key, element)
    return
  }

  editorRowRefs.delete(key)
}

function editorControlKey(target: EventTarget | null) {
  const element = target instanceof HTMLElement
    ? target.closest<HTMLElement>('[data-editor-control]')
    : null
  const control = element?.dataset.editorControl
  return control === 'command' || control === 'terminal' || control === 'detect' || control === 'browse'
    ? control
    : null
}

function focusEditorControl(option: EditorCommandOption | undefined, preferredControl: EditorControlKey | null) {
  if (!option)
    return

  const row = editorRowRefs.get(option.key)
  if (!row)
    return

  const selector = preferredControl
    ? `[data-editor-control="${preferredControl}"]:not(:disabled)`
    : '[data-editor-control]:not(:disabled)'
  const target = row.querySelector<HTMLElement>(selector)
    || row.querySelector<HTMLElement>('[data-editor-control]:not(:disabled)')

  target?.focus({ preventScroll: true })
  target?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function focusEditorControlByOffset(option: EditorCommandOption, offset: number, preferredControl: EditorControlKey | null) {
  const rows = editorCommandRows.value
  const currentIndex = rows.findIndex(item => item.key === option.key)
  if (currentIndex < 0)
    return

  const targetIndex = Math.max(0, Math.min(rows.length - 1, currentIndex + offset))
  focusEditorControl(rows[targetIndex], preferredControl)
}

function handleEditorRowKeydown(option: EditorCommandOption, event: KeyboardEvent) {
  if (event.defaultPrevented)
    return

  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
    return

  event.preventDefault()
  event.stopPropagation()
  focusEditorControlByOffset(option, event.key === 'ArrowUp' ? -1 : 1, editorControlKey(event.target))
}

function commandActionButtons(toolbar: HTMLElement) {
  return Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-editor-control]'))
    .filter(button => !button.disabled && button.getClientRects().length > 0)
}

function handleCommandActionsKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented)
    return

  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End')
    return

  const toolbar = event.currentTarget
  if (!(toolbar instanceof HTMLElement))
    return

  const buttons = commandActionButtons(toolbar)
  const target = event.target instanceof HTMLElement
    ? event.target.closest<HTMLButtonElement>('[data-editor-control]')
    : null
  const currentIndex = target ? buttons.indexOf(target) : -1
  if (!buttons.length)
    return

  event.preventDefault()
  event.stopPropagation()

  const nextIndex = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? buttons.length - 1
      : Math.max(0, Math.min(buttons.length - 1, currentIndex + (event.key === 'ArrowLeft' ? -1 : 1)))

  buttons[nextIndex]?.focus({ preventScroll: true })
}

function quoteCommand(command: string) {
  return /\s/.test(command) ? `"${command.replaceAll('"', '\\"')}"` : command
}
</script>

<template>
  <div class="settings-page" flex flex-col gap-12px>
    <header class="page-header" flex items-end justify-between gap-10px>
      <h2 m-0 text-16px font-650>
        {{ t('app.settings.editors.title') }}
      </h2>
    </header>

    <div flex flex-col gap-22px>
      <section min-w-0 flex flex-col gap-8px>
        <h3 m-0 text-13px font-650>
          {{ t('app.settings.editors.terminal_launcher') }}
        </h3>

        <div
          class="terminal-row"
          min-w-0 grid items-center gap-12px pl-18px
        >
          <div min-w-0 flex items-center gap-9px>
            <span class="i-lucide:square-terminal" shrink-0 text-18px />
            <div min-w-0 flex flex-col gap-2px>
              <strong truncate text-13px font-620>{{ t('app.settings.editors.terminal_command') }}</strong>
              <span truncate text-11px color="$ui-muted-foreground" :title="terminalCommandHint">
                {{ terminalCommandHint }}
              </span>
            </div>
          </div>

          <div relative min-w-0>
            <input
              v-model="settings.terminalCommand"
              class="path-input"
              w-full pr-30px
              spellcheck="false"
              :aria-label="t('app.settings.editors.terminal_command')"
              :placeholder="t('app.settings.editors.terminal_command_placeholder')"
              :title="settings.terminalCommand || terminalCommandHint"
            >
            <button
              v-if="settings.terminalCommand"
              class="clear-path-button"
              type="button"
              :title="t('app.settings.editors.clear_command')"
              :aria-label="t('app.settings.editors.clear_command')"
              @click="clearTerminalCommand"
            >
              <span class="i-lucide:x" />
            </button>
          </div>
        </div>
      </section>

      <section
        v-for="group in commandGroups"
        :key="group.label"
        min-w-0 flex flex-col gap-8px
      >
        <h3 m-0 text-13px font-650>
          {{ group.label }}
        </h3>

        <div
          v-for="option in group.options"
          :key="option.key"
          :ref="el => setEditorRowRef(option.key, el)"
          class="editor-row"
          min-w-0 grid items-center gap-12px pl-18px
          @keydown="handleEditorRowKeydown(option, $event)"
        >
          <div min-w-0 flex items-center gap-9px>
            <span class="ide-icon" shrink-0 text-18px :class="[option.icon, { 'monochrome-editor-icon': option.monochromeIcon }]" />
            <div min-w-0 flex flex-col gap-2px>
              <strong truncate text-13px font-620 :title="option.label">{{ option.label }}</strong>
              <span truncate text-11px color="$ui-muted-foreground" :title="editorDescription(option) || editorNames(option)">{{ editorDescription(option) || editorNames(option) }}</span>
            </div>
          </div>

          <div class="command-area" min-w-0 grid items-center gap-7px>
            <div relative min-w-0>
              <input
                v-model="settings.codeEditorsPath[option.key]"
                class="path-input"
                w-full pr-30px
                data-editor-control="command"
                spellcheck="false"
                :aria-label="t('app.settings.editors.command_label', { editor: option.label })"
                :placeholder="t('app.settings.editors.command_placeholder')"
                :title="settings.codeEditorsPath[option.key] || t('app.settings.editors.command_placeholder')"
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

            <label
              class="terminal-toggle"
              min-w-0 flex items-center gap-7px text-12px
              color="$ui-muted-foreground" cursor-pointer
              :title="t('app.settings.editors.terminal_desc')"
            >
              <span whitespace-nowrap>{{ t('app.settings.editors.terminal') }}</span>
              <UiSwitch
                v-model="settings.codeEditorsOpenInTerminal[option.key]"
                data-editor-control="terminal"
                :aria-label="t('app.settings.editors.terminal_desc')"
              />
            </label>

            <div
              class="command-actions"
              flex items-center gap-5px
              role="toolbar"
              aria-orientation="horizontal"
              :aria-label="option.label"
              @keydown="handleCommandActionsKeydown"
            >
              <button
                class="icon-button"
                type="button"
                data-editor-control="detect"
                :title="t('app.settings.editors.auto_detect')"
                :aria-label="t('app.settings.editors.auto_detect')"
                :disabled="detectingKeys.has(option.key)"
                @click="detectEditor(option)"
              >
                <span class="i-lucide:wand-sparkles" :class="{ spinning: visibleDetectingKeys.has(option.key) }" />
              </button>
              <button
                class="icon-button"
                type="button"
                data-editor-control="browse"
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
h2,
h3 {
  overflow-wrap: anywhere;
}

.editor-row,
.terminal-row {
  grid-template-columns: minmax(180px, 250px) minmax(0, 1fr);
}

.command-area {
  grid-template-columns: minmax(0, 1fr) max-content max-content;
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
  .terminal-row,
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
