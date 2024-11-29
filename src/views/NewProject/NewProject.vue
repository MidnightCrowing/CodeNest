<script lang="ts" setup>
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ViewEnum } from '~/constants/appEnums'
import type { CodeEditorEnum, CodeEditorOption } from '~/constants/codeEditor'
import { codeEditors, languageToEditorMap } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { LanguageAnalyzer, projectManager } from '~/core/main'
import type { JeComboboxOptionProps, JeDropdownOptionGroupProps, JeDropdownOptionProps } from '~/jetv-ui'
import { JeButton, JeCombobox, JeDropdown, JeFileInputField, JeFrame, JeInputField, JeLink, JeSegmentedControl } from '~/jetv-ui'
import ForkAndCloneComponent from '~/views/NewProject/components/KindComponent/ForkAndCloneComponent.vue'
import MineComponent from '~/views/NewProject/components/KindComponent/MineComponent.vue'

import ConfigItem from './components/common/ConfigItem.vue'
import ConfigItemTitle from './components/common/ConfigItemTitle.vue'

const { t } = useI18n()

// ==================== localProjectItem ====================
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
}
export type NullableLocalProject = Nullable<Omit<LocalProject, 'license'>> & {
  license: LicenseEnum | string
}

const localProjectItem: Ref<NullableLocalProject> = ref({
  appendTime: null,
  path: null,
  name: null,
  kind: ProjectKind.MINE,
  mainLang: null,
  langGroup: null,
  defaultOpen: null,
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
const isTestProject = ref(false)

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

// ==================== DefaultOpen ====================
const projectDefaultOpenInputValidated = ref(false)
const defaultOpenLoading = ref(false)

// 将 CodeEditorOption 转换为 Dropdown 可接受的 options
function transformCodeEditorOptionsToDropdownOptions(
  codeEditorOptions: Record<CodeEditorEnum, CodeEditorOption>,
): (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] {
  const groupedOptions = new Map<string, JeDropdownOptionProps[]>()

  // 遍历所有 CodeEditorOption
  Object.entries(codeEditorOptions).forEach(([value, { label, icon, description, group }]) => {
    const key = group || 'default'
    if (!groupedOptions.has(key)) {
      groupedOptions.set(key, [])
    }
    groupedOptions.get(key)!.push({ value, label, icon, description })
  })

  // 构造结果
  const dropdownOptions: (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] = []
  groupedOptions.forEach((options, group) => {
    if (group === 'default') {
      dropdownOptions.push(...options) // 未分组直接加入结果
    }
    else {
      dropdownOptions.push({ value: group, groupLabel: group, options }) // 分组的生成 OptionGroup
    }
  })

  return dropdownOptions
}

// ==================== License ====================

// 定义常用的 License
const commonLicenses: LicenseEnum[] = [LicenseEnum.MIT, LicenseEnum.GPLV3]

/**
 * 将 License 枚举转换为 JeDropdownOptionProps 列表
 * 常用的 License 放在前面，不常用的归类到分组中
 * @param licenseEnum - LicenseEnum 枚举
 * @returns {(JeDropdownOptionProps | JeDropdownOptionGroupProps)[]} 转换后的菜单选项数组
 */
function convertLicensesToDropdownOptions(licenseEnum: typeof LicenseEnum): (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] {
  const commonOptions: JeDropdownOptionProps[] = []
  const otherOptions: JeDropdownOptionProps[] = []

  Object.entries(licenseEnum).forEach(([, value]) => {
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
      groupLabel: t('new_project.license_other'),
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
    const analyzer = new LanguageAnalyzer(newValue)
    analyzer.analyze()
      .then((success) => {
        if (success) {
          mainLanguageOptions.value = analyzer.mainLanguageOptions
          localProjectItem.value.mainLang = analyzer.mainLang
          localProjectItem.value.mainLangColor = analyzer.mainLangColor
          localProjectItem.value.langGroup = analyzer.langGroup
        }
        else {
        // eslint-disable-next-line no-console
          console.log('No language data found or analysis failed.')
        }
      })
      .catch((error) => {
        console.error('Analysis error:', error)
      })
      .finally(() => {
        mainLanguageLoading.value = false
        defaultOpenLoading.value = false
      })
  }
})

watch(() => localProjectItem.value.mainLang, (newValue) => {
  // 查找匹配的语言组项
  const languageItem = localProjectItem.value.langGroup?.find(item => item.text === newValue)
  localProjectItem.value.mainLangColor = languageItem?.color || null

  // 查找匹配的默认打开项
  localProjectItem.value.defaultOpen = newValue
    ? languageToEditorMap[newValue] || null
    : null
})

// ==================== Bottom Menu ====================
const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeHomeView() {
  if (activatedView)
    activatedView.value = ViewEnum.Home
}

function addNewProject() {
  // 验证输入项
  const validations = [
    { field: localProjectItem.value.path, validated: projectPathInputValidated },
    { field: localProjectItem.value.name, validated: projectNameInputValidated },
    { field: localProjectItem.value.mainLang, validated: projectLangInputValidated },
    { field: localProjectItem.value.defaultOpen, validated: projectDefaultOpenInputValidated },
  ]

  if (validations.reduce((errorFound, { field, validated }) => {
    const isInvalid = !field
    validated.value = isInvalid
    return errorFound || isInvalid
  }, false)) {
    return
  }

  // 添加项目
  projectManager.addProject({
    appendTime: Date.now(), // 添加创建时间
    path: localProjectItem.value.path,
    name: localProjectItem.value.name,
    kind: (kindSelected.value === ProjectKind.MINE && isTestProject.value)
      ? ProjectKind.TEST
      : kindSelected.value,
    mainLang: localProjectItem.value.mainLang,
    mainLangColor: localProjectItem.value.mainLangColor,
    langGroup: localProjectItem.value.langGroup,
    defaultOpen: localProjectItem.value.defaultOpen,
    // 根据条件动态添加 fromUrl 和 fromName
    ...(localProjectItem.value.kind === (ProjectKind.FORK || ProjectKind.CLONE)
      ? {
          fromUrl: localProjectItem.value.fromUrl,
          fromName: localProjectItem.value.fromName,
        }
      : {}),
    // 如果 license 不为 None，则包含 license 属性
    ...(localProjectItem.value.license !== 'None'
      ? { license: localProjectItem.value.license }
      : {}),
  } as LocalProject)

  // 返回主页
  changeHomeView()
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
          :validated-tooltip="t('new_project.path_tooltip')"
          grow
        />
        <ConfigItemTitle title="new_project.name" />
        <JeInputField
          v-model="localProjectItem.name"
          :validated="projectNameInputValidated"
          :validated-tooltip="t('new_project.name_tooltip')"
          spellcheck="false" w="200px"
        />

        <div
          v-if="repositoryFolderName && localProjectItem.name !== repositoryFolderName"
          col-start="2" flex gap="2px"
          overflow-hidden
        >
          <span text="secondary" truncate>{{ repositoryFolderName }}</span>
          <JeLink :on-click="fillProjectName">
            {{ t('new_project.kind.fill') }}
          </JeLink>
        </div>
      </ConfigItem>

      <!-- KindButtons -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.kind.source" />
        <JeSegmentedControl
          v-model="kindSelected"
          :labels="kindButtons"
        />

        <KeepAlive>
          <Component
            :is="kindComponents[kindSelected]"
            v-model:is-test-project="isTestProject"
            :local-project-item="localProjectItem"
            @update:project-from-url="updateProjectFromUrl"
            @update:project-from-name="updateProjectFromName"
          />
        </KeepAlive>
      </ConfigItem>

      <!-- MainLanguage -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.main_lang" />
        <JeCombobox
          v-model="localProjectItem.mainLang"
          :options="mainLanguageOptions"
          :loading="mainLanguageLoading"
          :validated="projectLangInputValidated"
          :validated-tooltip="t('new_project.lang_tooltip')"
        />
      </ConfigItem>

      <!-- DefaultOpen -->
      <ConfigItem>
        <ConfigItemTitle title="new_project.open_method" />
        <JeDropdown
          v-model="localProjectItem.defaultOpen"
          :options="transformCodeEditorOptionsToDropdownOptions(codeEditors)"
          :loading="defaultOpenLoading"
          :validated="projectDefaultOpenInputValidated"
          :validated-tooltip="t('new_project.open_tooltip')"
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
      <JeButton
        order-2
        @click="addNewProject"
      >
        {{ t('new_project.create') }}
      </JeButton>
      <JeButton
        class="cancel-button" type="secondary"
        order-1
        @click="changeHomeView"
      >
        {{ t('new_project.cancel') }}
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
