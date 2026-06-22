/**
 * HomeView 共享常量定义
 */

export const MIN_SYNC_BUSY_MS = 280
export const SCAN_RESULT_TOAST_THRESHOLD_MS = 700
export const HOME_LAYOUT_STORAGE_KEY = 'codenest:home-layout'
export const GITHUB_SOURCE_RE = /github\.com[/:]([^/:\s]+\/[^/\s#.]+)/

export const PROJECT_ACTION_KEYS = ['open', 'explorer', 'terminal', 'copy', 'more'] as const

// Menu action prefixes
export const OPEN_WITH_ACTION_PREFIX = 'open-with:'
export const DEFAULT_EDITOR_ACTION_PREFIX = 'default-editor:'
export const DEFAULT_EDITOR_AUTO_ACTION = `${DEFAULT_EDITOR_ACTION_PREFIX}auto`
