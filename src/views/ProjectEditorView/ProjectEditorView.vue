<script lang="ts" setup>
import type {
  JeComboboxOptionProps,
  JeDropdownOptionGroupProps,
  JeDropdownOptionProps,
} from 'jetv-ui'
import {
  JeButton,
  JeCheckbox,
  JeCombobox,
  JeDropdown,
  JeFileInputField,
  JeFrame,
  JeInputField,
  JeLink,
  JeSegmentedControl,
} from 'jetv-ui'
import { useI18n } from 'vue-i18n'

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

import EditorItem from './components/EditorItem.vue'
import EditorTitle from './components/EditorTitle.vue'
import ForkAndCloneComponent from './components/ForkAndCloneComponent.vue'
import {
  initializeNewProjectState,
  isUpdateProject,
  localProjectItem,
} from './ProjectEditorViewProvider'

const { t } = useI18n()
const projectsStore = useProjectsStore()
const editorLangGroupsStore = useEditorLangGroupsStore()

// ==================== ProjectInfo ====================
const projectPathInputValidated = ref<boolean>(false)
const projectNameInputValidated = ref<boolean>(false)
const repositoryFolderName = ref<string>('')
const excludedPaths = isUpdateProject ? [localProjectItem.value.path || ''] : []
const groupOptions = ref<JeComboboxOptionProps[]>(
  projectsStore.allGroups.map(group => ({ label: group, value: group })),
)

function fillProjectName() {
  localProjectItem.value.name = repositoryFolderName.value
}

// ==================== KindButtons ====================
const kindButtonLabels = reactive([
  { label: t('home.side_panel.kinds.mine'), value: ProjectKind.MINE },
  { label: t('home.side_panel.kinds.fork'), value: ProjectKind.FORK },
  { label: t('home.side_panel.kinds.clone'), value: ProjectKind.CLONE },
])
const kindComponents: Partial<Record<ProjectKind, ReturnType<typeof defineAsyncComponent>>> = {
  [ProjectKind.FORK]: ForkAndCloneComponent,
  [ProjectKind.CLONE]: ForkAndCloneComponent,
}

// ==================== Language ====================
const projectLangInputValidated = ref(false)
const mainLanguageOptions = ref<JeComboboxOptionProps[]>([])
const mainLanguageLoading = ref(false)

// 获取下拉选项
async function fetchLanguageOptions(path: string) {
  if (!path)
    return

  mainLanguageLoading.value = true
  try {
    const analyzer = new LanguageAnalyzer(path)
    const success = await analyzer.analyze()

    if (success) {
      mainLanguageOptions.value = analyzer.mainLanguageOptions
    }
  }
  catch (error) {
    console.error('Analysis error:', error)
  }
  finally {
    mainLanguageLoading.value = false
  }
}

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

// 常用的 License
const commonLicenses: LicenseEnum[] = [LicenseEnum.MIT, LicenseEnum.GPLV3]

/**
 * 将 License 枚举转换为 JeDropdownOptionProps 列表
 * 常用的 License 放在前面，不常用的归类到分组中
 * @param licenseEnums - LicenseEnum 枚举
 * @returns {(JeDropdownOptionProps | JeDropdownOptionGroupProps)[]} 转换后的菜单选项数组
 */
