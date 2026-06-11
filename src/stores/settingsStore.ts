import { defineStore } from 'pinia'

import { LanguageEnum, ThemeColorEnum, ThemeEnum } from '~/constants/appEnums'
import type { CliHistoryScannerEditor, EditorCommandKey, VscodeHistoryScannerEditor } from '~/constants/codeEditor'
import {
  cliHistoryScannerEditors,
  CodeEditorEnum,
  editorCommandKeys,
  editorCommandOptions,
  isCodeEditor,
  vscodeHistoryScannerEditors,
} from '~/constants/codeEditor'
import { createPersistence } from '~/stores/helpers/persistence'
import type { ResolvedTheme } from '~/utils/theme'
import { getPreferredSystemTheme } from '~/utils/theme'

// Scanner settings shape
export type ScannerRootOpenMode = 'language' | 'specified'
export type ScannerIdeOpenMode = 'source' | 'language' | 'specified'

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
  recentEditors: Record<VscodeHistoryScannerEditor, RecentEditorScannerConfig>
  cliEditors: Record<CliHistoryScannerEditor, CliEditorScannerConfig>

  // import strategies
  rootOpenMode: ScannerRootOpenMode
  ideOpenMode: ScannerIdeOpenMode
  editor: CodeEditorEnum
  namePattern: string
}

export interface RecentEditorScannerConfig {
  enabled: boolean
  stateDbPath: string
}

export interface CliEditorScannerConfig {
  enabled: boolean
  historyRootPath: string
}

export interface WebDavSettings {
  endpoint: string
  username: string
  password: string
  remotePath: string
}

type StoredWebDavSettings = Partial<Omit<WebDavSettings, 'password'>> & {
  password?: string
}

interface StoredSettings {
  theme?: ThemeEnum
  themeColor?: ThemeColorEnum
  customThemeColor?: string
  terminalCommand?: string
  language?: LanguageEnum
  codeEditorsPath?: Partial<Record<EditorCommandKey | 'jetbrains', string>>
  codeEditorsOpenInTerminal?: Partial<Record<EditorCommandKey, boolean>>
  autoDetectedEditorCommands?: boolean
  webdav?: StoredWebDavSettings
  scanner?: Partial<Omit<ScannerSettings, 'jetbrains' | 'recentEditors' | 'cliEditors'>> & {
    jetbrains?: Partial<ScannerSettings['jetbrains']>
    recentEditors?: Partial<Record<VscodeHistoryScannerEditor, Partial<RecentEditorScannerConfig>>>
    cliEditors?: Partial<Record<CliHistoryScannerEditor, Partial<CliEditorScannerConfig>>>
    vscode?: Partial<RecentEditorScannerConfig>
    openMode?: 'auto' | 'specified'
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

function isScannerRootOpenMode(value: unknown): value is ScannerRootOpenMode {
  return value === 'language' || value === 'specified'
}

function isScannerIdeOpenMode(value: unknown): value is ScannerIdeOpenMode {
  return value === 'source' || value === 'language' || value === 'specified'
}

function normalizeCustomThemeColor(value: unknown) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value)
    ? value.toLowerCase()
    : DEFAULT_CUSTOM_THEME_COLOR
}

function createDefaultRecentEditorScanners(): Record<VscodeHistoryScannerEditor, RecentEditorScannerConfig> {
  return Object.fromEntries(
    vscodeHistoryScannerEditors.map(editor => [editor, { enabled: false, stateDbPath: '' }]),
  ) as Record<VscodeHistoryScannerEditor, RecentEditorScannerConfig>
}

function createDefaultCliEditorScanners(): Record<CliHistoryScannerEditor, CliEditorScannerConfig> {
  return Object.fromEntries(
    cliHistoryScannerEditors.map(editor => [editor, { enabled: false, historyRootPath: '' }]),
  ) as Record<CliHistoryScannerEditor, CliEditorScannerConfig>
}

