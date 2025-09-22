<script lang="ts" setup>
import type { JeDropdownOptionProps } from 'jetv-ui'
import {
  JeButton,
  JeCheckbox,
  JeFileInputField,
  JeFrame,
  JeInputField,
  JeLine,
  JePopup,
  JeRadio,
  JeSlimButton,
  JeTabPane,
  JeTabs,
  JeToolbarDropdown,
  JeTransparentButton,
} from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import SettingsGroup from '~/components/SettingsGroup.vue'
import { codeEditors } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'

const settings = useSettingsStore()
const { t } = useI18n()

const tabActive = ref<'filesystem' | 'ide'>('filesystem')

// ==================== file system ====================
const rootsEnabled = computed({
  get: () => settings.scanner.rootsEnabled,
  set: (v: boolean) => { settings.scanner.rootsEnabled = v },
})
const projectRoots = computed(() => settings.scanner.roots)

async function openFolder() {
  const selectedPaths = await window.api.openFolderDialog()
  if (selectedPaths.length > 0) {
    const uniqueRoots = Array.from(new Set([...(settings.scanner.roots || []), ...selectedPaths])).sort()
    settings.scanner.roots.splice(0, settings.scanner.roots.length, ...uniqueRoots)
  }
}

function removeRoot(root: string) {
  const index = settings.scanner.roots.indexOf(root)
  if (index !== -1) {
    settings.scanner.roots.splice(index, 1)
  }
}

// ==================== ide ====================
const ideEnabled = computed({
  get: () => settings.scanner.ideEnabled,
  set: (v: boolean) => { settings.scanner.ideEnabled = v },
})
const ideJbEnabled = computed({
  get: () => settings.scanner.jetbrains.enabled,
  set: (v: boolean) => { settings.scanner.jetbrains.enabled = v },
})
const ideVscEnabled = computed({
  get: () => settings.scanner.vscode.enabled,
  set: (v: boolean) => { settings.scanner.vscode.enabled = v },
})
const ideVsEnabled = computed({
  get: () => settings.scanner.visualStudio.enabled,
  set: (v: boolean) => { settings.scanner.visualStudio.enabled = v },
})
const jetbrainsConfigPath = computed({
  get: () => settings.scanner.jetbrains.configRootPath,
  set: (v: string) => { settings.scanner.jetbrains.configRootPath = v },
})
const vscConfigPath = computed({
  get: () => settings.scanner.vscode.stateDbPath,
  set: (v: string) => { settings.scanner.vscode.stateDbPath = v },
})

async function handleDetectJbPath() {
  const detectedPath = await window.api.detectJetBrainsConfigRootPath()
  if (detectedPath) {
    settings.scanner.jetbrains.configRootPath = detectedPath
  }
}

async function handleDetectVscPath() {
  const detectedPath = await window.api.detectVscodeStateDbPath()
  if (detectedPath) {
    settings.scanner.vscode.stateDbPath = detectedPath
  }
}

// ==================== 导入策略 ====================
const defaultOpenMode = computed({
  get: () => settings.scanner.openMode,
  set: (v: 'auto' | 'specified') => { settings.scanner.openMode = v },
})
const editorOptions: JeDropdownOptionProps[] = Object.entries(codeEditors).map(([value, editor]) => ({
  value,
  label: editor.label,
}))

// ==================== Clean dialog ====================
const showDialog = ref<boolean>(false)

function deleteScanData() {
  window.api.deleteData('projectScanner')
  showDialog.value = false
}
</script>

