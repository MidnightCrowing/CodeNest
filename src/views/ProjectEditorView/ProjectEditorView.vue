<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiCombobox from '~/components/ui/UiCombobox.vue'
import UiScrollArea from '~/components/ui/UiScrollArea.vue'
import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiSwitch from '~/components/ui/UiSwitch.vue'
import { ViewEnum } from '~/constants/appEnums'
import type { CodeEditorEnum, CodeEditorOption } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { LanguageAnalyzer } from '~/services/languageAnalyzer'
import { detectLicenseBySnippet } from '~/services/licenseDetector'
import { useEditorLangGroupsStore } from '~/stores/editorLangGroupsStore'
import { useProjectsStore } from '~/stores/projectsStore'

import {
  initializeNewProjectState,
  isUpdateProject,
  localProjectItem,
} from './ProjectEditorViewProvider'

defineOptions({
  name: 'ProjectEditor',
})

type FieldKey = 'path' | 'name' | 'mainLang' | 'defaultOpen'

const PATH_SPLIT_RE = /[\\/]+/
const GITHUB_REPO_RE = /github\.com[/:]([^/:\s]+\/[^/\s#.]+)/

const activatedView = inject('activatedView') as Ref<ViewEnum>
const projectsStore = useProjectsStore()
const editorLangGroupsStore = useEditorLangGroupsStore()
const initialProjectPath = localProjectItem.value.path || ''
const { t } = useI18n()

const analyzing = ref(false)
const detectingLicense = ref(false)
const lastAnalyzedPath = ref(initialProjectPath)
const touchedFields = reactive<Record<FieldKey, boolean>>({
  path: false,
  name: false,
  mainLang: false,
  defaultOpen: false,
})

const editorRows = computed(() =>
  Object.entries(codeEditors) as Array<[CodeEditorEnum, CodeEditorOption]>,
)

const editorOptions = computed(() =>
  editorRows.value.map(([editor, option]) => ({
    value: editor,
    label: `${option.group ? `${option.group} / ` : ''}${option.label}`,
  })),
)

const licenseOptions = computed(() =>
  [
    LicenseEnum.NONE,
    ...Object.values(LicenseEnum).filter(value => value !== LicenseEnum.NONE),
  ].map(value => ({
    value,
    label: shortLicense(value),
  })),
)

const projectKindOptions = computed(() =>
  [ProjectKind.MINE, ProjectKind.FORK, ProjectKind.CLONE].map(kind => ({
    value: kind,
    label: kindLabel(kind),
  })),
)

const languageOptions = computed(() =>
  (localProjectItem.value.langGroup || [])
    .filter(language => language.text !== 'Other')
    .map(language => language.text),
)

const repositoryFolderName = computed(() =>
  localProjectItem.value.path
    ? localProjectItem.value.path.split(PATH_SPLIT_RE).filter(Boolean).at(-1) || ''
    : '',
)

const duplicatePath = computed(() =>
  !!localProjectItem.value.path
  && projectsStore.checkPathExistenceInProjects(
    localProjectItem.value.path,
    isUpdateProject.value && initialProjectPath ? [initialProjectPath] : [],
  ),
)

const sourceSuggestion = computed(() => {
  const url = localProjectItem.value.fromUrl?.trim()
  if (!url)
    return ''
  return url.match(GITHUB_REPO_RE)?.[1] || ''
})

const canSave = computed(() =>
  !!localProjectItem.value.path
  && !!localProjectItem.value.name
  && !!localProjectItem.value.mainLang
  && !!localProjectItem.value.defaultOpen,
)

const summaryItems = computed(() => [
  { label: t('app.project_editor.summary.mode'), value: isUpdateProject.value ? t('app.project_editor.mode.edit') : t('app.project_editor.mode.new') },
  { label: t('app.project_editor.summary.kind'), value: kindLabel(localProjectItem.value.kind) },
  { label: t('app.project_editor.summary.editor'), value: localProjectItem.value.defaultOpen ? codeEditors[localProjectItem.value.defaultOpen]?.label : t('app.common.not_set') },
  { label: t('app.project_editor.summary.license'), value: shortLicense(localProjectItem.value.license as LicenseEnum) },
])

async function browseProjectPath() {
  const selectedPaths = await window.api.openFolderDialog()
  if (!selectedPaths[0])
    return

  localProjectItem.value.path = selectedPaths[0]
  touchedFields.path = true
  await refreshDetectedProjectMetadata()
}

function handlePathBlur() {
  markTouched('path')
  void refreshDetectedProjectMetadata()
}

function fillProjectName() {
  if (repositoryFolderName.value) {
    localProjectItem.value.name = repositoryFolderName.value
    touchedFields.name = true
  }
}

function fillSourceName() {
  if (sourceSuggestion.value) {
    localProjectItem.value.fromName = sourceSuggestion.value
  }
}

function markTouched(field: FieldKey) {
  touchedFields[field] = true
}

function hasDetectedMetadata() {
  return !!localProjectItem.value.mainLang && !!localProjectItem.value.defaultOpen
}

function resetDetectedProjectMetadata() {
  localProjectItem.value.mainLang = null
  localProjectItem.value.mainLangColor = null
  localProjectItem.value.langGroup = []
  localProjectItem.value.defaultOpen = null
  localProjectItem.value.license = LicenseEnum.NONE
}

async function refreshDetectedProjectMetadata() {
  const path = localProjectItem.value.path?.trim()
  if (!path)
    return
  if (path === lastAnalyzedPath.value && hasDetectedMetadata())
    return

  if (!localProjectItem.value.name) {
    localProjectItem.value.name = repositoryFolderName.value
  }

  resetDetectedProjectMetadata()
  lastAnalyzedPath.value = path

  await Promise.all([
    analyzeProject(path),
    detectLicense(path),
  ])
}

async function analyzeProject(targetPath = localProjectItem.value.path) {
  const path = targetPath
  if (!path)
    return

  analyzing.value = true
  try {
    const analyzer = new LanguageAnalyzer(path)
    const success = await analyzer.analyze()
    if (!success)
      return
    if (localProjectItem.value.path !== path)
      return

    localProjectItem.value.mainLang = analyzer.mainLang
    localProjectItem.value.mainLangColor = analyzer.mainLangColor
    localProjectItem.value.langGroup = analyzer.langGroup
    if (analyzer.mainLang) {
      localProjectItem.value.defaultOpen = editorLangGroupsStore.getEditorByLanguage(analyzer.mainLang)
    }
  }
  finally {
    analyzing.value = false
  }
}

function runAnalyzeProject() {
  void analyzeProject()
}

async function detectLicense(targetPath = localProjectItem.value.path) {
  const path = targetPath
  if (!path)
    return

  detectingLicense.value = true
  try {
    const res = await window.api.readProjectLicense(path)
    if (!res?.success || !res.snippet)
      return
    if (localProjectItem.value.path !== path)
      return

    const { license, score } = detectLicenseBySnippet(res.snippet)
    if (license && score > 0) {
      localProjectItem.value.license = license
    }
  }
  finally {
    detectingLicense.value = false
  }
}

function runDetectLicense() {
  void detectLicense()
}

function updateLanguage(language: string | null) {
  localProjectItem.value.mainLang = language
  const languageItem = localProjectItem.value.langGroup?.find(item => item.text === language)
  localProjectItem.value.mainLangColor = languageItem?.color || null
  localProjectItem.value.defaultOpen = language
    ? editorLangGroupsStore.getEditorByLanguage(language)
    : null
}

function validateFields() {
  touchedFields.path = true
  touchedFields.name = true
  touchedFields.mainLang = true
  touchedFields.defaultOpen = true
  return canSave.value && !duplicatePath.value
}

function toProject(): LocalProject {
  return {
    appendTime: localProjectItem.value.appendTime || Date.now(),
    path: localProjectItem.value.path!,
    name: localProjectItem.value.name!,
    group: localProjectItem.value.group || '',
    kind: localProjectItem.value.kind,
    ...(localProjectItem.value.kind === ProjectKind.FORK || localProjectItem.value.kind === ProjectKind.CLONE
      ? {
          fromUrl: localProjectItem.value.fromUrl || undefined,
          fromName: localProjectItem.value.fromName || undefined,
        }
      : {}),
    mainLang: localProjectItem.value.mainLang!,
    mainLangColor: localProjectItem.value.mainLangColor || undefined,
    langGroup: localProjectItem.value.langGroup || [],
    defaultOpen: localProjectItem.value.defaultOpen!,
    license: localProjectItem.value.license !== LicenseEnum.NONE
      ? localProjectItem.value.license as LicenseEnum
      : undefined,
    isTemporary: !!localProjectItem.value.isTemporary,
    isExists: true,
  }
}

async function saveProject() {
  if (!validateFields())
    return

  const project = toProject()
  if (isUpdateProject.value) {
    await projectsStore.updateProject(project.appendTime, project)
  }
  else {
    await projectsStore.addProject(project, true)
  }
  closeEditor()
}

function closeEditor() {
  initializeNewProjectState()
  activatedView.value = ViewEnum.Home
}

function updateProjectKind(kind: string) {
  localProjectItem.value.kind = kind as ProjectKind
}

function kindLabel(kind: ProjectKind) {
  switch (kind) {
    case ProjectKind.FORK:
      return t('app.project_kind.fork')
    case ProjectKind.CLONE:
      return t('app.project_kind.clone')
    case ProjectKind.MINE:
    default:
      return t('app.project_kind.mine')
  }
}

function shortLicense(license?: LicenseEnum | string | null) {
  if (!license || license === LicenseEnum.NONE)
    return t('app.license.none')
  if (license === LicenseEnum.MIT)
    return 'MIT'
  if (license === LicenseEnum.APACHE_2_0)
    return 'Apache-2.0'
  if (license === LicenseEnum.GPLV3)
    return 'GPL-3.0'
  if (license === LicenseEnum.GPLV2)
    return 'GPL-2.0'
  if (license === LicenseEnum.OTHER)
    return t('app.license.other')
  return String(license).replace(' License', '').replace('GNU ', '')
}

function fieldInvalid(field: FieldKey) {
  return touchedFields[field] && !localProjectItem.value[field]
}

watch(
  () => localProjectItem.value.path,
  (path, oldPath) => {
    if (path === oldPath)
      return
    if (!path) {
      lastAnalyzedPath.value = ''
    }
    resetDetectedProjectMetadata()
  },
  { flush: 'sync' },
)

watch(
  () => localProjectItem.value.mainLang,
  language => updateLanguage(language),
)
</script>

<template>
  <main class="editor-shell">
    <header class="editor-topbar">
      <button class="icon-button back-button" type="button" :title="t('app.common.back')" :aria-label="t('app.common.back')" @click="closeEditor">
        <span class="i-lucide:chevron-left" />
      </button>

      <div class="title-block">
        <h1>{{ isUpdateProject ? t('app.project_editor.title.edit') : t('app.project_editor.title.add') }}</h1>
      </div>

      <div class="topbar-actions">
        <button class="ghost-button" type="button" @click="closeEditor">
          {{ t('app.common.cancel') }}
        </button>
        <button class="primary-button" type="button" :disabled="!canSave || duplicatePath" @click="saveProject">
          {{ isUpdateProject ? t('app.project_editor.save_changes') : t('app.project_editor.add_project') }}
        </button>
      </div>
    </header>

    <UiScrollArea class="editor-body-scroll" type="always">
      <section class="editor-body">
        <div class="form-panel">
          <section class="form-section">
            <header class="section-header">
              <strong>{{ t('app.project_editor.sections.project') }}</strong>
            </header>

            <div class="setting-row">
              <label class="setting-copy" for="project-path">
                <strong>{{ t('app.project_editor.fields.folder') }}</strong>
                <span v-if="duplicatePath" class="error-text">{{ t('app.project_editor.fields.folder_duplicate') }}</span>
                <span v-else>{{ t('app.project_editor.fields.folder_desc') }}</span>
              </label>
              <div class="inline-field">
                <input
                  id="project-path"
                  v-model="localProjectItem.path"
                  class="text-input"
                  :class="{ invalid: fieldInvalid('path') || duplicatePath }"
                  :aria-label="t('app.project_editor.fields.folder')"
                  spellcheck="false"
                  @blur="handlePathBlur"
                >
                <button class="icon-button" type="button" :title="t('app.common.browse_folder')" :aria-label="t('app.common.browse_folder')" @click="browseProjectPath">
                  <span class="i-lucide:folder-open" />
                </button>
              </div>
            </div>

            <div class="setting-row">
              <label class="setting-copy" for="project-name">
                <strong>{{ t('app.project_editor.fields.name') }}</strong>
                <span>{{ t('app.project_editor.fields.name_desc') }}</span>
              </label>
              <div class="inline-field">
                <input
                  id="project-name"
                  v-model="localProjectItem.name"
                  class="text-input compact"
                  :class="{ invalid: fieldInvalid('name') }"
                  :aria-label="t('app.project_editor.fields.name')"
                  spellcheck="false"
                  @blur="markTouched('name')"
                >
                <button
                  v-if="repositoryFolderName && localProjectItem.name !== repositoryFolderName"
                  class="ghost-button"
                  type="button"
                  @click="fillProjectName"
                >
                  {{ t('app.project_editor.use_folder') }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <label class="setting-copy" for="project-group">
                <strong>{{ t('app.project_editor.fields.group') }}</strong>
                <span>{{ t('app.project_editor.fields.group_desc') }}</span>
              </label>
              <div class="inline-field">
                <input
                  id="project-group"
                  v-model="localProjectItem.group"
                  class="text-input compact"
                  list="project-groups"
                  spellcheck="false"
                  :aria-label="t('app.project_editor.fields.group')"
                  :placeholder="t('app.project_editor.no_group')"
                >
                <datalist id="project-groups">
                  <option v-for="group in projectsStore.allGroups" :key="group" :value="group" />
                </datalist>
              </div>
            </div>
          </section>

          <section class="form-section">
            <header class="section-header">
              <strong>{{ t('app.project_editor.sections.metadata') }}</strong>
            </header>

            <div class="setting-row">
              <div class="setting-copy">
                <strong>{{ t('app.project_editor.fields.source') }}</strong>
                <span>{{ t('app.project_editor.fields.source_desc') }}</span>
              </div>
              <UiSegmentedControl
                class="kind-control"
                :model-value="localProjectItem.kind"
                :options="projectKindOptions"
                :aria-label="t('app.project_editor.fields.source')"
                @update:model-value="updateProjectKind"
              />
            </div>

            <div v-if="localProjectItem.kind !== ProjectKind.MINE" class="setting-row stacked">
              <div class="source-grid">
                <label>
                  <span>{{ t('app.project_editor.fields.source_url') }}</span>
                  <input
                    v-model="localProjectItem.fromUrl"
                    class="text-input"
                    spellcheck="false"
                    :aria-label="t('app.project_editor.fields.source_url')"
                  >
                </label>
                <label>
                  <span>{{ t('app.project_editor.fields.source_name') }}</span>
                  <div class="inline-field">
                    <input
                      v-model="localProjectItem.fromName"
                      class="text-input"
                      spellcheck="false"
                      :aria-label="t('app.project_editor.fields.source_name')"
                    >
                    <button
                      v-if="sourceSuggestion && localProjectItem.fromName !== sourceSuggestion"
                      class="ghost-button"
                      type="button"
                      @click="fillSourceName"
                    >
                      {{ t('app.project_editor.use_repo') }}
                    </button>
                  </div>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <label class="setting-copy" for="project-language">
                <strong>{{ t('app.project_editor.fields.main_language') }}</strong>
                <span>{{ analyzing ? t('app.project_editor.analyzing_desc') : t('app.project_editor.fields.main_language_desc') }}</span>
              </label>
              <div class="inline-field">
                <UiCombobox
                  v-model="localProjectItem.mainLang"
                  :options="languageOptions"
                  :invalid="fieldInvalid('mainLang')"
                  :placeholder="t('app.project_editor.fields.main_language')"
                  :aria-label="t('app.project_editor.fields.main_language')"
                  min-width="220px"
                  content-width="240px"
                  @blur="markTouched('mainLang')"
                />
                <button class="ghost-button" type="button" :disabled="!localProjectItem.path || analyzing" @click="runAnalyzeProject">
                  {{ analyzing ? t('app.project_editor.analyzing') : t('app.project_editor.analyze') }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <label class="setting-copy" for="project-editor">
                <strong>{{ t('app.project_editor.fields.open_with') }}</strong>
                <span>{{ t('app.project_editor.fields.open_with_desc') }}</span>
              </label>
              <UiSelect
                v-model="localProjectItem.defaultOpen"
                :placeholder="t('app.project_editor.select_editor')"
                :options="editorOptions"
                :aria-label="t('app.project_editor.fields.open_with')"
                :class="{ invalid: fieldInvalid('defaultOpen') }"
                min-width="220px"
                content-width="260px"
                @blur="markTouched('defaultOpen')"
              />
            </div>

            <div class="setting-row">
              <label class="setting-copy" for="project-license">
                <strong>{{ t('app.project_editor.fields.license') }}</strong>
                <span>{{ detectingLicense ? t('app.project_editor.detecting_license_desc') : t('app.project_editor.fields.license_desc') }}</span>
              </label>
              <div class="inline-field">
                <UiSelect
                  v-model="localProjectItem.license"
                  :options="licenseOptions"
                  :placeholder="t('app.project_editor.fields.license')"
                  :aria-label="t('app.project_editor.fields.license')"
                  min-width="220px"
                  content-width="240px"
                />
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="!localProjectItem.path || detectingLicense"
                  @click="runDetectLicense"
                >
                  {{ detectingLicense ? t('app.project_editor.detecting') : t('app.common.detect') }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-copy">
                <strong>{{ t('app.project_editor.fields.temporary') }}</strong>
                <span>{{ t('app.project_editor.fields.temporary_desc') }}</span>
              </div>
              <UiSwitch
                v-model="localProjectItem.isTemporary"
                :aria-label="t('app.project_editor.fields.temporary')"
              />
            </div>
          </section>
        </div>
        <aside class="summary-panel">
          <section class="summary-card">
            <header class="summary-header">
              <strong>{{ localProjectItem.name || t('app.project_editor.unnamed') }}</strong>
              <span>{{ localProjectItem.mainLang || t('app.project_editor.no_language') }}</span>
            </header>

            <div class="summary-path" :title="localProjectItem.path || ''">
              {{ localProjectItem.path || t('app.project_editor.no_folder') }}
            </div>

            <div class="summary-list">
              <div v-for="item in summaryItems" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </section>

          <section class="summary-card">
            <header class="summary-header">
              <div class="summary-title">
                <strong>{{ t('app.project_editor.language_mix.title') }}</strong>
                <span>{{ t('app.project_editor.language_mix.entries', { count: localProjectItem.langGroup?.length || 0 }) }}</span>
              </div>
              <button
                class="icon-button language-refresh-button"
                type="button"
                :title="t('app.project_editor.language_mix.refresh')"
                :aria-label="t('app.project_editor.language_mix.refresh')"
                :disabled="!localProjectItem.path || analyzing"
                @click="runAnalyzeProject"
              >
                <span class="i-lucide:refresh-cw" :class="{ spinning: analyzing }" />
              </button>
            </header>

            <div v-if="!localProjectItem.langGroup?.length" class="empty-inline">
              {{ t('app.project_editor.language_mix.empty') }}
            </div>
            <div v-else class="language-list">
              <div v-for="language in localProjectItem.langGroup" :key="language.text" class="language-row">
                <div class="language-label">
                  <span class="color-dot" :style="{ background: language.color || '#b8b8b8' }" />
                  <strong>{{ language.text }}</strong>
                  <span>{{ language.percentage }}%</span>
                </div>
                <div class="language-bar">
                  <span :style="{ width: `${Math.min(language.percentage, 100)}%`, background: language.color || '#b8b8b8' }" />
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </UiScrollArea>
  </main>
</template>

<style lang="scss" scoped>
.editor-shell {
  @apply size-full overflow-hidden flex flex-col;
  @apply bg-$ui-page-background;
}

.editor-topbar {
  @apply shrink-0 px-14px py-10px grid items-center gap-10px;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.title-block {
  @apply min-w-0 flex items-center;

  h1 {
    @apply m-0 text-17px lh-21px font-650;
  }
}

.topbar-actions,
.inline-field {
  @apply flex items-center gap-7px;
}

.editor-body-scroll {
  @apply min-h-0 flex-1;
}

.editor-body {
  @apply min-h-full px-14px pb-12px grid items-start gap-12px;
  grid-template-columns: minmax(0, 1fr) 300px;
}

.form-panel,
.summary-panel {
  @apply min-w-0;
  @apply flex flex-col gap-12px;
}

.form-section,
.summary-card {
  @apply rounded-6px overflow-hidden;
  @apply bg-$ui-surface-background;
}

.section-header,
.summary-header {
  @apply min-h-42px px-12px py-8px border-b flex items-center justify-between gap-12px;
  @apply light:border-$gray-13 dark:border-$gray-3;

  strong {
    @apply text-13px font-650;
  }

  span {
    @apply min-w-0 truncate text-12px light:color-$gray-6 dark:color-$gray-8;
  }
}

.setting-row {
  @apply min-h-52px px-12px py-8px border-b grid items-center gap-14px;
  @apply light:border-$gray-13 dark:border-$gray-3;
  grid-template-columns: minmax(0, 1fr) max-content;
}

.toggle-row {
  @apply min-h-52px px-12px py-8px border-b flex items-center gap-14px;
  @apply light:border-$gray-13 dark:border-$gray-3;
}

.setting-row.stacked {
  @apply items-stretch;
  grid-template-columns: minmax(0, 1fr);
}

.setting-copy,
.checkbox-copy {
  @apply min-w-0 flex flex-col gap-3px;

  strong {
    @apply text-13px font-620;
  }

  span {
    @apply truncate text-12px light:color-$gray-6 dark:color-$gray-8;
  }
}

.toggle-row {
  @apply justify-start;
}

.text-input {
  @apply h-30px min-w-0 rounded-md border px-9px outline-none;
  appearance: none;
  border-style: solid;
  border-color: var(--ui-input);
  @apply bg-$ui-control-background color-$ui-foreground;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  &::placeholder {
    color: var(--ui-muted-foreground);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--ui-input), var(--ui-foreground) 18%);
  }

  &:focus {
    border-color: var(--ui-ring);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-ring), transparent 78%);
  }

  &.invalid {
    border-color: var(--red-5);
  }

  &:disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}

.text-input {
  @apply w-420px;
}

.text-input.compact {
  @apply w-220px;
}

.source-grid {
  @apply min-w-0 flex-1 grid gap-8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  label {
    @apply min-w-0 flex flex-col gap-5px text-12px color-$ui-foreground;
  }

  .text-input {
    @apply w-full;
  }
}

.primary-button,
.ghost-button,
.icon-button {
  @apply h-28px border-0 rounded-5px px-9px;
  @apply inline-flex items-center justify-center gap-5px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.icon-button {
  @apply w-28px px-0;
}

.back-button {
  @apply light:bg-transparent dark:bg-transparent;

  span {
    @apply text-16px;
  }
}

.primary-button {
  @apply bg-$ui-primary color-$ui-primary-foreground;
  @apply hover:bg-$ui-primary-hover active:bg-$ui-primary-active;

  &:disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}

.ghost-button,
.icon-button {
  @apply bg-$ui-surface-background color-$ui-foreground;
  @apply hover:bg-$ui-hover-background;

  &:disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}

.back-button {
  @apply light:bg-transparent dark:bg-transparent;
  @apply hover:bg-$ui-hover-background;
}

.summary-title {
  @apply min-w-0 flex flex-col gap-2px;
}

.language-refresh-button {
  @apply size-24px shrink-0;
  @apply light:color-$gray-1 dark:color-white;
}

.spinning {
  animation: spin-refresh 0.8s linear infinite;
}

@keyframes spin-refresh {
  to {
    transform: rotate(360deg);
  }
}

.summary-path {
  @apply px-12px py-9px truncate text-12px border-b;
  @apply light:border-$gray-13 dark:border-$gray-3;
  @apply light:color-$gray-6 dark:color-$gray-8;
}

.summary-list {
  @apply px-12px py-8px flex flex-col gap-7px;

  div {
    @apply flex items-center justify-between gap-10px;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
  }

  strong {
    @apply min-w-0 truncate text-12px font-620;
  }
}

.language-list {
  @apply p-12px flex flex-col gap-9px;
}

.language-row {
  @apply flex flex-col gap-5px;
}

.language-label {
  @apply min-w-0 flex items-center gap-6px;

  strong {
    @apply min-w-0 flex-1 truncate text-12px font-620;
  }

  span:last-child {
    @apply text-11px light:color-$gray-6 dark:color-$gray-8;
  }
}

.color-dot {
  @apply size-8px rounded-full shrink-0;
}

.language-bar {
  @apply h-4px rounded-full overflow-hidden bg-$ui-hover-background;

  span {
    @apply block h-full rounded-full;
  }
}

.empty-inline,
.error-text {
  @apply text-12px;
}

.empty-inline {
  @apply px-12px py-10px light:color-$gray-6 dark:color-$gray-8;
}

.error-text {
  @apply color-$red-5;
}

@media (max-width: 960px) {
  .editor-body {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    @apply hidden;
  }
}

@media (max-width: 680px) {
  .editor-topbar {
    @apply px-10px py-8px;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .topbar-actions {
    @apply col-span-2 justify-end;
  }

  .editor-body {
    @apply px-10px pb-10px;
  }

  .setting-row {
    @apply gap-7px;
    grid-template-columns: 1fr;
  }

  .setting-copy {
    @apply w-auto;
  }

  .inline-field {
    @apply flex-wrap;
  }

  .text-input,
  .text-input.compact {
    @apply flex-1 w-auto min-w-180px;
  }

  .source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
