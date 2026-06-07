import type { languagesGroupItem, LocalProject, ProjectLanguage } from '~/constants/localProject'
import { LanguageAnalyzer } from '~/services/languageAnalyzer'
import { useProjectsStore } from '~/stores/projectsStore'

export const popupVisible: Ref<boolean> = ref(false)
export const anchorElement: Ref<HTMLElement | null> = ref(null)

const project: Ref<LocalProject | null> = ref(null)
export const mainLang: Ref<ProjectLanguage | null | undefined> = ref<ProjectLanguage | null>(null)
export const mainLangColor: Ref<`#${string}` | undefined> = ref<`#${string}` | undefined>(undefined)
export const languagesGroup: Ref<languagesGroupItem[] | undefined> = ref<languagesGroupItem[] | undefined>(undefined)
export const getAnalyzeError: Ref<boolean | null> = ref(null)
export const analyzing: Ref<boolean> = ref(false)

let analyzeRequestId = 0

export function showPop(newProjectItem: LocalProject, anchor: HTMLElement) {
  const requestId = ++analyzeRequestId
  project.value = newProjectItem
  mainLang.value = newProjectItem.mainLang
  mainLangColor.value = newProjectItem.mainLangColor
  languagesGroup.value = newProjectItem.langGroup?.length ? newProjectItem.langGroup : undefined
  anchorElement.value = anchor
  popupVisible.value = true

  getAnalyzeError.value = null

  if (!languagesGroup.value || languagesGroup.value.length === 0) {
    getAnalyzeError.value = false
    void loadLanguageAnalyzer(requestId)
  }
  else {
    analyzing.value = false
  }
}

export function hidePop() {
  analyzeRequestId += 1
  anchorElement.value = null
  popupVisible.value = false
}

async function loadLanguageAnalyzer(requestId: number) {
  if (!project.value) {
    console.warn('No project available to analyze.')
    return
  }

  const folderPath = project.value.path
  analyzing.value = true
  const analyzer = new LanguageAnalyzer(folderPath)

  try {
    const success = await analyzer.analyze()
    if (requestId !== analyzeRequestId)
      return

    if (success) {
      // 更新 project 的 mainLangColor 和 langGroup
      // 这里确保 `project.value` 不为 null
      if (project.value) {
        project.value.mainLangColor = project.value.mainLangColor ?? analyzer.mainLangColor ?? undefined
        project.value.langGroup = project.value.langGroup ?? analyzer.langGroup

        if (!project.value.langGroup?.length && analyzer.langGroup?.length) {
          project.value.langGroup = analyzer.langGroup
        }

        mainLangColor.value = project.value.mainLangColor
        languagesGroup.value = project.value.langGroup
        void useProjectsStore().saveProjects()
      }
    }
    else {
      getAnalyzeError.value = true
      console.error(`Error analyzing folder for project at ${folderPath}`)
    }
  }
  finally {
    if (requestId === analyzeRequestId)
      analyzing.value = false
  }
}
