export const PROJECT_ACTION_KEYS = ['open', 'explorer', 'terminal', 'copy', 'more'] as const

export type ProjectActionKey = typeof PROJECT_ACTION_KEYS[number]

export const OPEN_WITH_ACTION_PREFIX = 'open-with:'
export const DEFAULT_EDITOR_ACTION_PREFIX = 'default-editor:'
export const DEFAULT_EDITOR_AUTO_ACTION = `${DEFAULT_EDITOR_ACTION_PREFIX}auto`
