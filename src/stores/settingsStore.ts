import { defineStore } from 'pinia'

import { LanguageEnum, ThemeColorEnum, ThemeEnum } from '~/constants/appEnums'
import type { EditorCommandKey } from '~/constants/codeEditor'
import {
  CodeEditorEnum,
  editorCommandKeys,
  editorCommandOptions,
  isCodeEditor,
} from '~/constants/codeEditor'
import { createPersistence } from '~/stores/helpers/persistence'

// Scanner settings shape
export interface ScannerSettings {
  // file system roots scanning
  rootsEnabled: boolean
  roots: string[]

  // IDE scanning toggles
  ideEnabled: boolean
  jetbrains: {
    enabled: boolean
    configRootPath: string
  }
  vscode: {
    enabled: boolean
    stateDbPath: string
  }

  // import strategies
  openMode: 'auto' | 'specified'
  editor: CodeEditorEnum
  namePattern: string
}

export interface WebDavSettings {
  endpoint: string
  username: string
  password: string
  remotePath: string
}

interface StoredSettings {
  theme?: ThemeEnum
  themeColor?: ThemeColorEnum
  customThemeColor?: string
  language?: LanguageEnum
  codeEditorsPath?: Partial<Record<EditorCommandKey | 'jetbrains', string>>
  codeEditorsOpenInTerminal?: Partial<Record<EditorCommandKey, boolean>>
  autoDetectedEditorCommands?: boolean
  webdav?: Partial<WebDavSettings>
  scanner?: Partial<Omit<ScannerSettings, 'jetbrains' | 'vscode'>> & {
    jetbrains?: Partial<ScannerSettings['jetbrains']>
    vscode?: Partial<ScannerSettings['vscode']>
  }
}

const settingsPersistence = createPersistence<StoredSettings>({
  key: 'settings',
})

const DEFAULT_CUSTOM_THEME_COLOR = '#4682fa'
const HEX_COLOR_RE = /^#[\da-f]{6}$/i

function isTheme(value: unknown): value is ThemeEnum {
  return Object.values(ThemeEnum).includes(value as ThemeEnum)
}

function isThemeColor(value: unknown): value is ThemeColorEnum {
  return Object.values(ThemeColorEnum).includes(value as ThemeColorEnum)
}

function isLanguage(value: unknown): value is LanguageEnum {
  return Object.values(LanguageEnum).includes(value as LanguageEnum)
}

function normalizeCustomThemeColor(value: unknown) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value)
    ? value.toLowerCase()
    : DEFAULT_CUSTOM_THEME_COLOR
}

