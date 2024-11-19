<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { CodeEditorOption } from '~/constants/codeEditor'
import { codeEditors, languageToEditorMap } from '~/constants/codeEditor'
import { ProjectKind } from '~/constants/projectKind'
import type { JeDropdownOption, JeDropdownOptionGroup } from '~/jetv-ui'
import { JeButton, JeDropdown, JeFileInputField, JeFrame, JeInputField, JeLink, JeSegmentedControl } from '~/jetv-ui'

import ConfigItem from './components/common/ConfigItem.vue'
import ConfigItemTitle from './components/common/ConfigItemTitle.vue'
import ForkAndCloneComponent from './components/KindComponent/ForkAndCloneComponent.vue'
import MineComponent from './components/KindComponent/MineComponent.vue'
import type { LanguageResult, LinguistResult } from './types'

const { t } = useI18n()

const view = inject('view') as Ref<string>

function changeView() {
  if (view)
    view.value = 'home'
}

/** ConfigValues */
const pathInputValue = ref('')
const nameInputValue = ref('')
const KindButtonsSelectedValue = ref('')
const mainLangSelectedValue = ref('')
const defaultOpenSelectedValue = ref('')

/** ProjectInfo */
const repositoryFolderName = ref('')

function fillProjectName() {
  nameInputValue.value = repositoryFolderName.value
}

/** KindButtons */
const kindButtons: { label: string, value: ProjectKind }[] = [
  { label: 'Mine', value: ProjectKind.MINE },
  { label: 'Fork', value: ProjectKind.FORK },
  { label: 'Clone', value: ProjectKind.CLONE },
]
const kindSelected: Ref<ProjectKind> = ref(ProjectKind.MINE)

const currentComponent = computed(() => {
  switch (kindSelected.value) {
    case ProjectKind.MINE:
      return MineComponent
    case ProjectKind.FORK:
    case ProjectKind.CLONE:
      return ForkAndCloneComponent
    default:
      return null
  }
})

/** MainLanguage */
const mainLanguageOptions = ref<(JeDropdownOption | JeDropdownOptionGroup)[]>([])

async function getLanguagesResult(folderPath: string) {
  const { languages } = await window.api.analyzeFolder(folderPath) as { languages: LinguistResult['languages'] }
  return languages.results
}

function sortByMainProgrammingLanguage(results: Record<string, LanguageResult>) {
  const typePriority = { programming: 1, markup: 2, data: 3, prose: 4 }

  const sortedEntries = Object.entries(results).sort(([keyA, valueA], [keyB, valueB]) => {
    // 按类型优先级排序
    const priorityA = typePriority[valueA.type] || 5
    const priorityB = typePriority[valueB.type] || 5
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // 按字节数排序
    if (valueA.bytes !== valueB.bytes) {
      return valueB.bytes - valueA.bytes
    }

    // 按语言名排序（字母顺序）
    return keyA.localeCompare(keyB)
  })

  return Object.fromEntries(sortedEntries)
}

function convertResultsToDropdownOptions(results: Record<string, LanguageResult>): (JeDropdownOption | JeDropdownOptionGroup)[] {
  return Object.entries(results).map(([key, value]) => ({
    value: key,
    label: key,
    description: t('new_project.main_lang_option_desc', { type: value.type, bytes: value.bytes, lines: value.lines.total }),
  }))
}

/** DefaultOpen */
// 将 CodeEditorOption 转换为 Dropdown 可接受的 options
function transformCodeEditorOptionsToDropdownOptions(codeEditorOptions: CodeEditorOption[]): (JeDropdownOption | JeDropdownOptionGroup)[] {
  const groupedOptions = new Map<string, JeDropdownOption[]>()

  // 按照 group 分类 CodeEditorOption
  for (const { value, label, icon, description, group } of codeEditorOptions) {
    const key = group || 'default'
    if (!groupedOptions.has(key)) {
      groupedOptions.set(key, [])
    }
    groupedOptions.get(key)!.push({ value, label, icon, description })
  }

  // 构造结果：未分组的为单独项，有分组的归为 OptionGroup
  return Array.from(groupedOptions, ([group, options]) =>
    group === 'default'
      ? options // 未分组，直接加入结果
      : { value: group, groupLabel: group, options }).flat()
}

