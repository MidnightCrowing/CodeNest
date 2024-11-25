<script lang="ts" setup>
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CodeEditorOption } from '~/constants/codeEditor'
import { codeEditors, languageToEditorMap } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { View } from '~/constants/viewEnums'
import { addProjectItem } from '~/core/main'
import type { JeComboboxOptionProps, JeDropdownOptionGroupProps, JeDropdownOptionProps } from '~/jetv-ui'
import { JeButton, JeCombobox, JeDropdown, JeFileInputField, JeFrame, JeInputField, JeLink, JeSegmentedControl } from '~/jetv-ui'
import ForkAndCloneComponent from '~/views/NewProject/components/KindComponent/ForkAndCloneComponent.vue'
import MineComponent from '~/views/NewProject/components/KindComponent/MineComponent.vue'

import ConfigItem from './components/common/ConfigItem.vue'
import ConfigItemTitle from './components/common/ConfigItemTitle.vue'
import type { LinguistLanguageResult, LinguistResult } from './types'

const { t } = useI18n()

// ==================== localProjectItem ====================
const localProjectItem: Ref<LocalProject> = ref({
  license: 'None',
})

// ==================== ProjectInfo ====================
const projectPathInputValidated = ref(false)
const projectNameInputValidated = ref(false)
const repositoryFolderName = ref('')

function fillProjectName() {
  localProjectItem.value.name = repositoryFolderName.value
}

// ==================== KindButtons ====================
const kindButtons: { label: string, value: ProjectKind }[] = [
  { label: 'Mine', value: ProjectKind.MINE },
  { label: 'Fork', value: ProjectKind.FORK },
  { label: 'Clone', value: ProjectKind.CLONE },
]
const kindSelected: Ref<ProjectKind> = ref(ProjectKind.MINE)
const kindComponents: Partial<Record<ProjectKind, ReturnType<typeof defineAsyncComponent>>> = {
  [ProjectKind.MINE]: MineComponent,
  [ProjectKind.FORK]: ForkAndCloneComponent,
  [ProjectKind.CLONE]: ForkAndCloneComponent,
}

function updateProjectKind(newKind: ProjectKind) {
  localProjectItem.value.kind = newKind
}

function updateProjectFromUrl(newKind: string) {
  localProjectItem.value.fromUrl = newKind
}

function updateProjectFromName(newKind: string) {
  localProjectItem.value.fromName = newKind
}

// ==================== Language ====================
const projectLangInputValidated = ref(false)
const mainLanguageOptions = ref<JeComboboxOptionProps[]>([])
const mainLanguageLoading = ref(false)

async function getLanguagesResult(folderPath: string) {
  const { languages } = await window.api.analyzeFolder(folderPath) as { languages: LinguistResult['languages'] }
  return languages.results
}