function convertLicensesToDropdownOptions(
  licenseEnums: typeof LicenseEnum,
): (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] {
  const commonOptions: JeDropdownOptionProps[] = []
  const otherOptions: JeDropdownOptionProps[] = []

  Object.entries(licenseEnums)
    .filter(([, value]) => value !== LicenseEnum.NONE)
    .forEach(([, value]) => {
      const option = {
        value,
        label: value,
        icon: 'light:i-custom:license dark:i-custom:license-dark',
      }

      if (commonLicenses.includes(value)) {
        commonOptions.push(option)
      }
      else {
        otherOptions.push(option)
      }
    })

  // 返回带分组的选项数组
  return [
    {
      value: LicenseEnum.NONE,
      label: '<None>',
    },
    ...commonOptions,
    {
      value: 'other',
      groupLabel: t('project_config.license_other'),
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

async function analyzeAndSetLanguage(projectPath: string) {
  const analyzer = new LanguageAnalyzer(projectPath)
  try {
    const success = await analyzer.analyze()
    if (success) {
      mainLanguageOptions.value = analyzer.mainLanguageOptions
      localProjectItem.value.mainLang = analyzer.mainLang
      localProjectItem.value.mainLangColor = analyzer.mainLangColor
      localProjectItem.value.langGroup = analyzer.langGroup
    }
  }
  catch (error) {
    console.error('Analysis error:', error)
  }
}

async function analyzeAndSetLicense(projectPath: string) {
  const currentLicense = localProjectItem.value.license

  // 仅当未选择或为 NONE 时自动填充
  if (currentLicense && currentLicense !== LicenseEnum.NONE)
    return

  try {
    const res = await window.api.readProjectLicense(projectPath)
    if (!res?.success || !res.snippet)
      return

    const { license, score } = detectLicenseBySnippet(res.snippet)
    if (license && score > 0) {
      localProjectItem.value.license = license
    }
  }
  catch (e) {
    console.error('License detect error:', e)
  }
}

onMounted(() => {
  if (localProjectItem.value.path) {
    fetchLanguageOptions(localProjectItem.value.path)
  }
})

watch(
  () => localProjectItem.value.path,
  async (newValue) => {
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

      await Promise.all([
        // 获取项目编程语言分析结果
        analyzeAndSetLanguage(newValue).finally(() => {
          mainLanguageLoading.value = false
          defaultOpenLoading.value = false
        }),

        // 获取许可证分析结果
        analyzeAndSetLicense(newValue),
      ])
    }
  },
)

watch(
  () => localProjectItem.value.mainLang,
  (newValue) => {
    // 查找匹配的语言组项
    const languageItem = localProjectItem.value.langGroup?.find(item => item.text === newValue)
    localProjectItem.value.mainLangColor = languageItem?.color || null

    // 查找匹配的默认打开项
    localProjectItem.value.defaultOpen = newValue
      ? editorLangGroupsStore.getEditorByLanguage(newValue)
      : null
  },
)

// ==================== Bottom Menu ====================
const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeHomeView() {
  initializeNewProjectState()

  if (activatedView)
    activatedView.value = ViewEnum.Home
}

// 公共的验证函数
function validateFields(): boolean {
  const validations = [
    { field: localProjectItem.value.path, validated: projectPathInputValidated },
    { field: localProjectItem.value.name, validated: projectNameInputValidated },
    { field: localProjectItem.value.mainLang, validated: projectLangInputValidated },
    { field: localProjectItem.value.defaultOpen, validated: projectDefaultOpenInputValidated },
  ]

  return validations.reduce((errorFound, { field, validated }) => {
    const isInvalid = !field
    validated.value = isInvalid
    return errorFound || isInvalid
  }, false)
}

// 公共的动态字段处理函数
function getDynamicFields(): Record<string, any> {
  return {
    // 根据条件动态添加 fromUrl 和 fromName
    ...(localProjectItem.value.kind === ProjectKind.FORK
      || localProjectItem.value.kind === ProjectKind.CLONE
      ? {
          fromUrl: localProjectItem.value.fromUrl,
          fromName: localProjectItem.value.fromName,
        }
      : {}),

    // 如果 license 不为 None，则包含 license 属性
    ...(localProjectItem.value.license !== LicenseEnum.NONE
      ? { license: localProjectItem.value.license }
      : {}),
  }
}

function addNewProject() {
  // 验证输入项
  if (validateFields()) {
    return
  }

  // 添加项目
  projectsStore.addProject(
    {
      ...localProjectItem.value,
      ...getDynamicFields(),
      appendTime: Date.now(), // 添加创建时间
    } as LocalProject,
    true,
  )

  // 返回主页
  changeHomeView()
}

function updateProject() {
  // 验证输入项
  if (validateFields()) {
    return
  }

  // 更新项目
  localProjectItem.value = {
    ...localProjectItem.value,
    ...getDynamicFields(),
  }
  projectsStore.updateProject(
    localProjectItem.value.appendTime as number,
    localProjectItem.value as LocalProject,
  )

  // 返回主页
  changeHomeView()
}
</script>

<template>
  <JeFrame size-full bg="theme-panel-bgDialog" flex="~ col">
    <JeFrame
      type="secondary" grow flex="~ col" gap="y-15px" overflow-auto
      scrollbar-default
    >
      <EditorItem>
        <!-- Directory -->
        <EditorTitle title="project_config.directory" />
        <JeFileInputField
          v-model="localProjectItem.path"
          :validated="projectPathInputValidated"
          :validated-tooltip="t('project_config.path_tooltip')"
          grow
        />

        <div
          v-if="
            localProjectItem.path
              && projectsStore.checkPathExistenceInProjects(localProjectItem.path, excludedPaths)
          "
          col-start="2"
          flex="~ items-center"
          gap="2px"
          color="light:$yellow-4 dark:$yellow-6"
        >
          <span i-jet="light:warning dark:warning-dark" />
          {{ t('project_config.path_in_list', { path: localProjectItem.path }) }}
        </div>

        <!-- Name -->
        <EditorTitle title="project_config.name" />
        <JeInputField
          v-model="localProjectItem.name"
          :validated="projectNameInputValidated"
          :validated-tooltip="t('project_config.name_tooltip')"
          spellcheck="false"
          w="200px"
        />

        <div
          v-if="repositoryFolderName && localProjectItem.name !== repositoryFolderName"
          col-start="2"
          flex
          gap="2px"
          overflow-hidden
        >
          <span text="secondary" truncate>{{ repositoryFolderName }}</span>
          <JeLink :on-click="fillProjectName">
            {{ t('project_config.fill') }}
          </JeLink>
        </div>

        <!-- Group -->
        <EditorTitle title="project_config.group" />
        <div flex="~ row items-center" gap="10px">
          <JeCombobox
            v-model="localProjectItem.group"
            :options="groupOptions"
            :spellcheck="false"
            w="200px"
          />
          <span text="secondary">({{ t('project_config.optional') }})</span>
        </div>
      </EditorItem>

      <!-- KindButtons -->
      <EditorItem>
        <EditorTitle title="project_config.kind.source" />
        <JeSegmentedControl v-model="localProjectItem.kind" :labels="kindButtonLabels" />

        <KeepAlive>
          <Component
            :is="kindComponents[localProjectItem.kind]"
            :local-project-item="localProjectItem"
            @update:project-from-url="
              (newKind: string) => {
                localProjectItem.fromUrl = newKind
              }
            "
            @update:project-from-name="
              (newKind: string) => {
                localProjectItem.fromName = newKind
              }
            "
          />
        </KeepAlive>

        <!-- Temporary -->
        <div col-start="2">
          <JeCheckbox v-model="localProjectItem.isTemporary" class="checkbox-setting" w-fit>
            {{ t('project_config.temporary') }}
          </JeCheckbox>
        </div>
      </EditorItem>

      <!-- MainLanguage -->
      <EditorItem>
        <EditorTitle title="project_config.main_lang" />
        <JeCombobox
          v-model="localProjectItem.mainLang"
          :options="mainLanguageOptions"
          :loading="mainLanguageLoading"
          :validated="projectLangInputValidated"
          :validated-tooltip="t('project_config.lang_tooltip')"
          :spellcheck="false"
        />
      </EditorItem>

      <!-- DefaultOpen -->
      <EditorItem>
        <EditorTitle title="project_config.open_method" />
        <JeDropdown
          v-model="localProjectItem.defaultOpen"
          :options="transformCodeEditorOptionsToDropdownOptions(codeEditors)"
          :loading="defaultOpenLoading"
          :validated="projectDefaultOpenInputValidated"
          :validated-tooltip="t('project_config.open_tooltip')"
        />
      </EditorItem>

      <!-- License -->
      <EditorItem>
        <EditorTitle title="project_config.license" />
        <JeDropdown
          v-model="localProjectItem.license"
          :options="convertLicensesToDropdownOptions(LicenseEnum)"
        />
      </EditorItem>
    </JeFrame>

    <JeFrame
      type="secondary"
      b-t="solid 2px light:$gray-12 dark:$gray-3"
      p="8px"
      flex="~ row-reverse"
      gap="8px"
    >
      <JeButton v-if="!isUpdateProject" order-2 @click="addNewProject">
        {{ t('project_config.create') }}
      </JeButton>
      <JeButton v-else order-2 @click="updateProject">
        {{ t('project_config.finish') }}
      </JeButton>
      <JeButton type="secondary-alt" order-1 @click="changeHomeView">
        {{ t('project_config.cancel') }}
      </JeButton>
    </JeFrame>
  </JeFrame>
</template>