export const useSettingsStore = defineStore('settings', () => {
  // --- 基础配置项 ---
  const theme = ref<ThemeEnum>(ThemeEnum.System)
  const systemTheme = ref<ResolvedTheme>(getPreferredSystemTheme())
  const resolvedTheme = computed<ResolvedTheme>(() =>
    theme.value === ThemeEnum.System ? systemTheme.value : theme.value,
  )
  const themeColor = ref<ThemeColorEnum>(ThemeColorEnum.Contrast)
  const customThemeColor = ref(DEFAULT_CUSTOM_THEME_COLOR)
  const terminalCommand = ref('')
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
  let savedWebDavPassword = ''
  let webDavPasswordStorageAvailable = true
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
    recentEditors: createDefaultRecentEditorScanners(),
    cliEditors: createDefaultCliEditorScanners(),

    rootOpenMode: 'language',
    ideOpenMode: 'source',
    editor: CodeEditorEnum.VisualStudioCode,
    namePattern: '(demo|test)',
  })
  const scannerEnabled = computed(() =>
    (scanner.rootsEnabled && scanner.roots.length > 0)
    || (
      scanner.ideEnabled
      && (
        (scanner.jetbrains.enabled && !!scanner.jetbrains.configRootPath)
        || vscodeHistoryScannerEditors.some(editor => (
          scanner.recentEditors[editor].enabled && !!scanner.recentEditors[editor].stateDbPath
        ))
        || cliHistoryScannerEditors.some(editor => (
          scanner.cliEditors[editor].enabled && !!scanner.cliEditors[editor].historyRootPath
        ))
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
      recentEditors: Object.fromEntries(
        vscodeHistoryScannerEditors.map(editor => [
          editor,
          {
            enabled: scanner.recentEditors[editor].enabled,
            stateDbPath: scanner.recentEditors[editor].stateDbPath,
          },
        ]),
      ) as Record<VscodeHistoryScannerEditor, RecentEditorScannerConfig>,
      cliEditors: Object.fromEntries(
        cliHistoryScannerEditors.map(editor => [
          editor,
          {
            enabled: scanner.cliEditors[editor].enabled,
            historyRootPath: scanner.cliEditors[editor].historyRootPath,
          },
        ]),
      ) as Record<CliHistoryScannerEditor, CliEditorScannerConfig>,
      rootOpenMode: scanner.rootOpenMode,
      ideOpenMode: scanner.ideOpenMode,
      editor: scanner.editor,
      namePattern: scanner.namePattern,
    }
  }

  function snapshotWebDav(): StoredWebDavSettings {
    const snapshot: StoredWebDavSettings = {
      endpoint: webdav.endpoint,
      username: webdav.username,
      remotePath: webdav.remotePath,
    }

    if (!webDavPasswordStorageAvailable && webdav.password)
      snapshot.password = webdav.password

    return snapshot
  }

  function resetScanner() {
    scanner.rootsEnabled = false
    scanner.roots.splice(0, scanner.roots.length)
    scanner.ideEnabled = false
    scanner.jetbrains.enabled = false
    scanner.jetbrains.configRootPath = ''
    for (const editor of vscodeHistoryScannerEditors) {
      scanner.recentEditors[editor].enabled = false
      scanner.recentEditors[editor].stateDbPath = ''
    }
    for (const editor of cliHistoryScannerEditors) {
      scanner.cliEditors[editor].enabled = false
      scanner.cliEditors[editor].historyRootPath = ''
    }
    scanner.rootOpenMode = 'language'
    scanner.ideOpenMode = 'source'
    scanner.editor = CodeEditorEnum.VisualStudioCode
    scanner.namePattern = '(demo|test)'
  }

  function cancelQueuedSave() {
    if (saveTimer !== null) {
      window.clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  function resetSettingsState() {
    // 取消 pending 的保存,避免定时器触发时保存已被重置的状态
    cancelQueuedSave()
    theme.value = ThemeEnum.System
    themeColor.value = ThemeColorEnum.Contrast
    customThemeColor.value = DEFAULT_CUSTOM_THEME_COLOR
    terminalCommand.value = ''
    language.value = LanguageEnum.English
    autoDetectedEditorCommands.value = false
    savedWebDavPassword = ''
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
    let legacyWebDavPassword: string | null = null

    if (isTheme(loadedData.theme))
      theme.value = loadedData.theme
    if (isThemeColor(loadedData.themeColor))
      themeColor.value = loadedData.themeColor
    customThemeColor.value = normalizeCustomThemeColor(loadedData.customThemeColor)
    if (typeof loadedData.terminalCommand === 'string')
      terminalCommand.value = loadedData.terminalCommand
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
        legacyWebDavPassword = loadedData.webdav.password
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
      if (isScannerRootOpenMode(s.rootOpenMode))
        scanner.rootOpenMode = s.rootOpenMode
      else if (s.openMode === 'specified')
        scanner.rootOpenMode = 'specified'
      if (isScannerIdeOpenMode(s.ideOpenMode))
        scanner.ideOpenMode = s.ideOpenMode
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
      if (s.recentEditors) {
        for (const editor of vscodeHistoryScannerEditors) {
          const config = s.recentEditors[editor]
          if (!config)
            continue
          if (typeof config.enabled === 'boolean')
            scanner.recentEditors[editor].enabled = config.enabled
          if (typeof config.stateDbPath === 'string')
            scanner.recentEditors[editor].stateDbPath = config.stateDbPath
        }
      }
      if (s.cliEditors) {
        for (const editor of cliHistoryScannerEditors) {
          const config = s.cliEditors[editor]
          if (!config)
            continue
          if (typeof config.enabled === 'boolean')
            scanner.cliEditors[editor].enabled = config.enabled
          if (typeof config.historyRootPath === 'string')
            scanner.cliEditors[editor].historyRootPath = config.historyRootPath
        }
      }
      if (s.vscode) {
        if (typeof s.vscode.enabled === 'boolean')
          scanner.recentEditors[CodeEditorEnum.VisualStudioCode].enabled = s.vscode.enabled
        if (typeof s.vscode.stateDbPath === 'string')
          scanner.recentEditors[CodeEditorEnum.VisualStudioCode].stateDbPath = s.vscode.stateDbPath
      }
    }

    return legacyWebDavPassword
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

  function setSystemTheme(theme: ResolvedTheme) {
    systemTheme.value = theme
  }

  async function persistWebDavPassword() {
    if (webdav.password === savedWebDavPassword)
      return
    if (!webDavPasswordStorageAvailable)
      return

    try {
      if (webdav.password)
        await window.api.saveWebDavPassword(webdav.password)
      else
        await window.api.deleteWebDavPassword()
    }
    catch (error: unknown) {
      webDavPasswordStorageAvailable = false
      throw error
    }

    savedWebDavPassword = webdav.password
  }

  async function loadWebDavPassword(legacyPassword: string | null) {
    try {
      const password = await window.api.loadWebDavPassword()
      webDavPasswordStorageAvailable = true
      if (password !== null) {
        webdav.password = password
        savedWebDavPassword = password
        return Boolean(legacyPassword)
      }
    }
    catch (error: unknown) {
      webDavPasswordStorageAvailable = false
      console.error('Error loading WebDAV password from secure storage:', error)
    }

    if (legacyPassword) {
      webdav.password = legacyPassword
      if (webDavPasswordStorageAvailable) {
        try {
          await persistWebDavPassword()
          return true
        }
        catch (error: unknown) {
          console.error('Error migrating WebDAV password to secure storage:', error)
        }
      }
      return false
    }

    savedWebDavPassword = ''
    return false
  }

  // --- 加载配置 ---
  async function loadSettings(): Promise<void> {
    try {
      loaded.value = false
      resetSettingsState()

      const cachedData = settingsPersistence.loadCached()
      const cachedHadLegacyWebDavPassword = typeof cachedData?.webdav?.password === 'string'
      if (cachedData)
        applyStoredSettings(cachedData)

      const loadedData = await settingsPersistence.load()
      const isFirstRun = !loadedData
      let legacyWebDavPassword: string | null = null
      if (loadedData) {
        resetSettingsState()
        legacyWebDavPassword = applyStoredSettings(loadedData)
      }
      else {
        resetSettingsState()
      }
      const shouldSanitizeLegacyWebDavPassword = await loadWebDavPassword(legacyWebDavPassword)
      loaded.value = true
      if (shouldSanitizeLegacyWebDavPassword || cachedHadLegacyWebDavPassword)
        await saveSettings()
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
      try {
        await persistWebDavPassword()
      }
      catch (error) {
        console.error('Error saving WebDAV password to secure storage:', error)
      }

      await settingsPersistence.save({
        theme: theme.value,
        themeColor: themeColor.value,
        customThemeColor: customThemeColor.value,
        terminalCommand: terminalCommand.value,
        language: language.value,
        codeEditorsPath: { ...codeEditorsPath },
        codeEditorsOpenInTerminal: { ...codeEditorsOpenInTerminal },
        autoDetectedEditorCommands: autoDetectedEditorCommands.value,
        webdav: snapshotWebDav(),
        scanner: snapshotScanner(),
      })
    }
    catch (error: unknown) {
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
    [theme, themeColor, customThemeColor, terminalCommand, language, codeEditorsPath, codeEditorsOpenInTerminal, autoDetectedEditorCommands, webdav, scanner],
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
    resolvedTheme,
    themeColor,
    customThemeColor,
    terminalCommand,
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
    setSystemTheme,
  }
})
