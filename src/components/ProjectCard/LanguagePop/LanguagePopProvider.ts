import type { languagesGroupItem, LocalProject, ProjectLanguage } from '~/constants/localProject'
import { LanguageAnalyzer } from '~/core/main'

export const popupVisible: Ref<boolean> = ref(false)
export const position: { top: number, left: number } = reactive({ top: 0, left: 0 })

const project: Ref<LocalProject | null> = ref(null)
export const mainLang: Ref<ProjectLanguage | null | undefined> = ref<ProjectLanguage | null>(null)
export const mainLangColor: Ref<`#${string}` | undefined> = ref<`#${string}` | undefined>(undefined)
export const languagesGroup: Ref<languagesGroupItem[] | undefined> = ref<languagesGroupItem[] | undefined>(undefined)
export const getAnalyzeError: Ref<boolean | null> = ref(null)

export function showPop(newProjectItem: LocalProject, top: number, left: number) {
  project.value = newProjectItem
  mainLang.value = newProjectItem.mainLang
  mainLangColor.value = newProjectItem.mainLangColor
  languagesGroup.value = newProjectItem?.langGroup
  position.top = top
  position.left = left
  popupVisible.value = true

  getAnalyzeError.value = null

  if (!languagesGroup.value || languagesGroup.value.length === 0) {
    getAnalyzeError.value = false
    loadLanguageAnalyzer()
  }
}

export function hidePop() {
  popupVisible.value = false
}

function loadLanguageAnalyzer() {
  if (!project.value) {
    console.warn('No project available to analyze.')
    return
  }

  const folderPath = project.value.path
  const analyzer = new LanguageAnalyzer(folderPath)

  analyzer.analyze().then((success) => {
    if (success) {
      // 更新 project 的 mainLangColor 和 langGroup
      // 这里确保 `project.value` 不为 null
      if (project.value) {
        project.value.mainLangColor = project.value.mainLangColor ?? analyzer.mainLangColor as `#${string}` | undefined
        project.value.langGroup = project.value.langGroup ?? analyzer.langGroup

        if (!project.value.langGroup?.length && analyzer.langGroup?.length) {
          project.value.langGroup = analyzer.langGroup
        }

        languagesGroup.value = project.value.langGroup
      }
    }
    else {
      getAnalyzeError.value = true
      console.error(`Error analyzing folder for project at ${folderPath}`)
    }
  })
}
