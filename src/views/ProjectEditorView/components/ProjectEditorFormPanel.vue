<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiCombobox from '~/components/ui/UiCombobox.vue'
import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiSwitch from '~/components/ui/UiSwitch.vue'
import { ProjectKind } from '~/constants/localProject'

import type { ProjectEditorFieldKey } from '../composables/useProjectEditor'
import { localProjectItem } from '../ProjectEditorViewProvider'

interface SelectOption {
  value: string
  label: string
}

defineProps<{
  analyzing: boolean
  browseProjectPath: () => void
  detectingLicense: boolean
  duplicatePath: boolean
  editorOptions: SelectOption[]
  fieldInvalid: (field: ProjectEditorFieldKey) => boolean
  fillProjectName: () => void
  fillSourceName: () => void
  folderStatus: string
  groupOptions: string[]
  handlePathBlur: () => void
  isRemote: boolean
  isUpdate: boolean
  languageOptions: string[]
  licenseOptions: SelectOption[]
  mainLanguageStatus: string
  markTouched: (field: ProjectEditorFieldKey) => void
  modeOptions: SelectOption[]
  projectKindOptions: SelectOption[]
  projectMode: string
  repositoryFolderName: string
  runAnalyzeProject: () => void
  runDetectLicense: () => void
  setProjectMode: (mode: string) => void
  sourceSuggestion: string
  updateProjectKind: (kind: string) => void
  visibleAnalyzing: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div min-w-0 flex flex-col gap-12px>
    <section rounded-6px overflow-hidden bg="$ui-surface-background" shadow="$shadow-surface">
      <header
        min-h-42px px-14px py-8px border-b
        flex items-center justify-between gap-12px
        light:border="$gray-13" dark:border="$gray-3"
      >
        <strong min-w-0 truncate text-13px font-600>{{ t('app.project_editor.sections.project') }}</strong>
      </header>

      <div v-if="!isUpdate" class="setting-row">
        <div class="setting-copy">
          <strong>{{ t('app.project_editor.fields.location') }}</strong>
        </div>
        <UiSegmentedControl
          class="kind-control"
          :model-value="projectMode"
          :options="modeOptions"
          :aria-label="t('app.project_editor.fields.location')"
          @update:model-value="setProjectMode"
        />
      </div>

      <div v-if="!isRemote" class="setting-row">
        <label class="setting-copy" for="project-path">
          <strong>{{ t('app.project_editor.fields.folder') }}</strong>
        </label>
        <div min-w-0 flex flex-col items-end gap-5px>
          <div class="inline-field">
            <input
              id="project-path"
              v-model="localProjectItem.path"
              class="text-input"
              w-420px
              :class="{ invalid: fieldInvalid('path') || duplicatePath }"
              :aria-label="t('app.project_editor.fields.folder')"
              :title="localProjectItem.path || ''"
              spellcheck="false"
              @blur="handlePathBlur"
            >
            <button
              class="icon-button"
              type="button"
              :title="t('app.common.browse_folder')"
              :aria-label="t('app.common.browse_folder')"
              @click="browseProjectPath"
            >
              <span class="i-lucide:folder-open" />
            </button>
          </div>
          <p
            class="field-message status-message error"
            :class="{ empty: !folderStatus }"
            :aria-hidden="!folderStatus"
          >
            {{ folderStatus }}
          </p>
        </div>
      </div>

      <template v-else>
        <div class="setting-row">
          <label class="setting-copy" for="project-remote-host">
            <strong>{{ t('app.project_editor.fields.remote_host') }}</strong>
            <span>{{ t('app.project_editor.fields.remote_host_desc') }}</span>
          </label>
          <div min-w-0 flex flex-col items-end gap-5px>
            <div class="inline-field">
              <input
                id="project-remote-host"
                v-model="localProjectItem.remoteHost"
                class="text-input"
                w-420px
                :class="{ invalid: fieldInvalid('remoteHost') }"
                :aria-label="t('app.project_editor.fields.remote_host')"
                :placeholder="t('app.project_editor.fields.remote_host_placeholder')"
                :title="localProjectItem.remoteHost || ''"
                spellcheck="false"
                @blur="markTouched('remoteHost')"
              >
            </div>
          </div>
        </div>

        <div class="setting-row">
          <label class="setting-copy" for="project-remote-path">
            <strong>{{ t('app.project_editor.fields.remote_path') }}</strong>
          </label>
          <div min-w-0 flex flex-col items-end gap-5px>
            <div class="inline-field">
              <input
                id="project-remote-path"
                v-model="localProjectItem.remotePath"
                class="text-input compact"
                :class="{ invalid: fieldInvalid('remotePath') || duplicatePath }"
                :aria-label="t('app.project_editor.fields.remote_path')"
                :placeholder="t('app.project_editor.fields.remote_path_placeholder')"
                :title="localProjectItem.remotePath || ''"
                spellcheck="false"
                @blur="markTouched('remotePath')"
              >
            </div>
            <p
              class="field-message status-message error"
              :class="{ empty: !folderStatus }"
              :aria-hidden="!folderStatus"
            >
              {{ folderStatus }}
            </p>
          </div>
        </div>
      </template>

      <div class="setting-row">
        <label class="setting-copy" for="project-name">
          <strong>{{ t('app.project_editor.fields.name') }}</strong>
        </label>
        <div class="inline-field">
          <input
            id="project-name"
            v-model="localProjectItem.name"
            class="text-input compact"
            :class="{ invalid: fieldInvalid('name') }"
            :aria-label="t('app.project_editor.fields.name')"
            :title="localProjectItem.name || ''"
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
        <div class="setting-copy">
          <strong>{{ t('app.project_editor.fields.type') }}</strong>
        </div>
        <UiSegmentedControl
          class="kind-control"
          :model-value="localProjectItem.kind"
          :options="projectKindOptions"
          :aria-label="t('app.project_editor.fields.type')"
          @update:model-value="updateProjectKind"
        />
      </div>

      <Transition name="source-details">
        <div v-if="localProjectItem.kind !== ProjectKind.MINE" class="setting-row stacked source-details-row">
          <div
            class="source-grid"
            min-w-0 flex-1 grid gap-8px grid-cols="[repeat(2,minmax(0,1fr))]"
          >
            <label
              min-w-0 flex flex-col gap-5px text-12px
              color="$ui-foreground"
            >
              <span break-anywhere>{{ t('app.project_editor.fields.source_url') }}</span>
              <input
                v-model="localProjectItem.fromUrl"
                class="text-input"
                w-full
                spellcheck="false"
                :aria-label="t('app.project_editor.fields.source_url')"
                :title="localProjectItem.fromUrl || ''"
                @blur="markTouched('fromUrl')"
              >
            </label>
            <label
              min-w-0 flex flex-col gap-5px text-12px
              color="$ui-foreground"
            >
              <span break-anywhere>{{ t('app.project_editor.fields.source_name') }}</span>
              <div class="inline-field">
                <input
                  v-model="localProjectItem.fromName"
                  class="text-input"
                  w-full
                  spellcheck="false"
                  :aria-label="t('app.project_editor.fields.source_name')"
                  :title="localProjectItem.fromName || ''"
                  @blur="markTouched('fromName')"
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
      </Transition>

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
            :title="localProjectItem.group || ''"
          >
          <datalist id="project-groups">
            <option v-for="group in groupOptions" :key="group" :value="group" />
          </datalist>
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

    <section rounded-6px overflow-hidden bg="$ui-surface-background" shadow="$shadow-surface">
      <header
        min-h-42px px-14px py-8px border-b
        flex items-center justify-between gap-12px
        light:border="$gray-13" dark:border="$gray-3"
      >
        <strong min-w-0 truncate text-13px font-600>{{ t('app.project_editor.sections.metadata') }}</strong>
      </header>

      <div v-if="!isRemote" class="setting-row">
        <label class="setting-copy" for="project-language">
          <strong>{{ t('app.project_editor.fields.main_language') }}</strong>
          <span>{{ t('app.project_editor.fields.main_language_desc') }}</span>
        </label>
        <div min-w-0 flex flex-col items-end gap-5px>
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
              {{ visibleAnalyzing ? t('app.project_editor.analyzing') : t('app.project_editor.analyze') }}
            </button>
          </div>
          <p
            class="field-message status-message neutral"
            :class="{ empty: !mainLanguageStatus }"
            :aria-hidden="!mainLanguageStatus"
          >
            {{ mainLanguageStatus }}
          </p>
        </div>
      </div>

      <div class="setting-row">
        <label class="setting-copy" for="project-editor">
          <strong>{{ t('app.project_editor.fields.open_with') }}</strong>
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

      <div v-if="!isRemote" class="setting-row">
        <label class="setting-copy" for="project-license">
          <strong>{{ t('app.project_editor.fields.license') }}</strong>
        </label>
        <div min-w-0 flex flex-col items-end gap-5px>
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
              {{ t('app.common.detect') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.setting-row {
  @apply min-h-52px px-14px py-8px border-b grid items-center gap-14px;
  @apply light:border-$gray-13 dark:border-$gray-3;
  @apply grid-cols-[minmax(0,1fr)_max-content];
}

.setting-row.stacked {
  @apply items-stretch grid-cols-[minmax(0,1fr)];
}

.setting-copy {
  @apply min-w-0 flex flex-col gap-3px;

  strong {
    @apply text-13px font-600 break-anywhere;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8 break-anywhere;
  }
}

.inline-field {
  @apply flex items-center gap-7px;
}

.source-details-row {
  @apply min-h-0 overflow-hidden pl-34px;
}

.source-details-enter-active,
.source-details-leave-active {
  @apply max-h-120px min-h-0;
  transition:
    max-height 140ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 120ms ease-out,
    border-color 140ms ease-out,
    padding-top 140ms cubic-bezier(0.16, 1, 0.3, 1),
    padding-bottom 140ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

.source-details-enter-from,
.source-details-leave-to {
  @apply max-h-0 min-h-0 opacity-0 border-transparent pt-0 pb-0 -translate-y-4px;
}

.field-message {
  @apply m-0 min-h-16px max-w-420px text-right text-12px lh-16px break-anywhere;
}

@media (max-width: 680px) {
  .setting-row {
    @apply gap-7px grid-cols-[1fr];
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
    @apply grid-cols-[1fr];
  }
}
</style>
