import { ref } from 'vue'

export type UiToastTone = 'info' | 'success' | 'warning' | 'error'

export const MAX_VISIBLE_TOASTS = 3

export interface UiToastOptions {
  title: string
  description?: string
  tone?: UiToastTone
  duration?: number
  action?: UiToastAction
}

export interface UiToastItem extends Required<Pick<UiToastOptions, 'title' | 'tone'>> {
  id: number
  count: number
  description?: string
  duration?: number
  action?: UiToastAction
  signature: string
  version: number
}

export interface UiToastAction {
  label: string
  altText?: string
  onSelect: () => void
}

export const toasts = ref<UiToastItem[]>([])
export const overflowToastCount = ref(0)
export const overflowToastVersion = ref(0)

let nextToastId = 1
let nextToastVersion = 1

function createToastSignature(options: UiToastOptions, tone: UiToastTone) {
  const actionKey = options.action
    ? `${options.action.label}\n${options.action.altText || ''}`
    : ''

  return [
    tone,
    options.title,
    options.description || '',
    actionKey,
  ].join('\u001F')
}

function compactToasts() {
  if (toasts.value.length <= MAX_VISIBLE_TOASTS)
    return

  const overflowedToasts = toasts.value.slice(MAX_VISIBLE_TOASTS)

  overflowToastCount.value += overflowedToasts.reduce((count, toast) => count + toast.count, 0)
  overflowToastVersion.value += 1
  toasts.value = toasts.value.slice(0, MAX_VISIBLE_TOASTS)
}

export function showToast(options: UiToastOptions) {
  const tone = options.tone ?? 'info'
  const signature = createToastSignature(options, tone)
  const existingToastIndex = toasts.value.findIndex(toast => toast.signature === signature)

  if (existingToastIndex >= 0) {
    const existingToast = toasts.value[existingToastIndex]
    const updatedToast: UiToastItem = {
      ...existingToast,
      count: existingToast.count + 1,
      duration: options.duration ?? existingToast.duration,
      action: options.action ?? existingToast.action,
      version: nextToastVersion++,
    }
    const remainingToasts = toasts.value.filter((_, index) => index !== existingToastIndex)

    toasts.value = [updatedToast, ...remainingToasts]
    compactToasts()
    return updatedToast.id
  }

  const toast: UiToastItem = {
    id: nextToastId++,
    count: 1,
    title: options.title,
    description: options.description,
    tone,
    duration: options.duration,
    action: options.action,
    signature,
    version: nextToastVersion++,
  }

  toasts.value = [toast, ...toasts.value]
  compactToasts()
  return toast.id
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

export function dismissOverflowToast() {
  overflowToastCount.value = 0
}