<template>
  <div
    flex="~ col" gap="15px"
    p="10px"
  >
    <h3 text="h2">
      {{ t('settings.auto_scan.title') }}
    </h3>

    <SettingsGroup title="导入方式">
      <div text="secondary">
        启动后将从以下方式中自动扫描并导入项目。
      </div>

      <JeTabs v-model="tabActive">
        <JeTabPane value="filesystem" label="从文件系统目录中导入">
          <div flex="~ col items-start" gap="8px" text="default">
            <JeCheckbox v-model="rootsEnabled">
              启用从文件系统目录中导入
            </JeCheckbox>

            <div settings-section flex="~ col" gap="8px" w="full" box-border>
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
                <TransitionGroup name="list" tag="div">
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
                </TransitionGroup>
              </JeFrame>
            </div>
          </div>
        </JeTabPane>

        <JeTabPane value="ide" label="从 IDE 中导入">
          <div flex="~ col items-start" gap="8px" text="default">
            <JeCheckbox v-model="ideEnabled">
              启用从 IDE 中导入
            </JeCheckbox>

            <div settings-section flex="~ col" gap="8px" w-full box-border>
              <!-- Jetbrains -->
              <div flex="~ col items-start" gap="5px">
                <JeCheckbox v-model="ideJbEnabled" :disabled="!ideEnabled">
                  <div m="l-5px" flex="~ row items-center" gap="3px">
                    <span class="i-custom:jetbrains" />
                    Jetbrains IDEs：
                  </div>
                </JeCheckbox>

                <div
                  settings-section m="l-25px" w="[calc(100%-25px)]" box-border
                  flex="~ col items-start" gap="5px"
                >
                  <div lh="26px">
                    JetBrains IDE 配置根路径：
                  </div>
                  <div settings-section flex="~ col" gap="8px" w-full box-border>
                    <div flex="~ row items-center" gap="8px">
                      <JeFileInputField
                        v-model="jetbrainsConfigPath"
                        mode="folder"
                        :disabled="!ideEnabled || !ideJbEnabled"
                        dialog-title="选择 JetBrains IDE 配置根目录"
                        grow max-w="500px"
                      />
                      <JeSlimButton
                        type="alt"
                        :disabled="!ideEnabled || !ideJbEnabled"
                        @click="handleDetectJbPath"
                      >
                        自动检测
                      </JeSlimButton>
                    </div>

                    <div flex="~ col" gap="5px" text="secondary medium">
                      <div>
                        请选择 JetBrains IDE 配置根目录，通常在：
                      </div>
                      <div
                        p="l-10px"
                        grid="~ cols-[auto_1fr] items-start" gap="x-3px y-5px"
                        break-all
                      >
                        <span>Windows：</span>
                        <span>C:\Users\&lt;用户名&gt;\AppData\Roaming\JetBrains</span>
                        <span>macOS：</span>
                        <span>~/Library/Application Support/JetBrains</span>
                        <span>Linux：</span>
                        <span>~/.config/JetBrains 或 ~/.JetBrains</span>
                      </div>
                      <div>
                        包含 IntelliJ IDEA、PyCharm、WebStorm 等 IDE 配置。
                      </div>
                      <div>
                        该路径下的各个版本 IDE 配置目录均会被扫描。
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- VS Code -->
              <div flex="~ col items-start" gap="5px">
                <JeCheckbox v-model="ideVscEnabled" :disabled="!ideEnabled">
                  <div m="l-5px" flex="~ row items-center" gap="3px">
                    <span class="i-custom:visual-studio-code" />
                    Visual Studio Code：
                  </div>
                </JeCheckbox>

                <div
                  settings-section m="l-25px" w="[calc(100%-25px)]" box-border
                  flex="~ col items-start" gap="5px"
                >
                  <div lh="26px">
                    VS Code recent projects 文件：
                  </div>
                  <div settings-section flex="~ col" gap="8px" w-full box-border>
                    <div flex="~ row items-center" gap="8px">
                      <JeFileInputField
                        v-model="vscConfigPath"
                        mode="file"
                        dialog-title="选择 VS Code recent projects 文件"
                        :file-types="[{
                          name: 'VS Code Database',
                          extensions: ['vscdb'], // 只允许选择 .vscdb 文件
                        }]"
                        :disabled="!ideEnabled || !ideVscEnabled"
                        grow max-w="500px"
                      />
                      <JeSlimButton
                        type="alt"
                        :disabled="!ideEnabled || !ideVscEnabled"
                        @click="handleDetectVscPath"
                      >
                        自动检测
                      </JeSlimButton>
                    </div>

                    <div flex="~ col" gap="5px" text="secondary medium">
                      <div>
                        请选择 VS Code 的 state.vscdb 文件，通常在：
                      </div>
                      <div
                        p="l-10px"
                        grid="~ cols-[auto_1fr] items-start" gap="x-3px y-5px"
                        break-all
                      >
                        <span>Windows：</span>
                        <span>C:\Users\&lt;用户名&gt;\AppData\Roaming\Code\User\globalStorage\state.vscdb</span>
                        <span>macOS：</span>
                        <span>~/Library/Application Support/Code/User/globalStorage/state.vscdb</span>
                        <span>Linux：</span>
                        <span>~/.config/Code/User/globalStorage/state.vscdb</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- VS -->
              <div flex="~ col items-start" gap="5px">
                <JeCheckbox
                  v-model="ideVsEnabled"
                  class="ide-vs-checkbox"
                  disabled text="secondary" cursor-not-allowed
                >
                  <div m="l-5px" flex="~ row items-center" gap="3px">
                    <span class="i-custom:visual-studio" />
                    Visual Studio：
                  </div>
                </JeCheckbox>

                <div
                  settings-section m="l-25px" w="[calc(100%-25px)]" box-border
                  flex="~ col items-start" gap="5px"
                >
                  <div lh="26px" text="secondary">
                    暂不支持
                  </div>
                </div>
              </div>
            </div>
          </div>
        </JeTabPane>
      </JeTabs>
    </SettingsGroup>

    <SettingsGroup title="导入策略">
      <div self-start text="default">
        {{ t('settings.auto_scan.default_open_mode') }}:
      </div>
      <div settings-section flex="~ col items-start" gap="3px">
        <JeRadio v-model="defaultOpenMode" value="auto">
          {{ t('settings.auto_scan.auto_select_program') }}
        </JeRadio>
        <JeRadio v-model="defaultOpenMode" value="specified">
          <div flex="~ items-center">
            {{ t('settings.auto_scan.always_use_custom_program') }}
            <JeToolbarDropdown
              v-model="settings.scanner.editor"
              label=""
              :options="editorOptions"
              :disabled="defaultOpenMode !== 'specified'"
            />
          </div>
        </JeRadio>
      </div>

      <div flex="~ row items-center" gap="5px">
        <div text="default">
          {{ t('settings.auto_scan.temp_project_name_rule') }}:
        </div>

        <JeInputField v-model="settings.scanner.namePattern" spellcheck="false" w="250px" />
      </div>
    </SettingsGroup>

    <div flex="~ row items-center">
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

<style lang="scss" scoped>
.ide-vs-checkbox :deep(.je-checkbox__input) {
  @apply cursor-not-allowed;
}
</style>