/** Others */
const loading = ref(false)

function cleanConfigValue() {
  mainLangSelectedValue.value = ''
  mainLanguageOptions.value = []
  defaultOpenSelectedValue.value = ''
}

watch(pathInputValue, async (newValue) => {
  // 清空设置项
  cleanConfigValue()

  // 提取路径的最后一个文件夹名称
  const parts = newValue.split(/[\\/]/)
  repositoryFolderName.value = parts[parts.length - 1] || ''

  if (newValue) {
    loading.value = true

    // 获取项目编程语言分析结果
    let results = { }
    try {
      results = await getLanguagesResult(newValue)
    }
    catch (error) {
      console.error('获取编程语言分析结果失败:', error)
    }
    finally {
      const sortedResults = sortByMainProgrammingLanguage(results) // 排序
      mainLanguageOptions.value = convertResultsToDropdownOptions(sortedResults)// 转换成 JeDropdown 所需的格式
      // 自动设置选中的值为第一个选项
      if (mainLanguageOptions.value.length > 0) {
        mainLangSelectedValue.value = mainLanguageOptions.value[0].value as string
      }

      // 获取默认打开方式
      if (mainLangSelectedValue.value) {
        defaultOpenSelectedValue.value = languageToEditorMap[mainLangSelectedValue.value] || ''
      }
    }

    loading.value = false
  }
})
</script>

<template>
  <JeFrame
    size-full
    bg="theme-panel-bgDialog"
    flex="~ col"
  >
    <JeFrame
      type="secondary"
      grow
      flex="~ col" gap="y-15px"
      overflow-auto scrollbar-default
    >
      <!-- ProjectInfo -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.directory" />
        <JeFileInputField v-model="pathInputValue" grow />
        <ConfigItemTitle title="new_project.name" />
        <JeInputField v-model="nameInputValue" spellcheck="false" w="200px" />

        <div
          v-if="repositoryFolderName && nameInputValue !== repositoryFolderName"
          col-start="2"
          flex gap="2px"
          overflow-hidden
        >
          <span text="secondary" truncate>{{ repositoryFolderName }}</span>
          <JeLink :on-click="fillProjectName">
            {{ t('new_project.kind_component.fill_in') }}
          </JeLink>
        </div>
      </ConfigItem>

      <!-- KindButtons -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.kind_component.project_source" />
        <JeSegmentedControl
          v-model="kindSelected"
          :labels="kindButtons"
        />

        <KeepAlive>
          <component
            :is="currentComponent"
            v-model:value="KindButtonsSelectedValue"
          />
        </KeepAlive>
      </ConfigItem>

      <!-- MainLanguage -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.main_lang_project" />
        <JeDropdown
          v-model="mainLangSelectedValue"
          :options="mainLanguageOptions"
          :loading="loading"
        />
      </ConfigItem>

      <!-- DefaultOpen -->
      <ConfigItem>
        <!-- 配置项标题 -->
        <ConfigItemTitle title="new_project.default_opening_method" />
        <!-- 下拉菜单组件 -->
        <JeDropdown
          v-model="defaultOpenSelectedValue"
          :options="transformCodeEditorOptionsToDropdownOptions(codeEditors)"
          :loading="loading"
        />
      </ConfigItem>
    </JeFrame>

    <JeFrame
      type="secondary"
      b-t="solid 2px light:$gray-12 dark:$gray-3" p="8px"
      flex="~ row-reverse" gap="8px"
    >
      <JeButton class="cancel-button" type="secondary" @click="changeView">
        取消
      </JeButton>
      <JeButton>添加</JeButton>
    </JeFrame>
  </JeFrame>
</template>

<style lang="scss" scoped>
.cancel-button.je-button.secondary {
  // light
  @apply light:bg-$gray-14 dark:bg-$gray-2;

  // dark
  @apply dark:bg-$gray-2 dark:hover:bg-$gray-3;
}
</style>
