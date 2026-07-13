import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import { ProjectKind } from '~/constants/localProject'
import {
  addNewProjectsFromScanner,
  checkRegexComplexity,
  scannerBusy,
  toRegExp,
} from '~/services/projectScannerService'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

describe('checkRegexComplexity', () => {
  it('accepts simple patterns', () => {
    expect(checkRegexComplexity('(demo|test)')).toBe(true)
    expect(checkRegexComplexity('^my-project$')).toBe(true)
    expect(checkRegexComplexity('foo.*bar')).toBe(true)
    expect(checkRegexComplexity('[a-z]+\\d{2,4}')).toBe(true)
  })

  it('rejects nested quantifiers (classic ReDoS)', () => {
    expect(checkRegexComplexity('(a+)+')).toBe(false)
    expect(checkRegexComplexity('(a*)*')).toBe(false)
    expect(checkRegexComplexity('(a+)*')).toBe(false)
  })

  it('rejects consecutive quantifiers', () => {
    expect(checkRegexComplexity('a*+')).toBe(false)
    expect(checkRegexComplexity('a++')).toBe(false)
  })

  it('rejects unbalanced parentheses', () => {
    expect(checkRegexComplexity('(abc')).toBe(false)
    expect(checkRegexComplexity('abc)')).toBe(false)
    expect(checkRegexComplexity('))((')).toBe(false)
  })

  it('rejects excessive nesting depth', () => {
    expect(checkRegexComplexity('((((a))))')).toBe(false)
    expect(checkRegexComplexity('(((a)))')).toBe(true)
  })

  it('handles escaped characters without treating them as syntax', () => {
    expect(checkRegexComplexity('\\(a\\+\\)\\+')).toBe(true)
    expect(checkRegexComplexity('foo\\\\bar')).toBe(true)
  })
})

describe('toRegExp', () => {
  it('parses plain patterns', () => {
    const re = toRegExp('(demo|test)')
    expect(re).toBeInstanceOf(RegExp)
    expect(re!.test('my-demo-app')).toBe(true)
    expect(re!.test('production')).toBe(false)
  })

  it('parses /pattern/flags form and strips g/y flags', () => {
    const re = toRegExp('/demo/gi')
    expect(re).toBeInstanceOf(RegExp)
    expect(re!.flags).toBe('i')
    // 同一实例多次 test() 结果一致(无 lastIndex 状态)
    expect(re!.test('DEMO')).toBe(true)
    expect(re!.test('DEMO')).toBe(true)
  })

  it('returns null for empty or oversized patterns', () => {
    expect(toRegExp('')).toBeNull()
    expect(toRegExp('a'.repeat(201))).toBeNull()
  })

  it('returns null for ReDoS-prone patterns', () => {
    expect(toRegExp('(a+)+b')).toBeNull()
  })

  it('returns null for syntactically invalid patterns', () => {
    expect(toRegExp('[unclosed')).toBeNull()
  })
})

describe('project scanner import', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('navigator', {
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      api: {
        checkPathExistence: vi.fn(async () => ({ exists: true })),
        loadData: vi.fn(async () => ({ success: false })),
        readProjectLicense: vi.fn(async () => ({ success: false })),
        saveData: vi.fn(async () => ({ success: true })),
        scanProjects: vi.fn(async () => ({ items: [] })),
      },
    })
  })

  it('does not scan when scanner settings are disabled', async () => {
    await expect(addNewProjectsFromScanner()).resolves.toEqual({
      added: 0,
      failed: 0,
      scanned: 0,
    })

    expect(window.api.scanProjects).not.toHaveBeenCalled()
    expect(scannerBusy.value).toBe(false)
  })

  it('imports scanned projects, resolves source editors, and stores cache entries', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.scanner.rootsEnabled = true
    settingsStore.scanner.roots = ['E:\\Projects']
    settingsStore.scanner.ideOpenMode = 'source'
    vi.mocked(window.api.scanProjects).mockResolvedValue({
      items: [{
        detectedKind: ProjectKind.FORK,
        fromName: 'MidnightCrowing/CodeNest',
        fromUrl: 'https://github.com/MidnightCrowing/CodeNest.git',
        ide: CodeEditorEnum.Cursor,
        langGroup: [{ color: '#3178c6', percentage: 100, text: 'TypeScript' }],
        mainLang: 'TypeScript',
        mainLangColor: '#3178c6',
        name: 'CodeNest',
        path: 'E:\\Projects\\CodeNest',
        signature: 'sig-1',
      }],
    })

    await expect(addNewProjectsFromScanner()).resolves.toEqual({
      added: 1,
      failed: 0,
      scanned: 1,
    })

    const projectsStore = useProjectsStore()
    const scannerStore = useProjectScannerStore()
    expect(projectsStore.projects).toHaveLength(1)
    expect(projectsStore.projects[0]).toMatchObject({
      defaultOpen: CodeEditorEnum.Cursor,
      fromName: 'MidnightCrowing/CodeNest',
      fromUrl: 'https://github.com/MidnightCrowing/CodeNest.git',
      kind: ProjectKind.FORK,
      mainLang: 'TypeScript',
      path: 'E:\\Projects\\CodeNest',
    })
    expect(scannerStore.getScanCacheEntry('e:/projects/codenest/')).toMatchObject({
      name: 'CodeNest',
      signature: 'sig-1',
    })
    expect(window.api.saveData).toHaveBeenCalled()
  })

  it('reuses the in-flight scan promise to avoid concurrent imports', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.scanner.rootsEnabled = true
    settingsStore.scanner.roots = ['E:\\Projects']
    expect(settingsStore.scannerEnabled).toBe(true)
    let resolveScan: (value: { items: [] }) => void = () => {}
    let resolveScanStarted: () => void = () => {}
    const scanStarted = new Promise<void>((resolve) => {
      resolveScanStarted = resolve
    })
    vi.mocked(window.api.scanProjects).mockImplementation(() =>
      new Promise((resolve) => {
        resolveScanStarted()
        resolveScan = resolve
      }),
    )

    const firstScan = addNewProjectsFromScanner()
    const secondScan = addNewProjectsFromScanner()

    expect(secondScan).toBe(firstScan)
    await scanStarted
    expect(window.api.scanProjects).toHaveBeenCalledTimes(1)

    resolveScan({ items: [] })
    await expect(firstScan).resolves.toEqual({
      added: 0,
      failed: 0,
      scanned: 0,
    })
    expect(scannerBusy.value).toBe(false)
  })
})
