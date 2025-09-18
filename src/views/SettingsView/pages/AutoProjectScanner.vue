<script lang="ts" setup>
import type { JeDropdownOptionProps } from 'jetv-ui'
import { JeButton, JeFrame, JeInputField, JeLine, JePopup, JeRadio, JeSlimButton, JeToolbarDropdown, JeTransparentButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { codeEditors } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'

const settings = useSettingsStore()
const { t } = useI18n()

const projectRoots = ref<string[]>(settings.projectScannerRoots)
const defaultOpenMode = ref<'auto' | 'specified'>(settings.projectScannerOpenMode)
const editorOptions: JeDropdownOptionProps[] = Object.entries(codeEditors).map(([value, editor]) => ({
  value,
  label: editor.label,
}))

const showDialog = ref<boolean>(false)

async function openFolder() {
  const selectedPaths = await window.api.openFolderDialog()
  if (selectedPaths.length > 0) {
    projectRoots.value.push(...selectedPaths)
  }
}

function removeRoot(root: string) {
  const index = projectRoots.value.indexOf(root)
  if (index !== -1) {
    projectRoots.value.splice(index, 1)
  }
}

function deleteScanData() {
  window.api.deleteData('projectScanner')
  showDialog.value = false
}

watch(defaultOpenMode, (newValue) => {
  settings.projectScannerOpenMode = newValue
})
</script>

<template>
  <div
    flex="~ col" gap="8px"
    p="10px" box-border
    size-full
  >
    <h3 text="h2">
      {{ t('settings.auto_scan.title') }}
    </h3>

    <div text="secondary" m="b-10px">
      {{ t('settings.auto_scan.desc') }}
    </div>

    <div>
      <JeTransparentButton
        type="subtle"
        flex="~ row items-center" gap="3px"
        @click="openFolder"
      >
        <span i-jet="light:add dark:add-dark" />
        {{ t('settings.auto_scan.add_folder') }}
      </JeTransparentButton>
    </div>

    <JeFrame
      type="secondary"
      grow flex="~ col"
      b="solid 1px light:$gray-12 dark:$gray-3"
      min-h="200px" max-h="300px" overflow-auto
    >
      <div
        v-for="root in projectRoots" :key="root"
        class="group"
        hover:bg="light:$gray-12 dark:$gray-3"
        p="x-10px y-3px" b="solid 1px transparent" rounded="3px"
        text="default hover:default-semibold"
        flex="~ row items-center" gap="5px"
        focus-visible="outline-none b-$blue-primary"
        :tabindex="0"
      >
        <div truncate>
          {{ root }}
        </div>
        <JeLine
          grow min-w="10px"
          group-hover:bg="light:$gray-13 dark:$gray-2"
        />
        <span
          shrink-0
          i-jet="light:close-small dark:close-small-dark"
          hover:i-jet="light:close-hovered-small dark:close-small-hovered-dark"
          b="solid 1px transparent" rounded="3px"
          focus-visible="outline-none b-$blue-primary"
          cursor-pointer
          :tabindex="0"
          @click="removeRoot(root)"
          @keydown.enter="removeRoot(root)"
        />
      </div>
    </JeFrame>

    <div flex="~ row items-start" gap="5px">
      <div self-start text="default" lh="26px">
        {{ t('settings.auto_scan.default_open_mode') }}:
      </div>
      <div flex="~ col items-start" gap="3px">
        <JeRadio v-model="defaultOpenMode" value="auto">
          {{ t('settings.auto_scan.auto_select_program') }}
        </JeRadio>
        <JeRadio v-model="defaultOpenMode" value="specified">
          <div flex="~ items-center">
            {{ t('settings.auto_scan.always_use_custom_program') }}
            <JeToolbarDropdown
              v-model="settings.projectScannerEditor"
              label=""
              :options="editorOptions"
              :disabled="defaultOpenMode !== 'specified'"
            />
          </div>
        </JeRadio>
      </div>
    </div>

    <div flex="~ row items-center" gap="5px">
      <div text="default">
        {{ t('settings.auto_scan.temp_project_name_rule') }}:
      </div>

      <JeInputField v-model="settings.projectScannerNamePattern" spellcheck="false" w="300px" />
    </div>

    <div m="t-10px" flex="~ row items-center" gap="10px">
      <JeSlimButton type="alt" @click="showDialog = true">
        {{ t('settings.auto_scan.clear_history') }}
      </JeSlimButton>
    </div>

    <!-- Dialog -->
    <div
      v-if="showDialog"
      pos="fixed top-40px bottom-0 left-0 right-0"
      flex="~ items-center justify-center"
      bg="light:black/30 dark:black/50"
    >
      <JePopup p="20px" rounded="8px" w="400px">
        <h3>{{ t('settings.auto_scan.clear_history') }}</h3>
        <p>{{ t('settings.auto_scan.clear_history_desc') }}</p>
        <p color="light:$red-4 dark:$red-6">
          {{ t('settings.auto_scan.clear_history_warning') }}
        </p>
        <div m="t-20px b-5px" flex="~ row-reverse" gap="10px">
          <JeButton order-2 @click="deleteScanData">
            {{ t('settings.auto_scan.confirm') }}
          </JeButton>
          <JeButton type="secondary" order-1 @click="showDialog = false">
            {{ t('settings.auto_scan.cancel') }}
          </JeButton>
        </div>
      </JePopup>
    </div>
  </div>
</template>