function sortByMainProgrammingLanguage(results: Record<string, LinguistLanguageResult>) {
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

function convertResultsToDropdownOptions(results: Record<string, LinguistLanguageResult>): (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] {
  return Object.entries(results).map(([key, value]) => ({
    value: key,
    label: key,
    description: t('new_project.main_lang_option_desc', { type: value.type, bytes: value.bytes, lines: value.lines.total }),
  }))
}

/**
 * 将 sortedResults 转换为 langGroup 格式
 * @param sortedResults - 排序后的语言统计结果
 * @returns {languagesGroupItem[] | null} - 转换后的语言分组
 */
function convertToLangGroup(sortedResults: Record<string, { type: string, bytes: number, color: string }>): languagesGroupItem[] | null {
  if (!sortedResults || Object.keys(sortedResults).length === 0) {
    return null // 如果没有数据，返回 null
  }

  // 计算总字节数
  const totalBytes = Object.values(sortedResults).reduce((sum, lang) => sum + lang.bytes, 0)

  // 将数据转换为 langGroup 格式
  return Object.entries(sortedResults).map(([lang, info]) => ({
    text: lang, // 语言名
    color: info.color, // 颜色
    percentage: Number.parseFloat(((info.bytes / totalBytes) * 100).toFixed(2)), // 百分比，保留两位小数
  }))
}

// ==================== DefaultOpen ====================
const projectDefaultOpenInputValidated = ref(false)
const defaultOpenLoading = ref(false)

// 将 CodeEditorOption 转换为 Dropdown 可接受的 options
function transformCodeEditorOptionsToDropdownOptions(codeEditorOptions: CodeEditorOption[]): (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] {
  const groupedOptions = new Map<string, JeDropdownOptionProps[]>()

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

// ==================== License ====================

// 定义常用的 License
const commonLicenses: LicenseEnum[] = [LicenseEnum.MIT, LicenseEnum.GPLV3]

/**
 * 将 License 枚举转换为 JeDropdownOptionProps 列表
 * 常用的 License 放在前面，不常用的归类到分组中
 * @param license - LicenseEnum 枚举
 * @returns {JeDropdownOptionProps[]} 转换后的菜单选项数组
 */
function convertLicensesToDropdownOptions(license: LicenseEnum): JeDropdownOptionProps[] {
  const commonOptions: JeDropdownOptionProps[] = []
  const otherOptions: JeDropdownOptionProps[] = []

  Object.entries(license).forEach(([, value]) => {
    const option = {
      value,
      label: value,
      icon: 'light:i-custom:license dark:i-custom:license-dark',
    }

    if (commonLicenses.includes(value as LicenseEnum)) {
      commonOptions.push(option)
    }
    else {
      otherOptions.push(option)
    }
  })

  // 返回带分组的选项数组
  return [
    {
      value: 'None',
      label: '<None>',
    },
    ...commonOptions,
    {
      value: 'other',
      groupLabel: '其他许可证',
      options: otherOptions,
      isExpand: false,
    },
  ]
}

// ==================== Others ====================
function cleanConfigValue() {
  localProjectItem.value.mainLang = null
  mainLanguageOptions.value = []
  localProjectItem.value.defaultOpen = null
}

watch(() => localProjectItem.value.path, async (newValue) => {
  if (newValue === null) {
    return
  }

  // 清空设置项
  cleanConfigValue()

  // 提取路径的最后一个文件夹名称
  const parts = newValue.split(/[\\/]/)
  repositoryFolderName.value = parts[parts.length - 1] || ''

  if (newValue) {
    mainLanguageLoading.value = true
    defaultOpenLoading.value = true

    // 获取项目编程语言分析结果
    let results = {}
    try {
      results = await getLanguagesResult(newValue)
    }
    catch (error) {
      console.error('获取编程语言分析结果失败:', error)
    }
    finally {
      const sortedResults = sortByMainProgrammingLanguage(results) // 排序
      mainLanguageOptions.value = convertResultsToDropdownOptions(sortedResults) // 转换成 JeDropdown 所需的格式

      // 保存主要编程语言和语言分组
      localProjectItem.value.mainLang = mainLanguageOptions.value.length > 0
        ? (mainLanguageOptions.value[0].value as string) // 自动设置选中的值为第一个选项
        : null
      localProjectItem.value.langGroup = convertToLangGroup(sortedResults)
    }

    mainLanguageLoading.value = false
    defaultOpenLoading.value = false
  }
})

watch(() => localProjectItem.value.mainLang, (newValue) => {
  localProjectItem.value.defaultOpen = newValue
    ? languageToEditorMap[newValue] || null
    : null
})

watch(kindSelected, (newValue) => {
  localProjectItem.value.kind = newValue
})

// ==================== Bottom Menu ====================
const activatedView = inject('activatedView') as Ref<View>

function changeView() {
  if (activatedView)
    activatedView.value = View.Home
}

function addNewProject() {
  const validations = [
    { field: localProjectItem.value.path, validated: projectPathInputValidated },
    { field: localProjectItem.value.name, validated: projectNameInputValidated },
    { field: localProjectItem.value.mainLang, validated: projectLangInputValidated },
    { field: localProjectItem.value.defaultOpen, validated: projectDefaultOpenInputValidated },
  ]

  const hasError = validations.some(({ field, validated }) => {
    validated.value = !field
    return !field
  })

  if (!hasError) {
    addProjectItem(localProjectItem.value)
    changeView()
  }
}
</script>

<template>
  <JeFrame
    size-full
    bg="theme-panel-bgDialog"
    flex="~ col"
  >
    <JeFrame
      type="secondary"
      grow flex="~ col" gap="y-15px"
      overflow-auto scrollbar-default
    >
      <!-- ProjectInfo -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.directory" />
        <JeFileInputField
          v-model="localProjectItem.path"
          :validated="projectPathInputValidated"
          grow
        />
        <ConfigItemTitle title="new_project.name" />
        <JeInputField
          v-model="localProjectItem.name"
          :validated="projectNameInputValidated"
          spellcheck="false" w="200px"
        />

        <div
          v-if="repositoryFolderName && localProjectItem.name !== repositoryFolderName"
          col-start="2" flex gap="2px"
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
          <Component
            :is="kindComponents[kindSelected]"
            :local-project-item="localProjectItem"
            @update:project-kind="updateProjectKind"
            @update:project-from-url="updateProjectFromUrl"
            @update:project-from-name="updateProjectFromName"
          />
        </KeepAlive>
      </ConfigItem>

      <!-- MainLanguage -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.main_lang_project" />
        <JeCombobox
          v-model="localProjectItem.mainLang"
          :validated="projectLangInputValidated"
          :options="mainLanguageOptions"
          :loading="mainLanguageLoading"
        />
      </ConfigItem>

      <!-- DefaultOpen -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.default_opening_method" />
        <JeDropdown
          v-model="localProjectItem.defaultOpen"
          :validated="projectDefaultOpenInputValidated"
          :options="transformCodeEditorOptionsToDropdownOptions(codeEditors)"
          :loading="defaultOpenLoading"
        />
      </ConfigItem>

      <!-- License -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.license" />
        <JeDropdown
          v-model="localProjectItem.license"
          :options="convertLicensesToDropdownOptions(LicenseEnum)"
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
      <JeButton @click="addNewProject">
        添加
      </JeButton>
    </JeFrame>
  </JeFrame>
</template>

<style lang="scss" scoped>
.cancel-button.je-button--secondary {
  @apply light:bg-$gray-14 dark:bg-$gray-2;
  @apply dark:bg-$gray-2 dark:hover:bg-$gray-3;
}
</style>
