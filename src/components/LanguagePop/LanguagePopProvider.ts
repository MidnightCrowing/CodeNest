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
let saveProjectsTimer: ReturnType<typeof window.setTimeout> | null = null
const analyzingByPath = new Map<string, Promise<LanguageAnalyzer | null>>()
const lastAnalyzeStartedAt = new Map<string, number>()
const ANALYZE_DEBOUNCE_MS = 1200
const SAVE_PROJECTS_DEBOUNCE_MS = 900

export function showPop(newProjectItem: LocalProject, anchor: HTMLElement) {
  // 远程项目没有本地文件可分析,不展示语言分析弹层
  if (newProjectItem.isRemote)
    return

  const requestId = ++analyzeRequestId
  project.value = newProjectItem
  mainLang.value = newProjectItem.mainLang
  mainLangColor.value = newProjectItem.mainLangColor
  languagesGroup.value = newProjectItem.langGroup?.length ? newProjectItem.langGroup : undefined
  anchorElement.value = anchor
  popupVisible.value = true

  getAnalyzeError.value = null

  if (!languagesGroup.value || languagesGroup.value.length === 0)
    getAnalyzeError.value = false

  void loadLanguageAnalyzer(newProjectItem, requestId)
}

export function hidePop() {
  analyzeRequestId += 1
  anchorElement.value = null
  popupVisible.value = false
  analyzing.value = false
}

async function loadLanguageAnalyzer(targetProject: LocalProject, requestId: number) {
  if (!targetProject.path) {
    console.warn('No project available to analyze.')
    return
  }

  const folderPath = targetProject.path
  const cachedGroup = targetProject.langGroup?.length ? targetProject.langGroup : undefined
  const recentStartedAt = lastAnalyzeStartedAt.get(folderPath) || 0
  const hasActiveAnalyze = analyzingByPath.has(folderPath)
  if (!hasActiveAnalyze && performance.now() - recentStartedAt < ANALYZE_DEBOUNCE_MS) {
    analyzing.value = false
    return
  }

  analyzing.value = true

  try {
    const analyzer = await analyzeProjectLanguage(folderPath)

    if (analyzer?.langGroup?.length) {
      targetProject.langGroup = analyzer.langGroup || []
      queueSaveProjects()

      if (requestId === analyzeRequestId && project.value?.path === folderPath)
        languagesGroup.value = targetProject.langGroup?.length ? targetProject.langGroup : undefined
    }
    else {
      if (requestId === analyzeRequestId && !cachedGroup?.length)
        getAnalyzeError.value = true
      console.error(`Error analyzing languages for project at ${folderPath}`)
    }
  }
  finally {
    if (requestId === analyzeRequestId)
      analyzing.value = false
  }
}

function analyzeProjectLanguage(folderPath: string) {
  const activeAnalyze = analyzingByPath.get(folderPath)
  if (activeAnalyze)
    return activeAnalyze

  lastAnalyzeStartedAt.set(folderPath, performance.now())
  const promise = (async () => {
    const analyzer = new LanguageAnalyzer(folderPath)
    return await analyzer.analyze() ? analyzer : null
  })().finally(() => {
    analyzingByPath.delete(folderPath)
  })
  analyzingByPath.set(folderPath, promise)
  return promise
}

function queueSaveProjects() {
  if (saveProjectsTimer)
    window.clearTimeout(saveProjectsTimer)

  saveProjectsTimer = window.setTimeout(() => {
    saveProjectsTimer = null
    void useProjectsStore().saveProjects()
  }, SAVE_PROJECTS_DEBOUNCE_MS)
}