export const useSettingsStore = defineStore('settings', () => {
  // --- 基础配置项 ---
  const theme = ref<ThemeEnum>(ThemeEnum.Light)
  const themeColor = ref<ThemeColorEnum>(ThemeColorEnum.Contrast)
  const customThemeColor = ref(DEFAULT_CUSTOM_THEME_COLOR)
  const language = ref<LanguageEnum>(LanguageEnum.English)
  const loaded = ref(false)
  let saveTimer: number | null = null
  const codeEditorsPath = reactive<Record<EditorCommandKey, string>>(
    Object.fromEntries(editorCommandKeys.map(key => [key, ''])) as Record<EditorCommandKey, string>,
  )
  const codeEditorsOpenInTerminal = reactive<Record<EditorCommandKey, boolean>>(
    Object.fromEntries(editorCommandOptions.map(option => [option.key, option.openInTerminal])) as Record<EditorCommandKey, boolean>,
  )
  const autoDetectedEditorCommands = ref(false)
  const webdav = reactive<WebDavSettings>({
    endpoint: '',
    username: '',
    password: '',
    remotePath: 'CodeNest',
  })

  // --- 扫描器配置 ---
  const scanner = reactive<ScannerSettings>({
    rootsEnabled: false,
    roots: [],

    ideEnabled: false,
    jetbrains: {
      enabled: false,
      configRootPath: '',
    },
    vscode: {
      enabled: false,
      stateDbPath: '',
    },

    openMode: 'auto',
    editor: CodeEditorEnum.VisualStudioCode,
    namePattern: '(demo|test)',
  })
  const scannerEnabled = computed(() =>
    (scanner.rootsEnabled && scanner.roots.length > 0)
    || (
      scanner.ideEnabled
      && (
        (scanner.jetbrains.enabled && !!scanner.jetbrains.configRootPath)
        || (scanner.vscode.enabled && !!scanner.vscode.stateDbPath)
      )
    ),
  )

  function snapshotScanner(): ScannerSettings {
    return {
      rootsEnabled: scanner.rootsEnabled,
      roots: [...scanner.roots],
      ideEnabled: scanner.ideEnabled,
      jetbrains: {
        enabled: scanner.jetbrains.enabled,
        configRootPath: scanner.jetbrains.configRootPath,
      },
      vscode: {
        enabled: scanner.vscode.enabled,
        stateDbPath: scanner.vscode.stateDbPath,
      },
      openMode: scanner.openMode,
      editor: scanner.editor,
      namePattern: scanner.namePattern,
    }
  }

  function resetScanner() {
    scanner.rootsEnabled = false
    scanner.roots.splice(0, scanner.roots.length)
    scanner.ideEnabled = false
    scanner.jetbrains.enabled = false
    scanner.jetbrains.configRootPath = ''
    scanner.vscode.enabled = false
    scanner.vscode.stateDbPath = ''
    scanner.openMode = 'auto'
    scanner.editor = CodeEditorEnum.VisualStudioCode
    scanner.namePattern = '(demo|test)'
  }

  function resetSettingsState() {
    theme.value = ThemeEnum.Light
    themeColor.value = ThemeColorEnum.Contrast
    customThemeColor.value = DEFAULT_CUSTOM_THEME_COLOR
    language.value = LanguageEnum.English
    autoDetectedEditorCommands.value = false
    for (const option of editorCommandOptions) {
      codeEditorsPath[option.key] = ''
      codeEditorsOpenInTerminal[option.key] = option.openInTerminal
    }
    webdav.endpoint = ''
    webdav.username = ''
    webdav.password = ''
    webdav.remotePath = 'CodeNest'
    resetScanner()
  }

  function applyStoredSettings(loadedData: StoredSettings) {
    if (isTheme(loadedData.theme))
      theme.value = loadedData.theme
    if (isThemeColor(loadedData.themeColor))
      themeColor.value = loadedData.themeColor
    customThemeColor.value = normalizeCustomThemeColor(loadedData.customThemeColor)
    if (isLanguage(loadedData.language))
      language.value = loadedData.language

    // editor launch commands
    if (loadedData.codeEditorsPath) {
      for (const option of editorCommandOptions) {
        const command = loadedData.codeEditorsPath[option.key]
        codeEditorsPath[option.key] = typeof command === 'string' ? command : ''
      }

      const legacyJetBrainsCommand = loadedData.codeEditorsPath.jetbrains
      if (typeof legacyJetBrainsCommand === 'string' && legacyJetBrainsCommand.trim()) {
        codeEditorsPath[CodeEditorEnum.IntellijIdea] ||= legacyJetBrainsCommand
      }
    }

    if (loadedData.codeEditorsOpenInTerminal) {
      for (const option of editorCommandOptions) {
        const openInTerminal = loadedData.codeEditorsOpenInTerminal[option.key]
        if (typeof openInTerminal === 'boolean')
          codeEditorsOpenInTerminal[option.key] = openInTerminal
      }
    }
    if (typeof loadedData.autoDetectedEditorCommands === 'boolean')
      autoDetectedEditorCommands.value = loadedData.autoDetectedEditorCommands

    if (loadedData.webdav) {
      if (typeof loadedData.webdav.endpoint === 'string')
        webdav.endpoint = loadedData.webdav.endpoint
      if (typeof loadedData.webdav.username === 'string')
        webdav.username = loadedData.webdav.username
      if (typeof loadedData.webdav.password === 'string')
        webdav.password = loadedData.webdav.password
      if (typeof loadedData.webdav.remotePath === 'string')
        webdav.remotePath = loadedData.webdav.remotePath
    }

    // scanner
    if (loadedData.scanner) {
      const s = loadedData.scanner
      // primitives
      if (typeof s.rootsEnabled === 'boolean')
        scanner.rootsEnabled = s.rootsEnabled
      if (Array.isArray(s.roots))
        scanner.roots.splice(0, scanner.roots.length, ...s.roots)
      if (typeof s.ideEnabled === 'boolean')
        scanner.ideEnabled = s.ideEnabled
      if (s.openMode === 'auto' || s.openMode === 'specified')
        scanner.openMode = s.openMode
      if (isCodeEditor(s.editor))
        scanner.editor = s.editor
      if (typeof s.namePattern === 'string')
        scanner.namePattern = s.namePattern

      // nested
      if (s.jetbrains) {
        if (typeof s.jetbrains.enabled === 'boolean')
          scanner.jetbrains.enabled = s.jetbrains.enabled
        if (typeof s.jetbrains.configRootPath === 'string')
          scanner.jetbrains.configRootPath = s.jetbrains.configRootPath
      }
      if (s.vscode) {
        if (typeof s.vscode.enabled === 'boolean')
          scanner.vscode.enabled = s.vscode.enabled
        if (typeof s.vscode.stateDbPath === 'string')
          scanner.vscode.stateDbPath = s.vscode.stateDbPath
      }
    }
  }

  function hydrateCachedSettings() {
    const cachedData = settingsPersistence.loadCached()
    if (!cachedData)
      return false

    const wasLoaded = loaded.value
    loaded.value = false
    resetSettingsState()
    applyStoredSettings(cachedData)
    loaded.value = wasLoaded
    return true
  }

  // --- 加载配置 ---
  async function loadSettings(): Promise<void> {
    try {
      loaded.value = false
      resetSettingsState()

      const cachedData = settingsPersistence.loadCached()
      if (cachedData)
        applyStoredSettings(cachedData)

      const loadedData = await settingsPersistence.load()
      const isFirstRun = !loadedData
      if (loadedData) {
        resetSettingsState()
        applyStoredSettings(loadedData)
      }
      else {
        resetSettingsState()
      }
      loaded.value = true
      if (!isFirstRun && !autoDetectedEditorCommands.value) {
        autoDetectedEditorCommands.value = true
        queueSaveSettings()
      }
      if (isFirstRun && !autoDetectedEditorCommands.value) {
        void detectMissingEditorCommands().catch((error) => {
          console.error('Error detecting editor commands:', error)
        })
      }
    }
    catch (error) {
      console.error('Error loading settings data:', error)
      loaded.value = true
    }
  }

  // --- 保存配置 ---
  async function saveSettings(): Promise<void> {
    try {
      await settingsPersistence.save({
        theme: theme.value,
        themeColor: themeColor.value,
        customThemeColor: customThemeColor.value,
        language: language.value,
        codeEditorsPath: { ...codeEditorsPath },
        codeEditorsOpenInTerminal: { ...codeEditorsOpenInTerminal },
        autoDetectedEditorCommands: autoDetectedEditorCommands.value,
        webdav: { ...webdav },
        scanner: snapshotScanner(),
      })
    }
    catch (error) {
      console.error('Error saving settings data:', error)
    }
  }

  function queueSaveSettings() {
    if (!loaded.value)
      return
    if (saveTimer !== null)
      window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      saveTimer = null
      void saveSettings()
    }, 180)
  }

  watch(
    [theme, themeColor, customThemeColor, language, codeEditorsPath, codeEditorsOpenInTerminal, autoDetectedEditorCommands, webdav, scanner],
    queueSaveSettings,
    { deep: true },
  )

  async function detectEditorCommand(key: EditorCommandKey, overwrite = true): Promise<string | null> {
    if (!overwrite && codeEditorsPath[key].trim())
      return codeEditorsPath[key]

    const command = await window.api.detectEditorCommand(key)
    if (command) {
      codeEditorsPath[key] = command
      return command
    }
    return null
  }

  async function detectMissingEditorCommands() {
    const detected = await Promise.all(
      editorCommandKeys.map(key => detectEditorCommand(key, false)),
    )
    autoDetectedEditorCommands.value = true
    if (detected.some(Boolean))
      await saveSettings()
    else
      queueSaveSettings()
  }

  function getEditorLaunchConfig(editor: CodeEditorEnum) {
    const key = editor
    return {
      key,
      command: codeEditorsPath[key],
      openInTerminal: codeEditorsOpenInTerminal[key],
    }
  }

  return {
    theme,
    themeColor,
    customThemeColor,
    language,
    codeEditorsPath,
    codeEditorsOpenInTerminal,
    autoDetectedEditorCommands,
    webdav,
    scanner,
    scannerEnabled,
    detectEditorCommand,
    detectMissingEditorCommands,
    getEditorLaunchConfig,
    hydrateCachedSettings,
    loadSettings,
    saveSettings,
  }
})
